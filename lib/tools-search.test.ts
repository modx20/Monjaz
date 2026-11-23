import test from 'node:test';
import assert from 'node:assert/strict';
import { searchAndFilterTools, normalizeArabicForSearch } from './tools-search';
import { TOOLS_REGISTRY } from './tools-registry';

test('normalizeArabicForSearch normalizes Alef, Ta Marbuta, and diacritics', () => {
  assert.equal(normalizeArabicForSearch('أَلْوَانُ الصُّورَةِ'), 'الوان الصوره');
});

test('searchAndFilterTools finds relevant tools with normalized Arabic queries', () => {
  const pdfMerge = searchAndFilterTools('دمج', 'pdf');
  assert.ok(pdfMerge.some((t) => t.slug === 'merge-pdf'));

  const colorTools = searchAndFilterTools('الوان');
  assert.ok(colorTools.some((t) => t.slug === 'extract-image-colors'));
  assert.ok(colorTools.some((t) => t.slug === 'color-tools'));

  const qrTools = searchAndFilterTools('qr');
  assert.ok(qrTools.some((t) => t.slug === 'qr-generator'));
});

test('all relatedSlugs in registry point to real tools', () => {
  const slugs = new Set(TOOLS_REGISTRY.map((t) => t.slug));
  for (const tool of TOOLS_REGISTRY) {
    for (const rel of tool.relatedSlugs) {
      assert.ok(slugs.has(rel), `Missing relatedSlug "${rel}" on tool "${tool.slug}"`);
    }
  }
});
