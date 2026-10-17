import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGroundingChunks } from './grounding.ts';

test('parseGroundingChunks extracts web and map chunks and dedupes', () => {
  const mockChunks = [
    {
      web: {
        uri: 'https://en.wikipedia.org/wiki/Tokyo',
        title: 'Tokyo - Wikipedia',
      },
    },
    {
      web: {
        uri: 'https://en.wikipedia.org/wiki/Tokyo', // duplicate
        title: 'Tokyo - Wikipedia Duplicate',
      },
    },
    {
      maps: {
        uri: 'https://maps.google.com/?cid=12345',
        title: 'Shibuya Crossing',
      },
    },
  ];

  const parsed = parseGroundingChunks(mockChunks);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].type, 'web');
  assert.equal(parsed[0].url, 'https://en.wikipedia.org/wiki/Tokyo');
  assert.equal(parsed[1].type, 'map');
  assert.equal(parsed[1].title, 'Shibuya Crossing');
});

test('parseGroundingChunks handles empty or undefined safely', () => {
  assert.deepEqual(parseGroundingChunks(undefined), []);
  assert.deepEqual(parseGroundingChunks([]), []);
});
