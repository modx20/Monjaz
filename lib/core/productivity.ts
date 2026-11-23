// ==================== PASSWORD GENERATOR ====================
export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const CHARS_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHARS_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const CHARS_NUM = '0123456789';
const CHARS_SYM = '!@#$%^&*()-_=+[]{}|;:,.<>?';
const AMBIGUOUS = /[O0Il1|]/g;

function secureRandomIndex(max: number): number {
  const array = new Uint32Array(1);
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    cryptoObj.getRandomValues(array);
    return array[0] % max;
  }
  return Math.floor(Math.random() * max);
}

export function generatePassword(options: PasswordOptions): {
  password: string;
  entropyBits: number;
  strengthLabel: 'ضعيفة' | 'متوسطة' | 'قوية' | 'فائقة الأمان';
} {
  const pools: string[] = [];
  const filterPool = (s: string) => (options.excludeAmbiguous ? s.replace(AMBIGUOUS, '') : s);

  if (options.uppercase) pools.push(filterPool(CHARS_UPPER));
  if (options.lowercase) pools.push(filterPool(CHARS_LOWER));
  if (options.numbers) pools.push(filterPool(CHARS_NUM));
  if (options.symbols) pools.push(filterPool(CHARS_SYM));

  if (pools.length === 0) {
    pools.push(filterPool(CHARS_LOWER));
  }

  const combined = pools.join('');
  const length = Math.max(4, Math.min(128, options.length));
  const chars: string[] = [];

  // Ensure at least one character from each enabled pool
  for (const pool of pools) {
    if (chars.length < length && pool.length > 0) {
      chars.push(pool[secureRandomIndex(pool.length)]);
    }
  }

  while (chars.length < length) {
    chars.push(combined[secureRandomIndex(combined.length)]);
  }

  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  const entropyBits = Math.round(length * Math.log2(Math.max(2, combined.length)));
  let strengthLabel: 'ضعيفة' | 'متوسطة' | 'قوية' | 'فائقة الأمان' = 'ضعيفة';
  if (entropyBits >= 90) strengthLabel = 'فائقة الأمان';
  else if (entropyBits >= 65) strengthLabel = 'قوية';
  else if (entropyBits >= 45) strengthLabel = 'متوسطة';

  return {
    password: chars.join(''),
    entropyBits,
    strengthLabel,
  };
}

// ==================== TEXT ANALYSIS & FORMATTING ====================
export interface TextStats {
  words: number;
  charsWithSpaces: number;
  charsWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingMinutes: number;
  speakingMinutes: number;
  topWords: { word: string; count: number }[];
}

export function analyzeText(text: string): TextStats {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      words: 0,
      charsWithSpaces: 0,
      charsWithoutSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingMinutes: 0,
      speakingMinutes: 0,
      topWords: [],
    };
  }

  const wordsList = trimmed
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter(Boolean);

  const charsWithSpaces = text.length;
  const charsWithoutSpaces = text.replace(/\s/g, '').length;
  const sentences = trimmed
    .split(/[.!؟?\n]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
  const paragraphs = trimmed
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean).length;

  const freq = new Map<string, number>();
  for (const w of wordsList) {
    const key = w.toLowerCase();
    if (key.length < 2) continue;
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }

  const topWords = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));

  return {
    words: wordsList.length,
    charsWithSpaces,
    charsWithoutSpaces,
    sentences,
    paragraphs,
    readingMinutes: Math.max(1, Math.ceil(wordsList.length / 200)),
    speakingMinutes: Math.max(1, Math.ceil(wordsList.length / 130)),
    topWords,
  };
}

export interface TextCleanOptions {
  trimLines: boolean;
  collapseSpaces: boolean;
  removeEmptyLines: boolean;
  removeTashkeel: boolean;
  normalizeAlef: boolean;
  deduplicateLines: boolean;
  sortLines: 'none' | 'asc' | 'desc';
}

export function formatAndCleanText(text: string, options: TextCleanOptions): string {
  let result = text;

  if (options.removeTashkeel) {
    result = result.replace(/[\u064B-\u065F\u0670]/g, '');
  }
  if (options.normalizeAlef) {
    result = result.replace(/[أإآٱ]/g, 'ا');
  }

  let lines = result.split(/\r?\n/);

  if (options.trimLines) {
    lines = lines.map((line) => line.trim());
  }
  if (options.collapseSpaces) {
    lines = lines.map((line) => line.replace(/[ \t]{2,}/g, ' '));
  }
  if (options.removeEmptyLines) {
    lines = lines.filter((line) => line.trim().length > 0);
  }
  if (options.deduplicateLines) {
    const seen = new Set<string>();
    lines = lines.filter((line) => {
      if (seen.has(line)) return false;
      seen.add(line);
      return true;
    });
  }
  if (options.sortLines === 'asc') {
    lines = [...lines].sort((a, b) => a.localeCompare(b, 'ar'));
  } else if (options.sortLines === 'desc') {
    lines = [...lines].sort((a, b) => b.localeCompare(a, 'ar'));
  }

  return lines.join('\n');
}

// ==================== UNIT CONVERTER ====================
export type UnitCategory =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'data'
  | 'speed'
  | 'time';

export interface UnitDefinition {
  id: string;
  label: string;
  factorToBase?: number; // linear factor to base unit
}

export const UNIT_CATEGORIES: {
  id: UnitCategory;
  label: string;
  units: UnitDefinition[];
}[] = [
  {
    id: 'length',
    label: 'الطول والمسافة',
    units: [
      { id: 'm', label: 'متر (m)', factorToBase: 1 },
      { id: 'km', label: 'كيلومتر (km)', factorToBase: 1000 },
      { id: 'cm', label: 'سنتيمتر (cm)', factorToBase: 0.01 },
      { id: 'mm', label: 'مليمتر (mm)', factorToBase: 0.001 },
      { id: 'mi', label: 'ميل (mi)', factorToBase: 1609.344 },
      { id: 'yd', label: 'ياردة (yd)', factorToBase: 0.9144 },
      { id: 'ft', label: 'قدم (ft)', factorToBase: 0.3048 },
      { id: 'in', label: 'بوصة (in)', factorToBase: 0.0254 },
    ],
  },
  {
    id: 'weight',
    label: 'الوزن والكتلة',
    units: [
      { id: 'kg', label: 'كيلوجرام (kg)', factorToBase: 1 },
      { id: 'g', label: 'جرام (g)', factorToBase: 0.001 },
      { id: 'mg', label: 'مليجرام (mg)', factorToBase: 0.000001 },
      { id: 't', label: 'طن متري (t)', factorToBase: 1000 },
      { id: 'lb', label: 'رطل (lb)', factorToBase: 0.45359237 },
      { id: 'oz', label: 'أونصة (oz)', factorToBase: 0.028349523125 },
    ],
  },
  {
    id: 'temperature',
    label: 'درجة الحرارة',
    units: [
      { id: 'c', label: 'مئوية (°C)' },
      { id: 'f', label: 'فهرنهايت (°F)' },
      { id: 'k', label: 'كلفن (K)' },
    ],
  },
  {
    id: 'area',
    label: 'المساحة',
    units: [
      { id: 'm2', label: 'متر مربع (m²)', factorToBase: 1 },
      { id: 'km2', label: 'كيلومتر مربع (km²)', factorToBase: 1_000_000 },
      { id: 'cm2', label: 'سنتيمتر مربع (cm²)', factorToBase: 0.0001 },
      { id: 'ha', label: 'هكتار (ha)', factorToBase: 10_000 },
      { id: 'acre', label: 'فدان إنجليزي (acre)', factorToBase: 4046.8564224 },
      { id: 'ft2', label: 'قدم مربع (ft²)', factorToBase: 0.09290304 },
    ],
  },
  {
    id: 'volume',
    label: 'الحجم والسعة',
    units: [
      { id: 'l', label: 'لتر (L)', factorToBase: 1 },
      { id: 'ml', label: 'مليلتر (mL)', factorToBase: 0.001 },
      { id: 'm3', label: 'متر مكعب (m³)', factorToBase: 1000 },
      { id: 'gal', label: 'جالون أمريكي (gal)', factorToBase: 3.785411784 },
      { id: 'cup', label: 'كوب معياري (cup)', factorToBase: 0.2365882365 },
    ],
  },
  {
    id: 'data',
    label: 'البيانات الرقمية',
    units: [
      { id: 'b', label: 'بايت (Byte)', factorToBase: 1 },
      { id: 'kb', label: 'كيلوبايت (KB)', factorToBase: 1024 },
      { id: 'mb', label: 'ميجابايت (MB)', factorToBase: 1024 ** 2 },
      { id: 'gb', label: 'جيجابايت (GB)', factorToBase: 1024 ** 3 },
      { id: 'tb', label: 'تيرابايت (TB)', factorToBase: 1024 ** 4 },
      { id: 'bit', label: 'بت (bit)', factorToBase: 0.125 },
    ],
  },
  {
    id: 'speed',
    label: 'السرعة',
    units: [
      { id: 'mps', label: 'متر/ثانية (m/s)', factorToBase: 1 },
      { id: 'kph', label: 'كيلومتر/ساعة (km/h)', factorToBase: 1 / 3.6 },
      { id: 'mph', label: 'ميل/ساعة (mph)', factorToBase: 0.44704 },
      { id: 'knot', label: 'عقدة بحرية (knot)', factorToBase: 0.514444 },
    ],
  },
  {
    id: 'time',
    label: 'الوقت',
    units: [
      { id: 's', label: 'ثانية', factorToBase: 1 },
      { id: 'min', label: 'دقيقة', factorToBase: 60 },
      { id: 'hr', label: 'ساعة', factorToBase: 3600 },
      { id: 'day', label: 'يوم', factorToBase: 86400 },
      { id: 'week', label: 'أسبوع', factorToBase: 604800 },
    ],
  },
];

export function convertUnit(
  value: number,
  fromId: string,
  toId: string,
  category: UnitCategory
): number {
  if (!Number.isFinite(value)) return 0;
  if (fromId === toId) return value;

  if (category === 'temperature') {
    let celsius = value;
    if (fromId === 'f') celsius = ((value - 32) * 5) / 9;
    else if (fromId === 'k') celsius = value - 273.15;

    if (toId === 'c') return celsius;
    if (toId === 'f') return (celsius * 9) / 5 + 32;
    if (toId === 'k') return celsius + 273.15;
    return celsius;
  }

  const cat = UNIT_CATEGORIES.find((c) => c.id === category);
  const fromUnit = cat?.units.find((u) => u.id === fromId);
  const toUnit = cat?.units.find((u) => u.id === toId);
  if (!fromUnit?.factorToBase || !toUnit?.factorToBase) return value;

  const baseValue = value * fromUnit.factorToBase;
  return baseValue / toUnit.factorToBase;
}

// ==================== COLOR UTILITIES & WCAG CONTRAST ====================
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RgbColor | null {
  const clean = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(clean)) return null;
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex({ r, g, b }: RgbColor): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }: RgbColor): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      case bn:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function rgbToCmyk({ r, g, b }: RgbColor): { c: number; m: number; y: number; k: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

function relativeLuminance({ r, g, b }: RgbColor): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

// ==================== JSON FORMATTER & VALIDATOR ====================
export function sortObjectKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeysDeep);
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort((a, b) => a.localeCompare(b))) {
      sorted[key] = sortObjectKeysDeep(record[key]);
    }
    return sorted;
  }
  return value;
}

export function processJsonText(
  input: string,
  mode: 'format' | 'minify' | 'sort'
): { valid: boolean; output: string; error?: string } {
  if (!input.trim()) {
    return { valid: false, output: '', error: 'يرجى إدخال نص JSON أولاً.' };
  }
  try {
    const parsed = JSON.parse(input);
    if (mode === 'minify') {
      return { valid: true, output: JSON.stringify(parsed) };
    }
    if (mode === 'sort') {
      return { valid: true, output: JSON.stringify(sortObjectKeysDeep(parsed), null, 2) };
    }
    return { valid: true, output: JSON.stringify(parsed, null, 2) };
  } catch (err) {
    return {
      valid: false,
      output: '',
      error: `صيغة JSON غير صالحة: ${err instanceof Error ? err.message : 'خطأ في الصياغة'}`,
    };
  }
}
