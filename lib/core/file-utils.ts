export const MAX_SINGLE_FILE_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_BATCH_TOTAL_BYTES = 200 * 1024 * 1024; // 200 MB

export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i === 0 ? 0 : dm)} ${sizes[i]}`;
}

export function getSavingsPercent(originalBytes: number, newBytes: number): number {
  if (originalBytes <= 0) return 0;
  return Math.round(((originalBytes - newBytes) / originalBytes) * 100);
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(
  file: { name: string; size: number },
  acceptedExtensions: string[],
  maxBytes: number = MAX_SINGLE_FILE_BYTES
): FileValidationResult {
  if (file.size === 0) {
    return { valid: false, error: `الملف «${file.name}» فارغ (0 بايت).` };
  }
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `حجم الملف «${file.name}» (${formatBytes(file.size)}) يتجاوز الحد المسموح (${formatBytes(maxBytes)}).`,
    };
  }
  if (acceptedExtensions.length > 0 && !acceptedExtensions.includes('*')) {
    const lowerName = file.name.toLowerCase();
    const matches = acceptedExtensions.some((ext) => lowerName.endsWith(ext.toLowerCase()));
    if (!matches) {
      return {
        valid: false,
        error: `صيغة الملف «${file.name}» غير مدعومة. الصيغ المقبولة: ${acceptedExtensions.join(' ، ')}.`,
      };
    }
  }
  return { valid: true };
}

export interface BatchRenameOptions {
  prefix: string;
  suffix: string;
  findText: string;
  replaceText: string;
  useNumbering: boolean;
  startNumber: number;
  padDigits: number;
  caseMode: 'keep' | 'lower' | 'upper';
}

export function computeRenamedFileName(
  originalName: string,
  index: number,
  options: BatchRenameOptions
): string {
  const lastDot = originalName.lastIndexOf('.');
  const hasExt = lastDot > 0 && lastDot < originalName.length - 1;
  let base = hasExt ? originalName.slice(0, lastDot) : originalName;
  const ext = hasExt ? originalName.slice(lastDot) : '';

  if (options.findText) {
    base = base.split(options.findText).join(options.replaceText);
  }

  if (options.caseMode === 'lower') {
    base = base.toLowerCase();
  } else if (options.caseMode === 'upper') {
    base = base.toUpperCase();
  }

  const numberSuffix = options.useNumbering
    ? `_${String(options.startNumber + index).padStart(Math.max(1, options.padDigits), '0')}`
    : '';

  const resultBase = `${options.prefix}${base}${options.suffix}${numberSuffix}`.trim() || `file_${index + 1}`;
  return `${resultBase}${ext}`;
}

export function parseCsvToRows(csvText: string, delimiter = ','): string[][] {
  const clean = csvText.replace(/^\uFEFF/, ''); // strip UTF-8 BOM
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const next = clean[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r' && next === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i++;
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((cell) => cell.trim() !== ''));
}

export function csvRowsToJsonObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const headers = rows[0].map((h, idx) => h.trim() || `column_${idx + 1}`);
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = row[idx] ?? '';
    });
    return obj;
  });
}

export function jsonObjectsToCsv(data: unknown[], includeBom = true): string {
  if (!Array.isArray(data) || data.length === 0) return '';
  const allKeys: string[] = [];
  for (const item of data) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      for (const key of Object.keys(item as Record<string, unknown>)) {
        if (!allKeys.includes(key)) allKeys.push(key);
      }
    }
  }
  if (allKeys.length === 0) return '';

  const escapeCell = (val: unknown): string => {
    const str = val === null || val === undefined ? '' : String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    allKeys.map(escapeCell).join(','),
    ...data.map((row) => {
      const rec = (row && typeof row === 'object' ? row : {}) as Record<string, unknown>;
      return allKeys.map((key) => escapeCell(rec[key])).join(',');
    }),
  ];

  return `${includeBom ? '\uFEFF' : ''}${lines.join('\r\n')}`;
}
