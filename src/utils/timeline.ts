export interface VideoClip {
  id: string;
  title: string;
  sourceUrl: string;
  thumbnailUrl?: string;
  duration: number; // in seconds
  trimStart: number; // in seconds
  trimEnd: number; // in seconds
  speed: number; // 0.5, 1, 1.5, 2
  filter?: string;
  volume?: number; // 0 - 1
  type: 'video' | 'animated-image';
}

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  position: 'top' | 'center' | 'bottom';
  color: string;
  fontSize: number;
  style: 'bold' | 'neon' | 'subtitles' | 'cinematic';
}

export interface AudioTrack {
  id: string;
  title: string;
  sourceUrl: string;
  type: 'tts' | 'music' | 'sfx';
  startTime: number;
  duration: number;
  volume: number;
}

export const MAX_PROJECT_DURATION_SECONDS = 120; // 2 minutes maximum

export function calculateEffectiveClipDuration(clip: VideoClip): number {
  const trimmed = Math.max(0.1, clip.trimEnd - clip.trimStart);
  const speed = clip.speed > 0 ? clip.speed : 1;
  return Number((trimmed / speed).toFixed(2));
}

export function calculateTotalTimelineDuration(clips: VideoClip[]): number {
  const total = clips.reduce((acc, clip) => acc + calculateEffectiveClipDuration(clip), 0);
  return Math.min(MAX_PROJECT_DURATION_SECONDS, Number(total.toFixed(2)));
}

export interface ActiveClipInfo {
  clipIndex: number;
  clip: VideoClip;
  clipLocalTime: number; // time offset inside the active clip
  timelineStartTime: number;
}

export function getActiveClipAtTime(clips: VideoClip[], currentTime: number): ActiveClipInfo | null {
  if (clips.length === 0) return null;
  const clampedTime = Math.max(0, Math.min(currentTime, calculateTotalTimelineDuration(clips)));

  let cumulativeTime = 0;
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const duration = calculateEffectiveClipDuration(clip);
    if (clampedTime >= cumulativeTime && clampedTime <= cumulativeTime + duration) {
      const elapsedInClip = clampedTime - cumulativeTime;
      const speed = clip.speed > 0 ? clip.speed : 1;
      const clipLocalTime = clip.trimStart + (elapsedInClip * speed);
      return {
        clipIndex: i,
        clip,
        clipLocalTime: Math.min(clip.trimEnd, clipLocalTime),
        timelineStartTime: cumulativeTime,
      };
    }
    cumulativeTime += duration;
  }

  // If at very end, return last clip
  const lastClip = clips[clips.length - 1];
  return {
    clipIndex: clips.length - 1,
    clip: lastClip,
    clipLocalTime: lastClip.trimEnd,
    timelineStartTime: Math.max(0, cumulativeTime - calculateEffectiveClipDuration(lastClip)),
  };
}

export function formatTimeCode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis}`;
}

export function formatSecondsOnly(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
