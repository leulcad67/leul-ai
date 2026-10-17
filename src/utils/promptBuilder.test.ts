import test from 'node:test';
import assert from 'node:assert/strict';
import { compileVideoPrompt, BUILTIN_STYLE_TEMPLATES } from './promptBuilder.ts';

test('BUILTIN_STYLE_TEMPLATES has all expected flagship styles', () => {
  assert.ok(BUILTIN_STYLE_TEMPLATES.length >= 8);
  const ids = BUILTIN_STYLE_TEMPLATES.map((t) => t.id);
  assert.ok(ids.includes('cyberpunk-neon'));
  assert.ok(ids.includes('cinematic-imax'));
  assert.ok(ids.includes('anime-ghibli'));
  assert.ok(ids.includes('3d-pixar'));
  assert.ok(ids.includes('vintage-70s'));
  assert.ok(ids.includes('drone-nature'));
});

test('compileVideoPrompt combines prompt with motion, lens, and style modifier', () => {
  const result = compileVideoPrompt({
    userPrompt: 'A futuristic sports car drifting through rain',
    templateId: 'cyberpunk-neon',
    cameraMotion: 'Drone Glide',
    lens: '35mm anamorphic',
    lighting: 'Neon street glow',
    mood: 'Energetic',
  });

  assert.ok(result.includes('A futuristic sports car drifting through rain'));
  assert.ok(result.includes('camera motion: Drone Glide'));
  assert.ok(result.includes('lens: 35mm anamorphic'));
  assert.ok(result.includes('lighting: Neon street glow'));
  assert.ok(result.includes('cyberpunk aesthetic'));
});

test('compileVideoPrompt works with minimal user prompt', () => {
  const result = compileVideoPrompt({
    userPrompt: 'Serene sunset over ocean',
  });
  assert.equal(result, 'Serene sunset over ocean');
});
