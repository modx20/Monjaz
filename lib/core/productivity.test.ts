import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePassword,
  analyzeText,
  formatAndCleanText,
  convertUnit,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  getContrastRatio,
  processJsonText,
} from './productivity';

test('generatePassword generates requested length and respects character pools', () => {
  const res = generatePassword({
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
    excludeAmbiguous: true,
  });
  assert.equal(res.password.length, 20);
  assert.equal(/[O0Il1|]/.test(res.password), false);
  assert.ok(res.entropyBits > 60);
});

test('analyzeText counts Arabic and English words and characters accurately', () => {
  const stats = analyzeText('مرحباً بكم في منصة منجز.\nهذه تجربة سريعة وفعالة!');
  assert.equal(stats.words, 9);
  assert.equal(stats.sentences, 2);
  assert.ok(stats.charsWithoutSpaces > 0);
});

test('formatAndCleanText removes tashkeel, collapses spaces, and deduplicates', () => {
  const cleaned = formatAndCleanText('  أَهْلاً   بِكُمْ  \n\n  أَهْلاً   بِكُمْ  \nإِنْجَاز', {
    trimLines: true,
    collapseSpaces: true,
    removeEmptyLines: true,
    removeTashkeel: true,
    normalizeAlef: true,
    deduplicateLines: true,
    sortLines: 'none',
  });
  assert.equal(cleaned, 'اهلا بكم\nانجاز');
});

test('convertUnit converts length, temperature, and data accurately', () => {
  assert.equal(Math.round(convertUnit(1, 'km', 'm', 'length')), 1000);
  assert.equal(Math.round(convertUnit(100, 'c', 'f', 'temperature')), 212);
  assert.equal(convertUnit(1, 'gb', 'mb', 'data'), 1024);
});

test('color helpers convert HEX/RGB/HSL and compute WCAG contrast ratio', () => {
  const rgb = hexToRgb('#1D4ED8');
  assert.deepEqual(rgb, { r: 29, g: 78, b: 216 });
  assert.equal(rgbToHex(rgb!), '#1D4ED8');
  const hsl = rgbToHsl(rgb!);
  assert.ok(hsl.h >= 220 && hsl.h <= 230);
  assert.equal(getContrastRatio('#000000', '#FFFFFF'), 21);
});

test('processJsonText validates, formats, and minifies JSON', () => {
  const formatted = processJsonText('{"b":1,"a":2}', 'sort');
  assert.equal(formatted.valid, true);
  assert.ok(formatted.output.indexOf('"a"') < formatted.output.indexOf('"b"'));
  assert.equal(processJsonText('{bad json}', 'format').valid, false);
});
