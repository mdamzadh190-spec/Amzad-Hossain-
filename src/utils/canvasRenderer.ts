import {
  CanvasConfig,
  DrawingLayer,
  ImageLayer,
  Layer,
  ShapeLayer,
  StickerLayer,
  TextLayer,
} from '../types/pixellab';

// Cache for loaded images and SVG stickers
const imageCache: Map<string, HTMLImageElement> = new Map();
const svgCache: Map<string, HTMLImageElement> = new Map();

export function preloadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      // Create a fallback colored placeholder image
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 300;
      fallbackCanvas.height = 300;
      const ctx = fallbackCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 0, 300, 300);
        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Image', 150, 150);
      }
      const fallbackImg = new Image();
      fallbackImg.src = fallbackCanvas.toDataURL();
      fallbackImg.onload = () => {
        imageCache.set(src, fallbackImg);
        resolve(fallbackImg);
      };
    };
    img.src = src;
  });
}

export function preloadSvg(svgString: string, key: string): Promise<HTMLImageElement> {
  if (svgCache.has(key)) {
    return Promise.resolve(svgCache.get(key)!);
  }
  return new Promise((resolve) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      svgCache.set(key, img);
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      resolve(img);
    };
    img.src = url;
  });
}

// Convert hex to rgb
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

// Helper to darken a hex color for 3D extrusion
function adjustColorBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = 1 - percent / 100;
  const r = Math.max(0, Math.min(255, Math.floor(rgb.r * factor)));
  const g = Math.max(0, Math.min(255, Math.floor(rgb.g * factor)));
  const b = Math.max(0, Math.min(255, Math.floor(rgb.b * factor)));
  return `rgb(${r}, ${g}, ${b})`;
}

// Draw checkerboard for transparent canvas
export function drawCheckerboard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size = 16
) {
  const cols = Math.ceil(width / size);
  const rows = Math.ceil(height / size);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#1e293b' : '#0f172a';
      ctx.fillRect(x * size, y * size, size, size);
    }
  }
}

// Render background according to canvas configuration
export function renderCanvasBackground(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  isExport = false
) {
  const { width, height, bgType, bgColor, bgGradient, effects } = config;

  if (bgType === 'transparent') {
    if (!isExport) {
      drawCheckerboard(ctx, width, height, 20);
    } else {
      ctx.clearRect(0, 0, width, height);
      return;
    }
  } else if (bgType === 'color') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  } else if (bgType === 'gradient') {
    let grad: CanvasGradient;
    if (bgGradient.type === 'linear') {
      const rad = ((bgGradient.angle - 90) * Math.PI) / 180;
      const cx = width / 2;
      const cy = height / 2;
      const len = Math.sqrt(width * width + height * height) / 2;
      const x0 = cx - Math.cos(rad) * len;
      const y0 = cy - Math.sin(rad) * len;
      const x1 = cx + Math.cos(rad) * len;
      const y1 = cy + Math.sin(rad) * len;
      grad = ctx.createLinearGradient(x0, y0, x1, y1);
    } else {
      const maxR = Math.max(width, height) / 2;
      grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, maxR);
    }
    bgGradient.stops.forEach((stop) => {
      grad.addColorStop(stop.offset, stop.color);
    });
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Apply Vignette effect if enabled
  if (effects.vignette > 0) {
    const maxR = Math.sqrt(width * width + height * height) / 2;
    const vGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      maxR * (1 - effects.vignette / 100),
      width / 2,
      height / 2,
      maxR
    );
    vGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vGrad.addColorStop(1, effects.vignetteColor || '#000000');
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // Apply Stripes / Scanlines effect if enabled
  if (effects.stripes > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${(effects.stripes / 100) * 0.4})`;
    const stripeHeight = 4;
    const gap = 4;
    for (let y = 0; y < height; y += stripeHeight + gap) {
      ctx.fillRect(0, y, width, stripeHeight);
    }
  }

  // Apply Noise effect if enabled
  if (effects.noise > 0) {
    const noiseAlpha = (effects.noise / 100) * 0.15;
    ctx.fillStyle = `rgba(255, 255, 255, ${noiseAlpha})`;
    const density = Math.min(width * height * 0.05, 15000);
    for (let i = 0; i < density; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillRect(rx, ry, 1, 1);
    }
  }
}

// Draw shape path
function createShapePath(ctx: CanvasRenderingContext2D, layer: ShapeLayer) {
  const { shapeKind, width, height, cornerRadius } = layer;
  const w = width;
  const h = height;

  ctx.beginPath();
  switch (shapeKind) {
    case 'rectangle': {
      const r = Math.min(cornerRadius, w / 2, h / 2);
      ctx.roundRect(-w / 2, -h / 2, w, h, r);
      break;
    }
    case 'circle': {
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;
    }
    case 'triangle': {
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();
      break;
    }
    case 'star': {
      const spikes = 5;
      const outerRadius = Math.min(w, h) / 2;
      const innerRadius = outerRadius * 0.45;
      let rot = (Math.PI / 2) * 3;
      let x = 0;
      let y = 0;
      const step = Math.PI / spikes;

      ctx.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = Math.cos(rot) * outerRadius;
        y = Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(0, -outerRadius);
      ctx.closePath();
      break;
    }
    case 'heart': {
      const topCurveHeight = h * 0.3;
      ctx.moveTo(0, h / 2);
      ctx.bezierCurveTo(-w / 2, h / 5, -w / 2, -h / 2, 0, -topCurveHeight);
      ctx.bezierCurveTo(w / 2, -h / 2, w / 2, h / 5, 0, h / 2);
      ctx.closePath();
      break;
    }
    case 'hexagon': {
      const r = Math.min(w, h) / 2;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = r * Math.cos(angle);
        const hy = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      break;
    }
    case 'arrow': {
      const shaftH = h * 0.4;
      const headL = w * 0.4;
      ctx.moveTo(-w / 2, -shaftH / 2);
      ctx.lineTo(w / 2 - headL, -shaftH / 2);
      ctx.lineTo(w / 2 - headL, -h / 2);
      ctx.lineTo(w / 2, 0);
      ctx.lineTo(w / 2 - headL, h / 2);
      ctx.lineTo(w / 2 - headL, shaftH / 2);
      ctx.lineTo(-w / 2, shaftH / 2);
      ctx.closePath();
      break;
    }
    case 'speech_bubble': {
      const r = Math.min(16, w / 4);
      const bH = h * 0.8;
      ctx.roundRect(-w / 2, -h / 2, w, bH, r);
      ctx.moveTo(-w / 4, bH - h / 2);
      ctx.lineTo(-w / 4 + 20, h / 2);
      ctx.lineTo(-w / 4 + 30, bH - h / 2);
      break;
    }
    case 'shield': {
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(w / 2, -h / 3);
      ctx.lineTo(w / 2, h / 5);
      ctx.quadraticCurveTo(w / 2, h / 2, 0, h / 2);
      ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 5);
      ctx.lineTo(-w / 2, -h / 3);
      ctx.closePath();
      break;
    }
    case 'ribbon': {
      const bannerH = h * 0.7;
      ctx.moveTo(-w / 2, -bannerH / 2);
      ctx.lineTo(w / 2, -bannerH / 2);
      ctx.lineTo(w / 2 - 20, 0);
      ctx.lineTo(w / 2, bannerH / 2);
      ctx.lineTo(-w / 2, bannerH / 2);
      ctx.lineTo(-w / 2 + 20, 0);
      ctx.closePath();
      break;
    }
  }
}

// Render text layer with 3D extrusion, curved arc, stroke, and shadows
function renderTextLayer(ctx: CanvasRenderingContext2D, layer: TextLayer) {
  const {
    text,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    textDecoration,
    align,
    colorType,
    color,
    gradient,
    letterSpacing,
    lineHeight,
    curve,
    textBg,
    text3D,
    shadow,
    stroke,
    reflection,
  } = layer;

  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';

  // Apply letter spacing if supported
  if ('letterSpacing' in ctx && letterSpacing) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${letterSpacing}px`;
  }

  // Text Background Pill / Rect
  if (textBg?.enabled) {
    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const textH = fontSize * lineHeight;
    let bgX = 0;
    if (align === 'center') bgX = -textW / 2;
    else if (align === 'right') bgX = -textW;

    ctx.save();
    ctx.fillStyle = textBg.color;
    ctx.beginPath();
    ctx.roundRect(
      bgX - textBg.paddingX,
      -textH / 2 - textBg.paddingY,
      textW + textBg.paddingX * 2,
      textH + textBg.paddingY * 2,
      textBg.radius
    );
    ctx.fill();
    ctx.restore();
  }

  // Create text fill style
  let fillStyle: string | CanvasGradient = color;
  if (colorType === 'gradient' && gradient) {
    let grad: CanvasGradient;
    const textMetrics = ctx.measureText(text);
    const halfW = textMetrics.width / 2;
    if (gradient.type === 'linear') {
      const rad = ((gradient.angle - 90) * Math.PI) / 180;
      const x0 = -Math.cos(rad) * halfW;
      const y0 = -Math.sin(rad) * (fontSize / 2);
      const x1 = Math.cos(rad) * halfW;
      const y1 = Math.sin(rad) * (fontSize / 2);
      grad = ctx.createLinearGradient(x0, y0, x1, y1);
    } else {
      grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(halfW, fontSize));
    }
    gradient.stops.forEach((s) => grad.addColorStop(s.offset, s.color));
    fillStyle = grad;
  }

  // Handle Curved Text (Arc)
  if (curve && curve !== 0) {
    const radius = 600 / (curve / 100);
    const characters = text.split('');
    const totalMetrics = ctx.measureText(text);
    const totalW = totalMetrics.width;
    const totalAngle = totalW / radius;

    ctx.save();
    let currentAngle = -totalAngle / 2;

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      const charW = ctx.measureText(char).width;
      const charAngle = charW / radius;
      const angle = currentAngle + charAngle / 2;

      ctx.save();
      ctx.rotate(angle);
      ctx.translate(0, -radius);

      if (stroke?.enabled && stroke.width > 0) {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.strokeText(char, 0, 0);
      }
      ctx.fillStyle = fillStyle;
      ctx.fillText(char, 0, 0);

      ctx.restore();
      currentAngle += charAngle;
    }
    ctx.restore();
    return;
  }

  // 3D Text Extrusion (Signature PixelLab feature!)
  if (text3D?.enabled && text3D.depth > 0) {
    const dirRad = (text3D.direction * Math.PI) / 180;
    const dx = Math.cos(dirRad);
    const dy = Math.sin(dirRad);
    const depthSteps = Math.min(Math.floor(text3D.depth), 60);

    ctx.save();
    for (let i = depthSteps; i >= 1; i--) {
      const stepOffset = i;
      const darkenPercent = (text3D.darken || 40) * (i / depthSteps);
      const shadeColor = adjustColorBrightness(text3D.color || '#333333', darkenPercent);

      ctx.save();
      ctx.translate(dx * stepOffset, dy * stepOffset);
      ctx.fillStyle = shadeColor;
      if (stroke?.enabled && stroke.width > 0) {
        ctx.strokeStyle = adjustColorBrightness(stroke.color, darkenPercent);
        ctx.lineWidth = stroke.width;
        ctx.strokeText(text, 0, 0);
      }
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  // Drop Shadow
  if (shadow?.enabled) {
    ctx.shadowColor = shadow.color;
    ctx.shadowBlur = shadow.blur;
    ctx.shadowOffsetX = shadow.offsetX;
    ctx.shadowOffsetY = shadow.offsetY;
  }

  // Outer Stroke
  if (stroke?.enabled && stroke.width > 0) {
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, 0, 0);
  }

  // Main Text Fill
  ctx.fillStyle = fillStyle;
  ctx.fillText(text, 0, 0);

  // Underline
  if (textDecoration === 'underline') {
    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    let startX = 0;
    if (align === 'center') startX = -textW / 2;
    else if (align === 'right') startX = -textW;
    ctx.fillRect(startX, fontSize / 2 + 4, textW, Math.max(2, fontSize / 14));
  }

  // Reflection Effect
  if (reflection?.enabled) {
    ctx.save();
    ctx.scale(1, -1);
    ctx.translate(0, -fontSize - reflection.distance);
    ctx.globalAlpha = reflection.opacity || 0.35;
    ctx.fillStyle = fillStyle;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
}

// Render shape layer
function renderShapeLayer(ctx: CanvasRenderingContext2D, layer: ShapeLayer) {
  const { fillType, fillColor, fillGradient, strokeColor, strokeWidth, shadow, blurRadius, width } =
    layer;

  if (blurRadius > 0) {
    ctx.filter = `blur(${blurRadius}px)`;
  }

  if (shadow?.enabled) {
    ctx.shadowColor = shadow.color;
    ctx.shadowBlur = shadow.blur;
    ctx.shadowOffsetX = shadow.offsetX;
    ctx.shadowOffsetY = shadow.offsetY;
  }

  createShapePath(ctx, layer);

  // Fill
  if (fillColor !== 'transparent') {
    if (fillType === 'gradient' && fillGradient) {
      let grad: CanvasGradient;
      if (fillGradient.type === 'linear') {
        const rad = ((fillGradient.angle - 90) * Math.PI) / 180;
        const half = width / 2;
        grad = ctx.createLinearGradient(
          -Math.cos(rad) * half,
          -Math.sin(rad) * half,
          Math.cos(rad) * half,
          Math.sin(rad) * half
        );
      } else {
        grad = ctx.createRadialGradient(0, 0, 0, 0, 0, width / 2);
      }
      fillGradient.stops.forEach((s) => grad.addColorStop(s.offset, s.color));
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = fillColor;
    }
    ctx.fill();
  }

  // Stroke
  if (strokeWidth > 0 && strokeColor !== 'transparent') {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
}

// Render image layer
function renderImageLayer(ctx: CanvasRenderingContext2D, layer: ImageLayer) {
  const { src, width, height, shadow, stroke } = layer;
  const img = imageCache.get(src);
  if (!img || !img.complete) return;

  if (shadow?.enabled) {
    ctx.shadowColor = shadow.color;
    ctx.shadowBlur = shadow.blur;
    ctx.shadowOffsetX = shadow.offsetX;
    ctx.shadowOffsetY = shadow.offsetY;
  }

  ctx.drawImage(img, -width / 2, -height / 2, width, height);

  if (stroke?.enabled && stroke.width > 0) {
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  }
}

// Render sticker layer
function renderStickerLayer(ctx: CanvasRenderingContext2D, layer: StickerLayer) {
  const { stickerKey, width, height, shadow } = layer;
  const img = svgCache.get(stickerKey);
  if (!img || !img.complete) return;

  if (shadow?.enabled) {
    ctx.shadowColor = shadow.color;
    ctx.shadowBlur = shadow.blur;
    ctx.shadowOffsetX = shadow.offsetX;
    ctx.shadowOffsetY = shadow.offsetY;
  }

  ctx.drawImage(img, -width / 2, -height / 2, width, height);
}

// Render freehand drawing layer
function renderDrawingLayer(ctx: CanvasRenderingContext2D, layer: DrawingLayer) {
  const { strokes, shadow } = layer;
  if (!strokes || strokes.length === 0) return;

  ctx.save();
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.size;
    ctx.strokeStyle = stroke.color;

    if (stroke.neon) {
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = stroke.blur || 18;
    } else if (shadow?.enabled) {
      ctx.shadowColor = shadow.color;
      ctx.shadowBlur = shadow.blur;
      ctx.shadowOffsetX = shadow.offsetX;
      ctx.shadowOffsetY = shadow.offsetY;
    }

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// Main Layer Renderer
export function renderLayer(ctx: CanvasRenderingContext2D, layer: Layer) {
  if (!layer.visible) return;

  ctx.save();

  // Position, Rotation, Scale
  ctx.translate(layer.x, layer.y);
  if (layer.rotation) {
    ctx.rotate((layer.rotation * Math.PI) / 180);
  }
  ctx.scale(layer.scaleX, layer.scaleY);
  ctx.globalAlpha = layer.opacity;

  // 3D Rotation / Perspective tilt simulation
  if (layer.rotate3D?.enabled) {
    const rx = (layer.rotate3D.rotateX * Math.PI) / 180;
    const ry = (layer.rotate3D.rotateY * Math.PI) / 180;
    ctx.transform(Math.cos(ry), Math.sin(rx) * 0.4, 0, Math.cos(rx), 0, 0);
  }

  // Color Filters (brightness, contrast, hue, saturation)
  if (layer.colorFilter) {
    const { hue, saturation, brightness, contrast } = layer.colorFilter;
    const filters: string[] = [];
    if (hue !== 0) filters.push(`hue-rotate(${hue}deg)`);
    if (saturation !== 0) filters.push(`saturate(${100 + saturation}%)`);
    if (brightness !== 0) filters.push(`brightness(${100 + brightness}%)`);
    if (contrast !== 0) filters.push(`contrast(${100 + contrast}%)`);
    if (filters.length > 0) ctx.filter = filters.join(' ');
  }

  // Type-specific render
  switch (layer.type) {
    case 'text':
      renderTextLayer(ctx, layer);
      break;
    case 'shape':
      renderShapeLayer(ctx, layer);
      break;
    case 'image':
      renderImageLayer(ctx, layer);
      break;
    case 'sticker':
      renderStickerLayer(ctx, layer);
      break;
    case 'drawing':
      renderDrawingLayer(ctx, layer);
      break;
  }

  ctx.restore();
}

// Master Canvas Rendering Function
export function renderEntireCanvas(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  layers: Layer[],
  isExport = false
) {
  ctx.save();

  // Draw background
  renderCanvasBackground(ctx, config, isExport);

  // Draw layers from bottom to top
  for (const layer of layers) {
    renderLayer(ctx, layer);
  }

  ctx.restore();
}

// Export canvas at scale factor (e.g. 1x, 2x, 4x)
export async function exportCanvasToImage(
  config: CanvasConfig,
  layers: Layer[],
  scale = 1,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 0.95
): Promise<string> {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = config.width * scale;
  exportCanvas.height = config.height * scale;
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context for export');

  ctx.scale(scale, scale);
  renderEntireCanvas(ctx, config, layers, true);

  return exportCanvas.toDataURL(format, quality);
}

// Hit test to detect which layer user clicked on
export function hitTestLayer(layer: Layer, mouseX: number, mouseY: number): boolean {
  if (!layer.visible || layer.locked) return false;

  // Translate mouse coordinate to layer's local space
  const dx = mouseX - layer.x;
  const dy = mouseY - layer.y;

  const rad = (-layer.rotation * Math.PI) / 180;
  const localX = (dx * Math.cos(rad) - dy * Math.sin(rad)) / layer.scaleX;
  const localY = (dx * Math.sin(rad) + dy * Math.cos(rad)) / layer.scaleY;

  const halfW = layer.width / 2;
  const halfH = layer.height / 2;

  return localX >= -halfW && localX <= halfW && localY >= -halfH && localY <= halfH;
}
