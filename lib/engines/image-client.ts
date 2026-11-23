'use client';

import { hexToRgb, rgbToHex, rgbToHsl } from '../core/productivity';

export type ImageOutputFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/bmp';

export async function loadFileAsImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`تعذر قراءة الصورة «${file.name}». تأكد من سلامة الملف.`));
    };
    img.src = url;
  });
}

export function getExtensionFromMime(mime: ImageOutputFormat): string {
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/bmp':
      return 'bmp';
    default:
      return 'jpg';
  }
}

export async function processImageTransform(
  file: File,
  options: {
    format?: ImageOutputFormat;
    quality?: number; // 0.1 - 1
    targetWidth?: number;
    targetHeight?: number;
    maxDimension?: number;
    rotateDeg?: number;
    flipH?: boolean;
    flipV?: boolean;
    bgColorForJpg?: string;
    cropRect?: { x: number; y: number; width: number; height: number };
    watermark?: {
      text: string;
      colorHex: string;
      opacity: number;
      fontSize: number;
      position: 'center' | 'bottom-right' | 'bottom-left' | 'top-right';
    };
  }
): Promise<{ blob: Blob; width: number; height: number; previewUrl: string }> {
  const img = await loadFileAsImage(file);

  const sx = options.cropRect ? Math.max(0, Math.round(options.cropRect.x)) : 0;
  const sy = options.cropRect ? Math.max(0, Math.round(options.cropRect.y)) : 0;
  const sw = options.cropRect
    ? Math.max(1, Math.min(img.naturalWidth - sx, Math.round(options.cropRect.width)))
    : img.naturalWidth;
  const sh = options.cropRect
    ? Math.max(1, Math.min(img.naturalHeight - sy, Math.round(options.cropRect.height)))
    : img.naturalHeight;

  let outW = options.targetWidth || sw;
  let outH = options.targetHeight || sh;

  if (options.maxDimension && (outW > options.maxDimension || outH > options.maxDimension)) {
    const ratio = Math.min(options.maxDimension / outW, options.maxDimension / outH);
    outW = Math.max(1, Math.round(outW * ratio));
    outH = Math.max(1, Math.round(outH * ratio));
  }

  const rad = ((options.rotateDeg ?? 0) * Math.PI) / 180;
  const absCos = Math.abs(Math.cos(rad));
  const absSin = Math.abs(Math.sin(rad));
  const finalW = Math.max(1, Math.round(outW * absCos + outH * absSin));
  const finalH = Math.max(1, Math.round(outW * absSin + outH * absCos));

  const canvas = document.createElement('canvas');
  canvas.width = finalW;
  canvas.height = finalH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('تعذر تهيئة محرك الصور في المتصفح.');

  const format: ImageOutputFormat =
    options.format ??
    (file.type === 'image/png'
      ? 'image/png'
      : file.type === 'image/webp'
        ? 'image/webp'
        : 'image/jpeg');

  if (format === 'image/jpeg' || format === 'image/bmp') {
    ctx.fillStyle = options.bgColorForJpg || '#FFFFFF';
    ctx.fillRect(0, 0, finalW, finalH);
  }

  ctx.save();
  ctx.translate(finalW / 2, finalH / 2);
  ctx.rotate(rad);
  ctx.scale(options.flipH ? -1 : 1, options.flipV ? -1 : 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sw, sh, -outW / 2, -outH / 2, outW, outH);
  ctx.restore();

  if (options.watermark && options.watermark.text.trim()) {
    const wm = options.watermark;
    ctx.save();
    ctx.globalAlpha = Math.max(0.05, Math.min(1, wm.opacity));
    ctx.fillStyle = wm.colorHex;
    const scaledSize = Math.max(14, Math.round((wm.fontSize / 100) * Math.min(finalW, finalH) * 0.18));
    ctx.font = `700 ${scaledSize}px "IBM Plex Sans Arabic", "Cairo", sans-serif`;
    ctx.textBaseline = 'middle';

    const pad = Math.max(20, Math.round(finalW * 0.03));
    if (wm.position === 'center') {
      ctx.textAlign = 'center';
      ctx.fillText(wm.text, finalW / 2, finalH / 2);
    } else if (wm.position === 'bottom-right') {
      ctx.textAlign = 'right';
      ctx.fillText(wm.text, finalW - pad, finalH - pad - scaledSize / 2);
    } else if (wm.position === 'bottom-left') {
      ctx.textAlign = 'left';
      ctx.fillText(wm.text, pad, finalH - pad - scaledSize / 2);
    } else {
      ctx.textAlign = 'right';
      ctx.fillText(wm.text, finalW - pad, pad + scaledSize / 2);
    }
    ctx.restore();
  }

  const mimeToUse = format === 'image/bmp' ? 'image/png' : format;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('فشل تصدير الصورة.'))),
      mimeToUse,
      options.quality ?? 0.85
    );
  });

  return {
    blob,
    width: finalW,
    height: finalH,
    previewUrl: URL.createObjectURL(blob),
  };
}

export interface ExtractedColorSwatch {
  hex: string;
  rgb: string;
  hsl: string;
  percent: number;
}

export async function extractDominantColors(
  file: File,
  count = 8
): Promise<ExtractedColorSwatch[]> {
  const img = await loadFileAsImage(file);
  const canvas = document.createElement('canvas');
  const maxSide = 120;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Quantize RGB into buckets of size 24 to group visually similar shades
  const buckets = new Map<string, { rSum: number; gSum: number; bSum: number; count: number }>();
  let totalValid = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${Math.floor(r / 24)}-${Math.floor(g / 24)}-${Math.floor(b / 24)}`;
    const existing = buckets.get(key) ?? { rSum: 0, gSum: 0, bSum: 0, count: 0 };
    existing.rSum += r;
    existing.gSum += g;
    existing.bSum += b;
    existing.count += 1;
    buckets.set(key, existing);
    totalValid++;
  }

  if (totalValid === 0) return [];

  const sorted = Array.from(buckets.values()).sort((a, b) => b.count - a.count);
  const picked: ExtractedColorSwatch[] = [];

  for (const bucket of sorted) {
    const r = Math.round(bucket.rSum / bucket.count);
    const g = Math.round(bucket.gSum / bucket.count);
    const b = Math.round(bucket.bSum / bucket.count);

    // Ensure picked colors are distinct enough from each other
    const tooClose = picked.some((p) => {
      const prgb = hexToRgb(p.hex);
      if (!prgb) return false;
      const dist = Math.hypot(prgb.r - r, prgb.g - g, prgb.b - b);
      return dist < 38;
    });

    if (tooClose) continue;
    const hex = rgbToHex({ r, g, b });
    const hsl = rgbToHsl({ r, g, b });
    picked.push({
      hex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      percent: Math.max(1, Math.round((bucket.count / totalValid) * 100)),
    });
    if (picked.length >= count) break;
  }

  return picked;
}

/**
 * Flood-fill or global color-distance background removal on ImageData.
 */
export function removeColorFromImageData(
  sourceData: ImageData,
  targetRgb: { r: number; g: number; b: number },
  tolerance: number, // 0 - 120
  mode: 'flood-corners' | 'global-color' | 'flood-point',
  startPoint?: { x: number; y: number }
): ImageData {
  const { width, height, data } = sourceData;
  const output = new Uint8ClampedArray(data);
  const maxDist = tolerance * 2.5;

  const colorDist = (idx: number) => {
    const dr = output[idx] - targetRgb.r;
    const dg = output[idx + 1] - targetRgb.g;
    const db = output[idx + 2] - targetRgb.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  if (mode === 'global-color') {
    for (let i = 0; i < output.length; i += 4) {
      if (output[i + 3] === 0) continue;
      const dist = colorDist(i);
      if (dist <= maxDist) {
        if (dist > maxDist * 0.78) {
          const factor = (dist - maxDist * 0.78) / (maxDist * 0.22);
          output[i + 3] = Math.round(output[i + 3] * factor);
        } else {
          output[i + 3] = 0;
        }
      }
    }
    return new ImageData(output, width, height);
  }

  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const pos = y * width + x;
    if (visited[pos]) return;
    visited[pos] = 1;
    queue.push(pos);
  };

  if (mode === 'flood-point' && startPoint) {
    enqueue(Math.floor(startPoint.x), Math.floor(startPoint.y));
  } else {
    enqueue(0, 0);
    enqueue(width - 1, 0);
    enqueue(0, height - 1);
    enqueue(width - 1, height - 1);
  }

  let head = 0;
  while (head < queue.length) {
    const pos = queue[head++];
    const idx = pos * 4;
    if (output[idx + 3] === 0) continue;
    const dist = colorDist(idx);
    if (dist <= maxDist) {
      output[idx + 3] = dist > maxDist * 0.8 ? Math.round(output[idx + 3] * 0.35) : 0;
      const x = pos % width;
      const y = Math.floor(pos / width);
      enqueue(x + 1, y);
      enqueue(x - 1, y);
      enqueue(x, y + 1);
      enqueue(x, y - 1);
    }
  }

  return new ImageData(output, width, height);
}
