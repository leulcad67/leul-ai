import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEffectiveClipDuration,
  calculateTotalTimelineDuration,
  getActiveClipAtTime,
  formatTimeCode,
  formatSecondsOnly,
} from './timeline.ts';
import type { VideoClip } from './timeline.ts';

test('calculateEffectiveClipDuration respects trim and speed', () => {
  const clip1: VideoClip = {
    id: '1',
    title: 'Clip 1',
    sourceUrl: 'test.mp4',
    duration: 10,
    trimStart: 0,
    trimEnd: 10,
    speed: 1,
    type: 'video',
  };
  assert.equal(calculateEffectiveClipDuration(clip1), 10);

  const clip2: VideoClip = {
    ...clip1,
    trimStart: 2,
    trimEnd: 8, // 6 seconds
    speed: 2, // 2x speed -> 3 seconds
  };
  assert.equal(calculateEffectiveClipDuration(clip2), 3);

  const clip3: VideoClip = {
    ...clip1,
    trimStart: 0,
    trimEnd: 4, // 4 seconds
    speed: 0.5, // 0.5x speed -> 8 seconds
  };
  assert.equal(calculateEffectiveClipDuration(clip3), 8);
});

test('calculateTotalTimelineDuration sums all clips and caps at 120s max', () => {
  const clips: VideoClip[] = [
    { id: '1', title: 'C1', sourceUrl: '1.mp4', duration: 15, trimStart: 0, trimEnd: 15, speed: 1, type: 'video' },
    { id: '2', title: 'C2', sourceUrl: '2.mp4', duration: 30, trimStart: 0, trimEnd: 30, speed: 1, type: 'video' },
  ];
  assert.equal(calculateTotalTimelineDuration(clips), 45);

  const longClips: VideoClip[] = [
    { id: '1', title: 'C1', sourceUrl: '1.mp4', duration: 90, trimStart: 0, trimEnd: 90, speed: 1, type: 'video' },
    { id: '2', title: 'C2', sourceUrl: '2.mp4', duration: 90, trimStart: 0, trimEnd: 90, speed: 1, type: 'video' },
  ];
  assert.equal(calculateTotalTimelineDuration(longClips), 120);
});

test('getActiveClipAtTime accurately finds clip and internal offset', () => {
  const clips: VideoClip[] = [
    { id: '1', title: 'C1', sourceUrl: '1.mp4', duration: 10, trimStart: 2, trimEnd: 10, speed: 1, type: 'video' }, // 8s, [0 - 8]
    { id: '2', title: 'C2', sourceUrl: '2.mp4', duration: 10, trimStart: 0, trimEnd: 10, speed: 2, type: 'video' }, // 5s, [8 - 13]
  ];

  // At 4 seconds: in clip 1, elapsed 4s -> localTime = 2 + 4 = 6
  const active1 = getActiveClipAtTime(clips, 4);
  assert.ok(active1);
  assert.equal(active1.clipIndex, 0);
  assert.equal(active1.clipLocalTime, 6);

  // At 10 seconds: in clip 2, elapsed in clip 2 is 2s -> speed 2 -> 2 * 2 = 4 -> localTime = 4
  const active2 = getActiveClipAtTime(clips, 10);
  assert.ok(active2);
  assert.equal(active2.clipIndex, 1);
  assert.equal(active2.clipLocalTime, 4);
});

test('formatTimeCode produces MM:SS.m format', () => {
  assert.equal(formatTimeCode(0), '00:00.0');
  assert.equal(formatTimeCode(65.5), '01:05.5');
  assert.equal(formatSecondsOnly(120), '2:00');
});
