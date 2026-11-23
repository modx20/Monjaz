'use client';

import JSZip from 'jszip';

export interface OfficePreviewResult {
  html: string;
  warnings: string[];
  sheetNames?: string[];
  slideCount?: number;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function convertDocxToHtml(file: File): Promise<OfficePreviewResult> {
  const mammoth = await import('mammoth');
  const buffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
  return {
    html: result.value,
    warnings: result.messages.map((m) => m.message),
  };
}

export async function parseSpreadsheetToHtml(
  file: File,
  selectedSheetName?: string
): Promise<OfficePreviewResult> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  const targetName =
    selectedSheetName && sheetNames.includes(selectedSheetName) ? selectedSheetName : sheetNames[0];

  if (!targetName) {
    throw new Error('لم يتم العثور على أي ورقة عمل داخل الملف.');
  }

  const sheet = workbook.Sheets[targetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });

  if (rows.length === 0) {
    return {
      html: '<p style="color:#64748b;">ورقة العمل فارغة.</p>',
      warnings: [],
      sheetNames,
    };
  }

  const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 1);
  const limitedRows = rows.slice(0, 500);
  const warnings =
    rows.length > 500 ? [`تم عرض أول 500 صف من إجمالي ${rows.length} صفاً للحفاظ على سرعة التصدير.`] : [];

  const tableRows = limitedRows
    .map((row, rowIdx) => {
      const cells = Array.from({ length: maxCols }, (_, colIdx) => {
        const val = Array.isArray(row) ? row[colIdx] : '';
        const tag = rowIdx === 0 ? 'th' : 'td';
        const style =
          rowIdx === 0
            ? 'background:#f1f5f9;color:#0f172a;font-weight:700;padding:8px 10px;border:1px solid #cbd5e1;text-align:right;font-size:12px;'
            : 'padding:7px 10px;border:1px solid #e2e8f0;color:#1e293b;text-align:right;font-size:12px;';
        return `<${tag} style="${style}">${escapeHtml(String(val ?? ''))}</${tag}>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return {
    html: `<h2 style="font-size:16px;font-weight:700;margin-bottom:12px;color:#0f172a;">${escapeHtml(targetName)}</h2><table style="width:100%;border-collapse:collapse;background:#ffffff;">${tableRows}</table>`,
    warnings,
    sheetNames,
  };
}

export interface PptxSlideContent {
  index: number;
  title: string;
  paragraphs: string[];
  images: string[];
}

export async function parsePptxSlides(file: File): Promise<{
  slides: PptxSlideContent[];
  html: string;
}> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slidePaths = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/i)?.[1] ?? '0', 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/i)?.[1] ?? '0', 10);
      return na - nb;
    });

  if (slidePaths.length === 0) {
    throw new Error('لم يتم العثور على شرائح صالحة داخل ملف PowerPoint (.pptx).');
  }

  const parser = new DOMParser();
  const slides: PptxSlideContent[] = [];

  for (let i = 0; i < slidePaths.length; i++) {
    const slidePath = slidePaths[i];
    const xmlStr = await zip.files[slidePath].async('string');
    const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');

    // Extract paragraphs (<a:p>)
    const pNodes = Array.from(xmlDoc.getElementsByTagName('a:p'));
    const allTexts = pNodes
      .map((p) => {
        const tNodes = Array.from(p.getElementsByTagName('a:t'));
        return tNodes.map((t) => t.textContent ?? '').join('').trim();
      })
      .filter(Boolean);

    // Check slide relationships for embedded images
    const relPath = slidePath.replace('ppt/slides/', 'ppt/slides/_rels/') + '.rels';
    const images: string[] = [];
    if (zip.files[relPath]) {
      const relXml = await zip.files[relPath].async('string');
      const relDoc = parser.parseFromString(relXml, 'application/xml');
      const rels = Array.from(relDoc.getElementsByTagName('Relationship'));
      for (const rel of rels) {
        const target = rel.getAttribute('Target') ?? '';
        const type = rel.getAttribute('Type') ?? '';
        if (type.includes('/image') && target) {
          const normalized = target.replace(/^(\.\.\/)+/, 'ppt/');
          const mediaFile = zip.files[normalized] || zip.files[`ppt/${normalized.replace(/^ppt\//, '')}`];
          if (mediaFile) {
            const ext = normalized.split('.').pop()?.toLowerCase() ?? 'png';
            const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
            const b64 = await mediaFile.async('base64');
            images.push(`data:${mime};base64,${b64}`);
          }
        }
      }
    }

    const title = allTexts[0] || `الشريحة ${i + 1}`;
    const paragraphs = allTexts.slice(1);
    slides.push({
      index: i + 1,
      title,
      paragraphs,
      images: images.slice(0, 3),
    });
  }

  const html = slides
    .map(
      (slide) => `
      <section data-pdf-slide="true" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:10px;padding:28px 32px;margin-bottom:20px;min-height:420px;box-sizing:border-box;">
        <div style="font-size:12px;color:#64748b;margin-bottom:10px;">شريحة ${slide.index} من ${slides.length}</div>
        <h2 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 16px 0;line-height:1.4;">${escapeHtml(slide.title)}</h2>
        ${
          slide.paragraphs.length > 0
            ? `<ul style="margin:0;padding:0 20px;color:#334155;font-size:15px;line-height:1.8;">${slide.paragraphs
                .map((p) => `<li style="margin-bottom:6px;">${escapeHtml(p)}</li>`)
                .join('')}</ul>`
            : ''
        }
        ${
          slide.images.length > 0
            ? `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:16px;">${slide.images
                .map(
                  (src) =>
                    `<img src="${src}" style="max-height:200px;max-width:100%;object-fit:contain;border-radius:6px;border:1px solid #e2e8f0;" />`
                )
                .join('')}</div>`
            : ''
        }
      </section>`
    )
    .join('');

  return { slides, html };
}

/**
 * Renders HTML inside an isolated iframe with clean hex CSS (avoiding Tailwind oklch parsing issues)
 * and exports multi-page PDF via html2canvas + jsPDF.
 */
export async function exportHtmlToPdfBlob(
  innerHtml: string,
  options: {
    dir?: 'rtl' | 'ltr';
    orientation?: 'portrait' | 'landscape';
    slideSections?: boolean;
  } = {}
): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const dir = options.dir ?? 'rtl';
  const orientation = options.orientation ?? 'portrait';
  const pageWidthPx = orientation === 'landscape' ? 1120 : 794;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-99999px';
  iframe.style.top = '0';
  iframe.style.width = `${pageWidthPx}px`;
  iframe.style.height = '1200px';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument;
    if (!doc) throw new Error('تعذر إنشاء بيئة التصيير.');

    doc.open();
    doc.write(`<!DOCTYPE html>
      <html lang="ar" dir="${dir}">
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 36px;
            background: #ffffff;
            color: #111827;
            font-family: "IBM Plex Sans Arabic", "Cairo", Tahoma, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.75;
            width: ${pageWidthPx}px;
          }
          h1, h2, h3, h4 { color: #0f172a; margin-top: 1em; margin-bottom: 0.5em; }
          p { margin: 0 0 0.75em 0; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>${innerHtml}</body>
      </html>`);
    doc.close();

    // Wait briefly for fonts & embedded images
    await new Promise((res) => setTimeout(res, 250));

    const pdf = new jsPDF({
      orientation,
      unit: 'pt',
      format: 'a4',
    });

    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    if (options.slideSections) {
      const sections = Array.from(doc.querySelectorAll('[data-pdf-slide="true"]')) as HTMLElement[];
      for (let i = 0; i < sections.length; i++) {
        if (i > 0) pdf.addPage();
        const canvas = await html2canvas(sections[i], {
          scale: 1.7,
          backgroundColor: '#ffffff',
          useCORS: true,
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        const ratio = Math.min((pdfW - 32) / canvas.width, (pdfH - 32) / canvas.height);
        const w = canvas.width * ratio;
        const h = canvas.height * ratio;
        pdf.addImage(imgData, 'JPEG', (pdfW - w) / 2, (pdfH - h) / 2, w, h);
      }
      return pdf.output('blob');
    }

    const totalHeight = doc.body.scrollHeight;
    iframe.style.height = `${Math.max(1200, totalHeight + 80)}px`;

    const fullCanvas = await html2canvas(doc.body, {
      scale: 1.6,
      backgroundColor: '#ffffff',
      useCORS: true,
      width: pageWidthPx,
      height: totalHeight,
    });

    const imgWidth = pdfW;
    const pageSliceHeightPx = Math.floor((pdfH / pdfW) * fullCanvas.width);

    let yOffset = 0;
    let pageIndex = 0;

    while (yOffset < fullCanvas.height) {
      const sliceHeight = Math.min(pageSliceHeightPx, fullCanvas.height - yOffset);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = fullCanvas.width;
      sliceCanvas.height = sliceHeight;
      const sliceCtx = sliceCanvas.getContext('2d');
      if (sliceCtx) {
        sliceCtx.fillStyle = '#ffffff';
        sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        sliceCtx.drawImage(
          fullCanvas,
          0,
          yOffset,
          fullCanvas.width,
          sliceHeight,
          0,
          0,
          sliceCanvas.width,
          sliceHeight
        );
        if (pageIndex > 0) pdf.addPage();
        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.92);
        const drawH = (sliceHeight * imgWidth) / fullCanvas.width;
        pdf.addImage(sliceData, 'JPEG', 0, 0, imgWidth, drawH);
      }
      yOffset += sliceHeight;
      pageIndex++;
    }

    return pdf.output('blob');
  } finally {
    document.body.removeChild(iframe);
  }
}
