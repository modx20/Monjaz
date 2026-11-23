export interface PageRangeParseResult {
  valid: boolean;
  pages: number[]; // 1-based page numbers
  error?: string;
}

/**
 * Parses page range strings like "1-3, 5, 7-9" into sorted/ordered unique 1-based page numbers.
 */
export function parsePageRanges(input: string, totalPages: number): PageRangeParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, pages: [], error: 'يرجى إدخال أرقام الصفحات أو النطاقات المطلوبة.' };
  }
  if (totalPages < 1) {
    return { valid: false, pages: [], error: 'المستند لا يحتوي على صفحات صالحة.' };
  }

  const parts = trimmed
    .split(/[،,]/)
    .map((p) => p.trim())
    .filter(Boolean);

  const selected: number[] = [];
  const seen = new Set<number>();

  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      const page = Number(part);
      if (page < 1 || page > totalPages) {
        return {
          valid: false,
          pages: [],
          error: `رقم الصفحة ${page} خارج نطاق المستند (1 إلى ${totalPages}).`,
        };
      }
      if (!seen.has(page)) {
        seen.add(page);
        selected.push(page);
      }
    } else if (/^\d+\s*-\s*\d+$/.test(part)) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = Number(startStr);
      const end = Number(endStr);
      if (start < 1 || end < 1 || start > totalPages || end > totalPages) {
        return {
          valid: false,
          pages: [],
          error: `النطاق «${part}» يتجاوز عدد صفحات المستند (${totalPages}).`,
        };
      }
      if (start > end) {
        return {
          valid: false,
          pages: [],
          error: `النطاق «${part}» غير صحيح؛ يجب أن يكون الرقم الأول أصغر من أو يساوي الثاني.`,
        };
      }
      for (let p = start; p <= end; p++) {
        if (!seen.has(p)) {
          seen.add(p);
          selected.push(p);
        }
      }
    } else {
      return {
        valid: false,
        pages: [],
        error: `تنسيق غير مفهوم عند «${part}». استخدم أرقاماً أو نطاقات مثل: 1-3, 5`,
      };
    }
  }

  return { valid: true, pages: selected };
}

/**
 * Splits a string into groups of ranges for splitting PDFs into chunks of N pages.
 */
export function buildFixedChunkRanges(totalPages: number, pagesPerChunk: number): number[][] {
  if (totalPages < 1 || pagesPerChunk < 1) return [];
  const chunks: number[][] = [];
  for (let start = 1; start <= totalPages; start += pagesPerChunk) {
    const chunk: number[] = [];
    for (let p = start; p < start + pagesPerChunk && p <= totalPages; p++) {
      chunk.push(p);
    }
    chunks.push(chunk);
  }
  return chunks;
}
