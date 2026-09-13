import { PhotoStripConfig } from '@/types/photo';
import { getStripPreset, StripPreset } from './stripPresets';

/**
 * Generates a high-resolution, perfectly bounded photo strip Blob.
 * Everything is strictly contained inside the frame borders with no overflow.
 */
export async function createPhotoStripBlob(
  photoBlobs: Blob[],
  config: PhotoStripConfig
): Promise<Blob> {
  if (photoBlobs.length === 0) {
    throw new Error('No photos provided for strip generation');
  }

  // Load all images asynchronously
  const loadedImages: HTMLImageElement[] = await Promise.all(
    photoBlobs.map(
      (blob) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          const url = URL.createObjectURL(blob);
          img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load photo frame for strip'));
          };
          img.src = url;
        })
    )
  );

  const preset: StripPreset = getStripPreset(config.layout) || getStripPreset('classic-4');

  const backgroundColor = config.backgroundColor || preset.backgroundColor;
  const borderColor = config.borderColor || preset.borderColor;
  const textColor = config.textColor || config.headerColor || preset.textColor;
  const accentColor = preset.accentColor;
  const headerText = config.headerText ?? preset.defaultHeader;
  const subtitleText = config.subtitleText ?? preset.defaultSubtitle;
  const badgeText = config.badgeText ?? preset.badgeText;
  const showDate = config.showDate ?? true;
  const dateStr = config.dateText || new Date().toLocaleDateString('en-US', { dateStyle: 'medium' });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Determine number of photos to display
  // If user selected N photos, adapt to N (capped between 1 and preset.shotCount)
  // If user selected 1 photo on a multi-shot preset, cycle it to fill preset.shotCount or match selection
  const targetCount = Math.max(1, Math.min(loadedImages.length, preset.shotCount || 4));
  const items: HTMLImageElement[] = [];
  for (let i = 0; i < targetCount; i++) {
    items.push(loadedImages[i % loadedImages.length]);
  }

  // Sizing configuration
  const photoW = config.layout === 'polaroid' ? 600 : 560;
  const aspectRatio = preset.aspectRatio || 4 / 3;
  const photoH = Math.round(photoW / aspectRatio);
  const padding = config.padding ?? 20;
  const borderWidth = config.borderWidth ?? 18;
  const frameRadius = config.frameRadius ?? preset.frameRadius ?? 4;

  const imageOffsets = config.imageOffsets || [];

  if (config.layout === 'grid-2x2' || config.layout === 'grid-2x3') {
    // 2x2 or 2x3 Grid Layout (6-shot grid like user reference photo)
    const rows = config.layout === 'grid-2x3' ? 3 : 2;
    const cols = 2;
    const totalShots = rows * cols;

    const innerW = photoW * cols + padding * (cols - 1);
    const headerH = 100;
    const footerH = 75;
    const innerH = headerH + photoH * rows + padding * (rows - 1) + footerH;

    const canvasW = innerW + padding * 2 + borderWidth * 2;
    const canvasH = innerH + padding * 2 + borderWidth * 2;

    canvas.width = canvasW;
    canvas.height = canvasH;

    // 1. Outer Frame Border
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // 2. Inner Canvas Card (The clean square inside)
    const cardX = borderWidth;
    const cardY = borderWidth;
    const cardW = canvasW - borderWidth * 2;
    const cardH = canvasH - borderWidth * 2;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(cardX, cardY, cardW, cardH);

    const activePattern = config.themePattern || preset.pattern || 'none';
    renderPatternBackground(ctx, activePattern, cardX, cardY, cardW, cardH, backgroundColor);

    // Subtle inner accent line strictly inside
    ctx.strokeStyle = accentColor + '60';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cardX + 6, cardY + 6, cardW - 12, cardH - 12);

    // Header strictly inside
    drawHeader(ctx, canvasW / 2, cardY + 42, headerText, subtitleText, textColor, accentColor, preset.id);

    // Photos strictly inside
    const startY = cardY + headerH + padding;
    for (let i = 0; i < totalShots; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const img = items[i % items.length];
      const x = cardX + padding + col * (photoW + padding);
      const y = startY + row * (photoH + padding);
      const off = imageOffsets[i] || { x: 0.5, y: 0.5 };

      drawRoundedImage(ctx, img, x, y, photoW, photoH, frameRadius, off.x, off.y);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, photoW, photoH);
    }

    // Footer strictly inside
    const footerCenterY = cardY + cardH - footerH / 2;
    drawFooterBadge(ctx, canvasW / 2, footerCenterY, badgeText, showDate ? dateStr : null, textColor, accentColor, preset.decorationType);
  } else if (config.layout === 'polaroid') {
    // Single Polaroid Layout
    const canvasW = 680;
    const canvasH = 820;
    canvas.width = canvasW;
    canvas.height = canvasH;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    const activePattern = config.themePattern || preset.pattern || 'none';
    renderPatternBackground(ctx, activePattern, 0, 0, canvasW, canvasH, backgroundColor);

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvasW - 4, canvasH - 4);

    const photoSize = 580;
    const photoX = (canvasW - photoSize) / 2;
    const photoY = 35;
    if (items[0]) {
      const off = imageOffsets[0] || { x: 0.5, y: 0.5 };
      drawRoundedImage(ctx, items[0], photoX, photoY, photoSize, photoSize, 4, off.x, off.y);
    }

    ctx.fillStyle = '#18181B';
    ctx.font = 'bold 30px "Georgia", serif';
    ctx.textAlign = 'center';
    ctx.fillText(headerText, canvasW / 2, 680);

    if (showDate) {
      ctx.font = '16px "Courier New", monospace';
      ctx.fillStyle = '#71717A';
      ctx.fillText(dateStr, canvasW / 2, 725);
    }
  } else {
    // Vertical Strip Layouts
    const extraLeftPadding = preset.hasFrameNumbers ? 36 : 0;
    const contentW = photoW + extraLeftPadding;
    const innerW = contentW + padding * 2;
    const canvasW = innerW + borderWidth * 2;

    const hasHeaderContent = !!(headerText && (headerText.trim() || subtitleText.trim()));
    const fitExact = config.fitExactEdges || (padding === 0 && !hasHeaderContent);

    const headerH = preset.id === 'pirate-wanted' ? 135 : (hasHeaderContent ? 105 : (fitExact ? 0 : 18));
    const footerH = showDate ? 70 : (fitExact ? 0 : 18);
    const photosTotalH = items.length * photoH + (items.length - 1) * padding;
    const innerH = headerH + photosTotalH + footerH + (fitExact ? 0 : padding * 2);
    const canvasH = innerH + borderWidth * 2;

    canvas.width = canvasW;
    canvas.height = canvasH;

    // 1. Fill Outer Frame Border
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // 2. Fill Inner Square (Everything is strictly bounded inside this!)
    const cardX = borderWidth;
    const cardY = borderWidth;
    const cardW = canvasW - borderWidth * 2;
    const cardH = canvasH - borderWidth * 2;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(cardX, cardY, cardW, cardH);

    const activePattern = config.themePattern || preset.pattern || 'none';
    renderPatternBackground(ctx, activePattern, cardX, cardY, cardW, cardH, backgroundColor);

    // 3. Inner Decorative Framing (strictly inside card)
    if (preset.id === 'pirate-wanted') {
      // Vintage Wanted poster inner line
      ctx.strokeStyle = '#854D0E';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(cardX + 12, cardY + 12, cardW - 24, cardH - 24);
      ctx.setLineDash([]);
    } else if (preset.id === 'black-hat' || preset.id === 'software-engineer') {
      // Cyber corner notches strictly inside
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(cardX + 8, cardY + 8, cardW - 16, cardH - 16);
    } else if (preset.pattern) {
      // No border overlay for patterned designs to let pattern pop cleanly
    } else {
      // Delicate accent border line strictly inside
      ctx.strokeStyle = accentColor + '70';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cardX + 6, cardY + 6, cardW - 12, cardH - 12);
    }

    // 4. Header (strictly inside top)
    if (hasHeaderContent || preset.id === 'pirate-wanted') {
      const headerCenterY = cardY + (preset.id === 'pirate-wanted' ? 50 : 38);
      drawHeader(
        ctx,
        canvasW / 2,
        headerCenterY,
        headerText,
        subtitleText,
        textColor,
        accentColor,
        preset.id
      );

      // Header Icon
      drawDecorationIcon(ctx, canvasW / 2, cardY + 16, preset.decorationType, accentColor);
    }

    // 5. Photos Stack (strictly inside card boundaries)
    let currentY = cardY + (headerH > 0 ? headerH + padding : (fitExact ? 0 : padding));
    for (let i = 0; i < items.length; i++) {
      const img = items[i];
      const photoX = cardX + (fitExact ? 0 : padding) + extraLeftPadding;
      const off = imageOffsets[i] || { x: 0.5, y: 0.5 };

      // Korean style frame index (01, 02, 03, 04)
      if (preset.hasFrameNumbers) {
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 15px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`0${i + 1}`, cardX + padding + 14, currentY + photoH / 2);
      }

      // Draw photo with rounded corners
      drawRoundedImage(ctx, img, photoX, currentY, photoW, photoH, frameRadius, off.x, off.y);

      // Photo outline
      ctx.strokeStyle = accentColor + '50';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(photoX, currentY, photoW, photoH);

      currentY += photoH + padding;
    }

    // 6. Footer (strictly inside bottom of card)
    if (footerH > 0) {
      const footerCenterY = cardY + cardH - footerH / 2;
      if (preset.hasBarcode) {
        drawBarcode(ctx, cardX + padding, footerCenterY - 14, 100, 28, textColor);
        drawFooterBadge(ctx, canvasW / 2 + 45, footerCenterY, badgeText, showDate ? dateStr : null, textColor, accentColor, preset.decorationType);
      } else {
        drawFooterBadge(ctx, canvasW / 2, footerCenterY, badgeText, showDate ? dateStr : null, textColor, accentColor, preset.decorationType);
      }
    }
  }

  // Export to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to output photo strip blob'));
      },
      'image/jpeg',
      0.95
    );
  });
}

function drawRoundedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  offsetPercentX: number = 0.5,
  offsetPercentY: number = 0.5
) {
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();

  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = w / h;

  let renderW = w;
  let renderH = h;
  let offsetX = 0;
  let offsetY = 0;

  const clampX = Math.max(0, Math.min(1, offsetPercentX));
  const clampY = Math.max(0, Math.min(1, offsetPercentY));

  if (imgRatio > targetRatio) {
    renderW = h * imgRatio;
    const extraWidth = renderW - w;
    offsetX = -extraWidth * clampX;
  } else {
    renderH = w / imgRatio;
    const extraHeight = renderH - h;
    offsetY = -extraHeight * clampY;
  }

  ctx.drawImage(img, x + offsetX, y + offsetY, renderW, renderH);
  ctx.restore();
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  startY: number,
  title: string,
  subtitle: string,
  textColor: string,
  accentColor: string,
  presetId: string
) {
  ctx.save();
  ctx.textAlign = 'center';

  if (presetId === 'pirate-wanted') {
    ctx.fillStyle = textColor;
    ctx.font = '900 44px "Impact", "Georgia", serif';
    ctx.letterSpacing = '6px';
    ctx.fillText(title.toUpperCase(), centerX, startY);

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 130, startY + 10);
    ctx.lineTo(centerX + 130, startY + 10);
    ctx.moveTo(centerX - 90, startY + 15);
    ctx.lineTo(centerX + 90, startY + 15);
    ctx.stroke();

    if (subtitle) {
      ctx.fillStyle = '#854D0E';
      ctx.font = '900 18px "Impact", "Arial Black", sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText(subtitle.toUpperCase(), centerX, startY + 38);
    }
  } else if (presetId === 'software-engineer' || presetId === 'black-hat' || presetId === 'red-hat') {
    ctx.fillStyle = textColor;
    ctx.font = '900 24px "Courier New", monospace';
    ctx.letterSpacing = '2px';
    ctx.fillText(`> ${title.toUpperCase()}`, centerX, startY);

    if (subtitle) {
      ctx.fillStyle = accentColor;
      ctx.font = '600 12px "Courier New", monospace';
      ctx.fillText(subtitle, centerX, startY + 20);
    }
  } else {
    ctx.fillStyle = textColor;
    ctx.font = '900 26px "Inter", "Arial Black", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(title.toUpperCase(), centerX, startY);

    if (subtitle) {
      ctx.fillStyle = accentColor;
      ctx.font = '600 12px sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(subtitle, centerX, startY + 20);
    }
  }

  ctx.restore();
}

function drawFooterBadge(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  badgeText: string,
  dateStr: string | null,
  textColor: string,
  accentColor: string,
  decorationType: StripPreset['decorationType']
) {
  ctx.save();
  ctx.textAlign = 'center';

  if (badgeText) {
    ctx.font = 'bold 11px "Inter", sans-serif';
    const textWidth = ctx.measureText(badgeText.toUpperCase()).width;
    const badgeW = textWidth + 22;
    const badgeH = 24;

    ctx.fillStyle = 'rgba(128, 128, 128, 0.12)';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(centerX - badgeW / 2, centerY - 12, badgeW, badgeH, 12);
    } else {
      ctx.rect(centerX - badgeW / 2, centerY - 12, badgeW, badgeH);
    }
    ctx.fill();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.fillText(badgeText.toUpperCase(), centerX, centerY + 4);
  }

  if (dateStr) {
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.7;
    ctx.font = '11px "Courier New", monospace';
    ctx.fillText(dateStr, centerX, centerY + 24);
    ctx.globalAlpha = 1.0;
  }

  ctx.restore();
}

function drawDecorationIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: StripPreset['decorationType'],
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  if (type === 'pirate') {
    ctx.beginPath();
    ctx.arc(x, y - 2, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x, y + 8);
    ctx.arc(x, y + 5, 6, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else if (type === 'terminal' || type === 'hacker') {
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('{ < / > }', x, y + 4);
  } else if (type === 'shield') {
    ctx.beginPath();
    ctx.moveTo(x - 7, y - 5);
    ctx.lineTo(x + 7, y - 5);
    ctx.lineTo(x + 7, y);
    ctx.quadraticCurveTo(x + 7, y + 7, x, y + 10);
    ctx.quadraticCurveTo(x - 7, y + 7, x - 7, y);
    ctx.closePath();
    ctx.stroke();
  } else if (type === 'hearts') {
    drawHeart(ctx, x - 9, y, 8);
    drawHeart(ctx, x + 9, y, 8);
  } else if (type === 'sparkles') {
    drawSparkle(ctx, x - 10, y, 6);
    drawSparkle(ctx, x + 10, y, 6);
  } else if (type === 'crown') {
    ctx.beginPath();
    ctx.moveTo(x - 9, y + 4);
    ctx.lineTo(x - 11, y - 4);
    ctx.lineTo(x - 4, y);
    ctx.lineTo(x, y - 6);
    ctx.lineTo(x + 4, y);
    ctx.lineTo(x + 11, y - 4);
    ctx.lineTo(x + 9, y + 4);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'lock') {
    ctx.strokeRect(x - 5, y - 2, 10, 8);
    ctx.beginPath();
    ctx.arc(x, y - 2, 3.5, Math.PI, 0);
    ctx.stroke();
  } else if (type === 'family') {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.stroke();
    drawSparkle(ctx, x, y, 3.5);
  }

  ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + size / 4);
  ctx.quadraticCurveTo(x, y, x - size / 2, y);
  ctx.quadraticCurveTo(x - size, y, x - size, y + size / 2);
  ctx.quadraticCurveTo(x - size, y + size, x, y + size * 1.3);
  ctx.quadraticCurveTo(x + size, y + size, x + size, y + size / 2);
  ctx.quadraticCurveTo(x + size, y, x + size / 2, y);
  ctx.quadraticCurveTo(x, y, x, y + size / 4);
  ctx.fill();
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function drawBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;

  const barWidths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2];
  let currentX = x;

  for (let i = 0; i < barWidths.length; i++) {
    const bw = barWidths[i];
    if (i % 2 === 0) {
      ctx.fillRect(currentX, y, bw, height);
    }
    currentX += bw + 1;
    if (currentX > x + width) break;
  }

  ctx.restore();
}

function renderPatternBackground(
  ctx: CanvasRenderingContext2D,
  pattern: string,
  x: number,
  y: number,
  w: number,
  h: number,
  bgColor: string
) {
  if (!pattern || pattern === 'none') return;

  if (pattern === 'hearts') {
    drawHeartPattern(ctx, x, y, w, h);
  } else if (pattern === 'floral') {
    drawFloralPattern(ctx, x, y, w, h);
  } else if (pattern === 'celestial') {
    drawCelestialPattern(ctx, x, y, w, h, bgColor);
  } else if (pattern === 'nature') {
    drawNaturePattern(ctx, x, y, w, h);
  } else if (pattern === 'sparkles') {
    drawSparklePattern(ctx, x, y, w, h);
  } else if (pattern === 'cyber') {
    drawCyberPattern(ctx, x, y, w, h);
  } else if (pattern === 'cherries') {
    drawCherriesPattern(ctx, x, y, w, h);
  } else if (pattern === 'bows') {
    drawBowsPattern(ctx, x, y, w, h);
  } else if (pattern === 'stars') {
    drawStarsPattern(ctx, x, y, w, h);
  } else if (pattern === 'leopard') {
    drawLeopardPattern(ctx, x, y, w, h);
  } else if (pattern === 'clouds') {
    drawCloudsPattern(ctx, x, y, w, h);
  } else if (pattern === 'checkered') {
    drawCheckeredPattern(ctx, x, y, w, h);
  }
}

function drawHeartPattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.fillStyle = '#EF4444'; // Bold red hearts
  const stepX = 100;
  const stepY = 100;

  for (let py = y - 40; py < y + h + 80; py += stepY) {
    const rowOffset = (Math.floor((py - y) / stepY) % 2) * 50;
    for (let px = x - 40; px < x + w + 80; px += stepX) {
      drawHeart(ctx, px + rowOffset, py, 36);
    }
  }
  ctx.restore();
}

function drawFloralPattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const stepX = 120;
  const stepY = 120;
  const colors = ['#F43F5E', '#FB7185', '#FACC15', '#34D399', '#818CF8'];

  for (let py = y - 30; py < y + h + 80; py += stepY) {
    const rowOffset = (Math.floor((py - y) / stepY) % 2) * 60;
    for (let px = x - 30; px < x + w + 80; px += stepX) {
      const cx = px + rowOffset;
      const cy = py;

      // Draw leaves
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.ellipse(cx - 16, cy + 12, 12, 6, Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(cx + 16, cy - 12, 12, 6, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw 5 flower petals
      const petalColor = colors[Math.abs(Math.floor(cx * 3 + cy * 7)) % colors.length];
      ctx.fillStyle = petalColor;
      for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 5) {
        const petX = cx + Math.cos(a) * 14;
        const petY = cy + Math.sin(a) * 14;
        ctx.beginPath();
        ctx.arc(petX, petY, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center of flower
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawCelestialPattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, bgColor: string) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const stepX = 110;
  const stepY = 110;

  for (let py = y - 20; py < y + h + 60; py += stepY) {
    const rowOffset = (Math.floor((py - y) / stepY) % 2) * 55;
    for (let px = x - 20; px < x + w + 60; px += stepX) {
      const cx = px + rowOffset;
      const cy = py;
      const isMoon = Math.floor((cx + cy) / 100) % 2 === 0;

      if (isMoon) {
        // Full Moon Circle
        ctx.fillStyle = '#EAB308';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();

        // Dynamic Cutout using chosen background color
        ctx.fillStyle = bgColor || '#0B0F19';
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 4, 12, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#38BDF8';
        drawSparkle(ctx, cx, cy, 12);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawNaturePattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const stepX = 120;
  const stepY = 120;

  for (let py = y - 20; py < y + h + 60; py += stepY) {
    const rowOffset = (Math.floor((py - y) / stepY) % 2) * 60;
    for (let px = x - 20; px < x + w + 60; px += stepX) {
      const cx = px + rowOffset;
      const cy = py;
      const type = Math.abs(Math.floor((cx * 2 + cy * 5) / 100)) % 3;

      if (type === 0) {
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * 15, cy + Math.sin(a) * 15);
          ctx.lineTo(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20);
          ctx.stroke();
        }
      } else if (type === 1) {
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 18);
        ctx.lineTo(cx - 12, cy + 6);
        ctx.lineTo(cx - 6, cy + 6);
        ctx.lineTo(cx - 14, cy + 16);
        ctx.lineTo(cx + 14, cy + 16);
        ctx.lineTo(cx + 6, cy + 6);
        ctx.lineTo(cx + 12, cy + 6);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#78350F';
        ctx.fillRect(cx - 2, cy + 16, 4, 6);
      } else {
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(cx - 8, cy, 8, 0, Math.PI * 2);
        ctx.arc(cx + 8, cy, 8, 0, Math.PI * 2);
        ctx.arc(cx, cy - 6, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawSparklePattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const stepX = 90;
  const stepY = 90;

  for (let py = y - 20; py < y + h + 60; py += stepY) {
    const rowOffset = (Math.floor((py - y) / stepY) % 2) * 45;
    for (let px = x - 20; px < x + w + 60; px += stepX) {
      const cx = px + rowOffset;
      const cy = py;
      ctx.fillStyle = '#A855F7';
      drawSparkle(ctx, cx, cy, 14);
      ctx.fillStyle = '#F472B6';
      drawSparkle(ctx, cx + 18, cy + 18, 8);
    }
  }
  ctx.restore();
}

function drawCyberPattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.fillStyle = '#00FF66';
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.globalAlpha = 0.35;
  const stepX = 100;
  const stepY = 80;

  for (let py = y - 10; py < y + h + 40; py += stepY) {
    const rowOffset = (Math.floor((py - y) / stepY) % 2) * 50;
    for (let px = x - 10; px < x + w + 40; px += stepX) {
      ctx.fillText('{ </ > }', px + rowOffset, py);
    }
  }
  ctx.globalAlpha = 1.0;
  ctx.restore();
}

function drawCherriesPattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const stepX = 110;
  const stepY = 110;

  for (let py = y - 30; py < y + h + 70; py += stepY) {
    const rowOffset = (Math.floor((py - y) / stepY) % 2) * 55;
    for (let px = x - 30; px < x + w + 70; px += stepX) {
      const cx = px + rowOffset;
      const cy = py;

      // Stems
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + 6);
      ctx.quadraticCurveTo(cx, cy - 14, cx + 2, cy - 16);
      ctx.moveTo(cx + 8, cy + 6);
      ctx.quadraticCurveTo(cx, cy - 14, cx + 2, cy - 16);
      ctx.stroke();

      // Leaf
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.ellipse(cx + 6, cy - 16, 7, 3.5, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Double Red Cherries
      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.arc(cx - 8, cy + 6, 8, 0, Math.PI * 2);
      ctx.arc(cx + 8, cy + 6, 8, 0, Math.PI * 2);
      ctx.fill();

      // Gloss Highlights
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(cx - 10, cy + 4, 2.5, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy + 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }
  ctx.restore();
}

function drawBowsPattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const stepX = 115;
  const stepY = 115;

  for (let py = y - 30; py < y + h + 70; py += stepY) {
    const rowOffset = (Math.floor((py - y) / stepY) % 2) * 58;
    for (let px = x - 30; px < x + w + 70; px += stepX) {
      const cx = px + rowOffset;
      const cy = py;

      ctx.fillStyle = '#F472B6';
      // Left Loop
      ctx.beginPath();
      ctx.ellipse(cx - 11, cy - 2, 10, 6, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      // Right Loop
      ctx.beginPath();
      ctx.ellipse(cx + 11, cy - 2, 10, 6, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Ribbon Tails
      ctx.strokeStyle = '#F472B6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy + 2);
      ctx.lineTo(cx - 10, cy + 14);
      ctx.moveTo(cx + 2, cy + 2);
      ctx.lineTo(cx + 10, cy + 14);
      ctx.stroke();

      // Knot Center
      ctx.fillStyle = '#DB2777';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawStarsPattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const stepX = 100;
  const stepY = 100;

  for (let py = y - 20; py < y + h + 60; py += stepY) {
    const rowOffset = (Math.floor((py - y) / stepY) % 2) * 50;
    for (let px = x - 20; px < x + w + 60; px += stepX) {
      const cx = px + rowOffset;
      const cy = py;

      ctx.fillStyle = '#F59E0B';
      drawSparkle(ctx, cx, cy, 15);

      ctx.fillStyle = '#FCD34D';
      drawSparkle(ctx, cx + 22, cy + 22, 7);

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - 18, cy + 18, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawLeopardPattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const stepX = 90;
  const stepY = 90;

  for (let py = y - 20; py < y + h + 50; py += stepY) {
    const rowOffset = (Math.floor((py - y) / stepY) % 2) * 45;
    for (let px = x - 20; px < x + w + 50; px += stepX) {
      const cx = px + rowOffset;
      const cy = py;

      // Center Tan Fill
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 10, 7, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Outer Dark Spots
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 3, 6, Math.PI * 0.7, Math.PI * 1.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 5, cy + 3, 6, Math.PI * 1.7, Math.PI * 2.8);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCloudsPattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const stepX = 130;
  const stepY = 110;

  for (let py = y - 20; py < y + h + 60; py += stepY) {
    const rowOffset = (Math.floor((py - y) / stepY) % 2) * 65;
    for (let px = x - 20; px < x + w + 60; px += stepX) {
      const cx = px + rowOffset;
      const cy = py;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(cx - 10, cy, 10, 0, Math.PI * 2);
      ctx.arc(cx + 10, cy, 10, 0, Math.PI * 2);
      ctx.arc(cx, cy - 8, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38BDF8';
      drawSparkle(ctx, cx + 22, cy - 14, 5);
    }
  }
  ctx.restore();
}

function drawCheckeredPattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  const tileSize = 32;

  for (let py = y; py < y + h; py += tileSize) {
    const rowIdx = Math.floor((py - y) / tileSize);
    for (let px = x; px < x + w; px += tileSize) {
      const colIdx = Math.floor((px - x) / tileSize);
      if ((rowIdx + colIdx) % 2 === 0) {
        ctx.fillRect(px, py, tileSize, tileSize);
      }
    }
  }
  ctx.restore();
}
