import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePageRanges, buildFixedChunkRanges } from './pdf-utils';

test('parsePageRanges parses single pages and ranges accurately', () => {
  const res = parsePageRanges('1-3, 5, 7-8', 10);
  assert.equal(res.valid, true);
  assert.deepEqual(res.pages, [1, 2, 3, 5, 7, 8]);
});

test('parsePageRanges rejects out-of-bounds and inverted ranges', () => {
  assert.equal(parsePageRanges('1-12', 10).valid, false);
  assert.equal(parsePageRanges('5-2', 10).valid, false);
  assert.equal(parsePageRanges('', 10).valid, false);
  assert.equal(parsePageRanges('abc', 10).valid, false);
});

test('buildFixedChunkRanges splits pages into equal chunks', () => {
  assert.deepEqual(buildFixedChunkRanges(7, 3), [
    [1, 2, 3],
    [4, 5, 6],
    [7],
  ]);
  assert.deepEqual(buildFixedChunkRanges(4, 2), [
    [1, 2],
    [3, 4],
  ]);
});
