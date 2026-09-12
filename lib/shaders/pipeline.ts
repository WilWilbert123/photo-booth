/**
 * WebGL Effect Pipeline
 * ─────────────────────
 * A self-contained, context-loss-safe WebGL renderer that:
 *  • Compiles & caches shader programs
 *  • Manages a single full-screen quad VAO
 *  • Renders any shader from programs.ts onto a target canvas
 *  • Falls back gracefully if WebGL is unavailable
 */

import { VERT } from './programs';

interface CompiledProgram {
  program: WebGLProgram;
  attribs: {
    a_position: number;
    a_texCoord: number;
  };
  uniforms: Map<string, WebGLUniformLocation | null>;
}

type UniformValue = number | number[];

export class WebGLPipeline {
  private gl: WebGLRenderingContext | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private programs = new Map<string, CompiledProgram>();
  private quadBuffer: WebGLBuffer | null = null;
  private texture: WebGLTexture | null = null;
  private _lost = false;

  /** Returns true if WebGL is usable */
  get available(): boolean {
    return this.gl !== null && !this._lost;
  }

  /** Lazy-init the WebGL context on an offscreen canvas */
  init(width: number, height: number): boolean {
    if (this.gl && !this._lost) return true;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;

    const gl = this.canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null;

    if (!gl) return false;

    this.gl = gl;
    this._lost = false;

    // Context loss / restore handlers
    this.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this._lost = true;
      this.programs.clear();
      this.quadBuffer = null;
      this.texture = null;
    });
    this.canvas.addEventListener('webglcontextrestored', () => {
      this._lost = false;
      this._initQuad();
    });

    this._initQuad();
    this._initTexture();

    return true;
  }

  private _initQuad(): void {
    const gl = this.gl!;
    // Full-screen quad: two triangles, position + texCoord interleaved
    const verts = new Float32Array([
      -1, -1,  0, 0,
       1, -1,  1, 0,
      -1,  1,  0, 1,
       1,  1,  1, 1,
    ]);
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  }

  private _initTexture(): void {
    const gl = this.gl!;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  private _compile(id: string, fragSrc: string): CompiledProgram | null {
    const gl = this.gl!;

    const compileShader = (type: number, src: string): WebGLShader | null => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`[WebGLPipeline] Shader compile error (${id}):`, gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = compileShader(gl.VERTEX_SHADER, VERT);
    const frag = compileShader(gl.FRAGMENT_SHADER, fragSrc);
    if (!vert || !frag) return null;

    const program = gl.createProgram()!;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.deleteShader(vert);
    gl.deleteShader(frag);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(`[WebGLPipeline] Program link error (${id}):`, gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    const compiled: CompiledProgram = {
      program,
      attribs: {
        a_position: gl.getAttribLocation(program, 'a_position'),
        a_texCoord: gl.getAttribLocation(program, 'a_texCoord'),
      },
      uniforms: new Map(),
    };

    // Enumerate all active uniforms
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) {
        compiled.uniforms.set(info.name, gl.getUniformLocation(program, info.name));
      }
    }

    return compiled;
  }

  private _getProgram(id: string, fragSrc: string): CompiledProgram | null {
    if (this.programs.has(id)) return this.programs.get(id)!;
    const p = this._compile(id, fragSrc);
    if (p) this.programs.set(id, p);
    return p;
  }

  /**
   * Upload a video/image frame as a WebGL texture and render with the given
   * fragment shader, then blit the result onto `targetCanvas`.
   */
  render(
    source: CanvasImageSource,
    targetCanvas: HTMLCanvasElement,
    shaderId: string,
    fragSrc: string,
    uniforms: Record<string, UniformValue>,
    width: number,
    height: number
  ): boolean {
    if (!this.available) return false;
    const gl = this.gl!;

    // Resize offscreen canvas if needed
    if (this.canvas!.width !== width || this.canvas!.height !== height) {
      this.canvas!.width = width;
      this.canvas!.height = height;
    }

    const p = this._getProgram(shaderId, fragSrc);
    if (!p) return false;

    gl.viewport(0, 0, width, height);
    gl.useProgram(p.program);

    // Upload source texture
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source as TexImageSource);
    gl.uniform1i(p.uniforms.get('u_texture') ?? null, 0);

    // Bind quad
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    const stride = 4 * 4; // 4 floats, 4 bytes each
    gl.enableVertexAttribArray(p.attribs.a_position);
    gl.vertexAttribPointer(p.attribs.a_position, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(p.attribs.a_texCoord);
    gl.vertexAttribPointer(p.attribs.a_texCoord, 2, gl.FLOAT, false, stride, 2 * 4);

    // Set uniforms
    for (const [name, value] of Object.entries(uniforms)) {
      const loc = p.uniforms.get(name) ?? gl.getUniformLocation(p.program, name);
      if (!loc) continue;
      if (typeof value === 'number') {
        gl.uniform1f(loc, value);
      } else if (value.length === 2) {
        gl.uniform2fv(loc, value);
      } else if (value.length === 3) {
        gl.uniform3fv(loc, value);
      } else if (value.length === 4) {
        gl.uniform4fv(loc, value);
      }
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Blit WebGL canvas → target canvas via 2D context
    const ctx2d = targetCanvas.getContext('2d');
    if (ctx2d) {
      if (targetCanvas.width !== width) targetCanvas.width = width;
      if (targetCanvas.height !== height) targetCanvas.height = height;
      ctx2d.drawImage(this.canvas!, 0, 0);
    }

    return true;
  }

  /** Free all GPU resources */
  dispose(): void {
    const gl = this.gl;
    if (!gl) return;
    this.programs.forEach((p) => gl.deleteProgram(p.program));
    this.programs.clear();
    if (this.quadBuffer) gl.deleteBuffer(this.quadBuffer);
    if (this.texture) gl.deleteTexture(this.texture);
    this.gl = null;
    this.canvas = null;
  }
}

// Singleton for the whole app
export const webglPipeline = new WebGLPipeline();
