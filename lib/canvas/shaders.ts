export const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

export const SHADER_PROGRAMS = {
  fisheye: `
    precision mediump float;
    uniform sampler2D u_image;
    uniform float u_strength;
    varying vec2 v_texCoord;

    void main() {
      vec2 p = v_texCoord - 0.5;
      float r = length(p);
      float strength = mix(0.0, 0.4, u_strength / 100.0);
      vec2 uv = 0.5 + p * (1.0 + strength * r * r);
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      } else {
        gl_FragColor = texture2D(u_image, uv);
      }
    }
  `,

  rgbShift: `
    precision mediump float;
    uniform sampler2D u_image;
    uniform float u_strength;
    varying vec2 v_texCoord;

    void main() {
      float amount = mix(0.0, 0.02, u_strength / 100.0);
      float r = texture2D(u_image, v_texCoord + vec2(amount, 0.0)).r;
      float g = texture2D(u_image, v_texCoord).g;
      float b = texture2D(u_image, v_texCoord - vec2(amount, 0.0)).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,

  scanlines: `
    precision mediump float;
    uniform sampler2D u_image;
    uniform float u_strength;
    varying vec2 v_texCoord;

    void main() {
      vec4 texColor = texture2D(u_image, v_texCoord);
      float count = 300.0;
      float sl = sin(v_texCoord.y * count * 3.14159);
      float intensity = mix(0.0, 0.3, u_strength / 100.0);
      vec3 color = texColor.rgb * (1.0 - intensity + intensity * sl);
      gl_FragColor = vec4(color, texColor.a);
    }
  `,

  kaleidoscope: `
    precision mediump float;
    uniform sampler2D u_image;
    uniform float u_strength;
    varying vec2 v_texCoord;

    void main() {
      vec2 p = v_texCoord - 0.5;
      float r = length(p);
      float a = atan(p.y, p.x);
      float sides = 6.0;
      float tau = 6.28318530718;
      a = mod(a, tau / sides);
      a = abs(a - tau / sides / 2.0);
      vec2 uv = r * vec2(cos(a), sin(a)) + 0.5;
      uv = clamp(uv, 0.0, 1.0);
      gl_FragColor = texture2D(u_image, uv);
    }
  `,
};
