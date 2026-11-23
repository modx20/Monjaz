import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBytes,
  getSavingsPercent,
  validateFile,
  computeRenamedFileName,
  parseCsvToRows,
  csvRowsToJsonObjects,
  jsonObjectsToCsv,
} from './file-utils';

test('formatBytes formats sizes cleanly', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.equal(formatBytes(1024 * 1024 * 2.5), '2.5 MB');
});

test('getSavingsPercent calculates percentage reduction', () => {
  assert.equal(getSavingsPercent(1000, 400), 60);
  assert.equal(getSavingsPercent(0, 100), 0);
});

test('validateFile rejects empty files and invalid extensions', () => {
  assert.equal(validateFile({ name: 'doc.pdf', size: 0 }, ['.pdf']).valid, false);
  assert.equal(validateFile({ name: 'photo.png', size: 1000 }, ['.pdf']).valid, false);
  assert.equal(validateFile({ name: 'report.PDF', size: 2048 }, ['.pdf']).valid, true);
  assert.equal(validateFile({ name: 'any.bin', size: 1024 }, ['*']).valid, true);
});

test('computeRenamedFileName applies prefix, find/replace, numbering, and preserves extension', () => {
  const renamed = computeRenamedFileName('My Photo.jpg', 2, {
    prefix: 'trip_',
    suffix: '_v2',
    findText: ' ',
    replaceText: '-',
    useNumbering: true,
    startNumber: 1,
    padDigits: 3,
    caseMode: 'lower',
  });
  assert.equal(renamed, 'trip_my-photo_v2_003.jpg');
});

test('CSV and JSON round-trip with Arabic text and BOM', () => {
  const csv = '\uFEFFالاسم,المدينة\n"أحمد, علي",الرياض\nسارة,جدة';
  const rows = parseCsvToRows(csv);
  assert.equal(rows.length, 3);
  assert.equal(rows[1][0], 'أحمد, علي');

  const json = csvRowsToJsonObjects(rows);
  assert.equal(json.length, 2);
  assert.equal(json[0]['المدينة'], 'الرياض');

  const exportedCsv = jsonObjectsToCsv(json, true);
  assert.ok(exportedCsv.startsWith('\uFEFF'));
  assert.ok(exportedCsv.includes('"أحمد, علي"'));
});
