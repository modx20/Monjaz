'use client';

import { PDFDocument, degrees } from '@cantoo/pdf-lib';
import JSZip from 'jszip';

type PdfJsModule = typeof import('pdfjs-dist');

let pdfJsPromise: Promise<PdfJsModule> | null = null;

async function getPdfJs(): Promise<PdfJsModule> {
  if (!pdfJsPromise) {
    pdfJsPromise = import('pdfjs-dist').then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      return mod;
    });
  }
  return pdfJsPromise;
}

export interface PdfMetadataInfo {
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  isEncrypted?: boolean;
}

export async function inspectPdf(file: File): Promise<PdfMetadataInfo> {
  const pdfjs = await getPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  let info: Record<string, unknown> = {};
  try {
    const meta = await doc.getMetadata();
    info = (meta?.info as Record<string, unknown>) ?? {};
  } catch {
    info = {};
  }
  const pageCount = doc.numPages;
  await loadingTask.destroy();
  return {
    pageCount,
    title: typeof info.Title === 'string' ? info.Title : undefined,
    author: typeof info.Author === 'string' ? info.Author : undefined,
    subject: typeof info.Subject === 'string' ? info.Subject : undefined,
    creator: typeof info.Creator === 'string' ? info.Creator : undefined,
    producer: typeof info.Producer === 'string' ? info.Producer : undefined,
  };
}

export interface RenderedPageThumbnail {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export async function renderPdfPages(
  file: File,
  options: {
    scale?: number;
    format?: 'image/png' | 'image/jpeg';
    quality?: number;
    maxPages?: number;
    pageNumbers?: number[];
    onProgress?: (done: number, total: number) => void;
  } = {}
): Promise<{ pages: RenderedPageThumbnail[]; totalPages: number }> {
  const {
    scale = 0.65,
    format = 'image/jpeg',
    quality = 0.86,
    maxPages,
    pageNumbers,
    onProgress,
  } = options;

  const pdfjs = await getPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  const totalPages = doc.numPages;

  const targetPages =
    pageNumbers && pageNumbers.length > 0
      ? pageNumbers.filter((p) => p >= 1 && p <= totalPages)
      : Array.from(
          { length: maxPages ? Math.min(totalPages, maxPages) : totalPages },
          (_, i) => i + 1
        );

  const pages: RenderedPageThumbnail[] = [];

  for (let idx = 0; idx < targetPages.length; idx++) {
    const pageNum = targetPages[idx];
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      pages.push({
        pageNumber: pageNum,
        dataUrl: canvas.toDataURL(format, quality),
        width: canvas.width,
        height: canvas.height,
      });
    }
    page.cleanup();
    onProgress?.(idx + 1, targetPages.length);
  }

  await loadingTask.destroy();
  return { pages, totalPages };
}

export async function extractPdfTextPages(
  file: File,
  onProgress?: (done: number, total: number) => void
): Promise<{ pageNumber: number; text: string }[]> {
  const pdfjs = await getPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  const total = doc.numPages;
  const results: { pageNumber: number; text: string }[] = [];

  for (let p = 1; p <= total; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const lines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;

    for (const item of content.items) {
      if (!('str' in item)) continue;
      const y = Array.isArray(item.transform) ? item.transform[5] : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 4) {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = item.str;
      } else {
        currentLine += (currentLine && !currentLine.endsWith(' ') && !item.str.startsWith(' ') ? ' ' : '') + item.str;
      }
      lastY = y;
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    results.push({ pageNumber: p, text: lines.join('\n') });
    page.cleanup();
    onProgress?.(p, total);
  }

  await loadingTask.destroy();
  return results;
}

export async function mergePdfFiles(
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    const bytes = await files[i].arrayBuffer();
    const src = await PDFDocument.load(bytes, { ignoreEncryption: false });
    const copiedPages = await merged.copyPages(src, src.getPageIndices());
    for (const page of copiedPages) {
      merged.addPage(page);
    }
    onProgress?.(i + 1, files.length);
  }
  return merged.save();
}

export async function extractPagesToPdf(file: File, oneBasedPages: number[]): Promise<Uint8Array> {
  const src = await PDFDocument.load(await file.arrayBuffer());
  const out = await PDFDocument.create();
  const indices = oneBasedPages.map((p) => p - 1).filter((idx) => idx >= 0 && idx < src.getPageCount());
  const copied = await out.copyPages(src, indices);
  for (const page of copied) {
    out.addPage(page);
  }
  return out.save();
}

export async function splitPdfIntoZip(
  file: File,
  groups: number[][],
  baseName: string,
  onProgress?: (done: number, total: number) => void
): Promise<Blob> {
  const src = await PDFDocument.load(await file.arrayBuffer());
  const zip = new JSZip();
  const cleanBase = baseName.replace(/\.pdf$/i, '') || 'document';

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const out = await PDFDocument.create();
    const indices = group.map((p) => p - 1).filter((idx) => idx >= 0 && idx < src.getPageCount());
    const copied = await out.copyPages(src, indices);
    for (const page of copied) {
      out.addPage(page);
    }
    const bytes = await out.save();
    const label =
      group.length === 1
        ? `page_${String(group[0]).padStart(3, '0')}`
        : `pages_${group[0]}-${group[group.length - 1]}`;
    zip.file(`${cleanBase}_${label}.pdf`, bytes);
    onProgress?.(i + 1, groups.length);
  }

  return zip.generateAsync({ type: 'blob' });
}

export async function rotatePdfPages(
  file: File,
  rotationsByOneBasedPage: Record<number, number>
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const pages = doc.getPages();
  pages.forEach((page, idx) => {
    const delta = rotationsByOneBasedPage[idx + 1] ?? 0;
    if (delta !== 0) {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + delta) % 360));
    }
  });
  return doc.save();
}

/**
 * Renders Arabic/Unicode watermark text onto an offscreen canvas and embeds it as a crisp
 * transparent PNG into every PDF page so Arabic ligatures and RTL shaping render reliably.
 */
export async function addWatermarkToPdf(
  file: File,
  options: {
    text: string;
    colorHex: string;
    opacity: number; // 0.05 to 1
    fontSize: number; // 18 to 96
    angleDeg: number; // -60 to 60
    position: 'center' | 'tiled' | 'bottom-right';
  },
  onProgress?: (done: number, total: number) => void
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(await file.arrayBuffer());

  // Render high-DPI text PNG via canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('تعذر تهيئة أداة الرسم في المتصفح.');

  const scaleFactor = 2;
  const pxSize = options.fontSize * scaleFactor;
  ctx.font = `700 ${pxSize}px "IBM Plex Sans Arabic", "Cairo", sans-serif`;
  const metrics = ctx.measureText(options.text);
  const textWidth = Math.max(120, Math.ceil(metrics.width + 64));
  const textHeight = Math.max(80, Math.ceil(pxSize * 1.8));

  canvas.width = textWidth;
  canvas.height = textHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `700 ${pxSize}px "IBM Plex Sans Arabic", "Cairo", sans-serif`;
  ctx.fillStyle = options.colorHex;
  ctx.globalAlpha = Math.max(0.05, Math.min(1, options.opacity));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(options.text, canvas.width / 2, canvas.height / 2);

  const pngDataUrl = canvas.toDataURL('image/png');
  const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer());
  const watermarkImage = await doc.embedPng(pngBytes);

  const imgW = canvas.width / scaleFactor;
  const imgH = canvas.height / scaleFactor;
  const pages = doc.getPages();

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    if (options.position === 'tiled') {
      const stepX = Math.max(imgW + 60, width / 2.2);
      const stepY = Math.max(imgH + 80, height / 3.2);
      for (let y = 40; y < height - 20; y += stepY) {
        for (let x = 20; x < width - 20; x += stepX) {
          page.drawImage(watermarkImage, {
            x,
            y,
            width: imgW,
            height: imgH,
            rotate: degrees(options.angleDeg),
          });
        }
      }
    } else if (options.position === 'bottom-right') {
      page.drawImage(watermarkImage, {
        x: Math.max(16, width - imgW - 24),
        y: 20,
        width: imgW,
        height: imgH,
        rotate: degrees(0),
      });
    } else {
      const rad = (options.angleDeg * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const cx = width / 2;
      const cy = height / 2;
      const dx = (imgW / 2) * cos - (imgH / 2) * sin;
      const dy = (imgW / 2) * sin + (imgH / 2) * cos;
      page.drawImage(watermarkImage, {
        x: cx - dx,
        y: cy - dy,
        width: imgW,
        height: imgH,
        rotate: degrees(options.angleDeg),
      });
    }
    onProgress?.(idx + 1, pages.length);
  });

  return doc.save();
}

export async function protectPdfWithPassword(
  file: File,
  options: {
    userPassword: string;
    ownerPassword?: string;
    allowPrinting: boolean;
    allowCopying: boolean;
    allowModifying: boolean;
  }
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  doc.encrypt({
    userPassword: options.userPassword,
    ownerPassword: options.ownerPassword || options.userPassword,
    permissions: {
      printing: options.allowPrinting ? 'highResolution' : false,
      copying: options.allowCopying,
      modifying: options.allowModifying,
      annotating: options.allowModifying,
      fillingForms: options.allowModifying,
      contentAccessibility: true,
      documentAssembly: options.allowModifying,
    },
  });
  return doc.save();
}

export async function imagesToPdf(
  files: File[],
  options: {
    pageSize: 'a4' | 'letter' | 'fit';
    orientation: 'portrait' | 'landscape';
    marginPx: number;
  },
  onProgress?: (done: number, total: number) => void
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // Normalize any image (including WebP) via canvas -> JPEG/PNG bytes
    const bitmap = await createImageBitmap(file);
    const isPng = file.type === 'image/png';
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    if (!isPng) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const dataUrl = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.92);
    const bytes = await fetch(dataUrl).then((r) => r.arrayBuffer());
    const embedded = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);

    let pageW = embedded.width;
    let pageH = embedded.height;

    if (options.pageSize === 'a4') {
      pageW = options.orientation === 'portrait' ? 595.28 : 841.89;
      pageH = options.orientation === 'portrait' ? 841.89 : 595.28;
    } else if (options.pageSize === 'letter') {
      pageW = options.orientation === 'portrait' ? 612 : 792;
      pageH = options.orientation === 'portrait' ? 792 : 612;
    }

    const page = doc.addPage([pageW, pageH]);
    const margin = options.pageSize === 'fit' ? 0 : options.marginPx;
    const maxW = Math.max(20, pageW - margin * 2);
    const maxH = Math.max(20, pageH - margin * 2);
    const scale = Math.min(maxW / embedded.width, maxH / embedded.height);
    const drawW = embedded.width * scale;
    const drawH = embedded.height * scale;

    page.drawImage(embedded, {
      x: (pageW - drawW) / 2,
      y: (pageH - drawH) / 2,
      width: drawW,
      height: drawH,
    });
    onProgress?.(i + 1, files.length);
  }

  return doc.save();
}

export async function compressPdfDocument(
  file: File,
  level: 'light' | 'medium' | 'strong',
  onProgress?: (done: number, total: number) => void
): Promise<Uint8Array> {
  if (level === 'light') {
    const src = await PDFDocument.load(await file.arrayBuffer());
    const clean = await PDFDocument.create();
    const pages = await clean.copyPages(src, src.getPageIndices());
    for (const p of pages) clean.addPage(p);
    onProgress?.(1, 1);
    return clean.save({ useObjectStreams: true });
  }

  // Medium / Strong: render pages at controlled resolution & JPEG quality and rebuild PDF
  const pdfjs = await getPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  const srcDoc = await loadingTask.promise;
  const total = srcDoc.numPages;

  const scale = level === 'medium' ? 1.25 : 0.95;
  const jpegQuality = level === 'medium' ? 0.68 : 0.45;
  const outDoc = await PDFDocument.create();

  for (let p = 1; p <= total; p++) {
    const page = await srcDoc.getPage(p);
    const baseViewport = page.getViewport({ scale: 1 });
    const renderViewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(renderViewport.width));
    canvas.height = Math.max(1, Math.floor(renderViewport.height));
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport: renderViewport, canvas }).promise;
      const jpgUrl = canvas.toDataURL('image/jpeg', jpegQuality);
      const jpgBytes = await fetch(jpgUrl).then((r) => r.arrayBuffer());
      const img = await outDoc.embedJpg(jpgBytes);
      const outPage = outDoc.addPage([baseViewport.width, baseViewport.height]);
      outPage.drawImage(img, {
        x: 0,
        y: 0,
        width: baseViewport.width,
        height: baseViewport.height,
      });
    }
    page.cleanup();
    onProgress?.(p, total);
  }

  await loadingTask.destroy();
  return outDoc.save({ useObjectStreams: true });
}
