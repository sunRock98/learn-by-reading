/**
 * Audio Cache Module
 *
 * Provides a persistent in-memory cache for generated audio data.
 * Audio is stored as base64 strings to survive component unmounts
 * (unlike blob URLs which get revoked).
 * Also stores playback progress to resume from where user left off.
 */

interface CachedAudio {
  audioBase64: string;
  contentType: string;
  timestamp: number;
}

interface PlaybackProgress {
  currentTime: number;
  timestamp: number;
}

// Module-level cache that persists across component mounts
const audioCache = new Map<string, CachedAudio>();

// Playback progress cache (keyed by text hash)
const progressCache = new Map<string, PlaybackProgress>();

// Cache expiration time (1 hour)
const CACHE_TTL_MS = 60 * 60 * 1000;

// Maximum cache size (to prevent memory issues)
const MAX_CACHE_SIZE = 20;

/**
 * Generate a unique cache key based on audio parameters
 */
export function generateCacheKey(
  text: string,
  voice: string,
  speed: number
): string {
  // Use a hash of the text content to keep keys manageable
  const textHash = hashString(text);
  return `${textHash}-${voice}-${speed}`;
}

/**
 * Simple string hashing function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get cached audio by key
 */
export function getCachedAudio(key: string): CachedAudio | null {
  const cached = audioCache.get(key);

  if (!cached) {
    return null;
  }

  // Check if cache entry has expired
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    audioCache.delete(key);
    return null;
  }

  return cached;
}

/**
 * Store audio in cache
 */
export function setCachedAudio(
  key: string,
  audioBase64: string,
  contentType: string
): void {
  // Evict oldest entries if cache is full
  if (audioCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = findOldestCacheEntry();
    if (oldestKey) {
      audioCache.delete(oldestKey);
    }
  }

  audioCache.set(key, {
    audioBase64,
    contentType,
    timestamp: Date.now(),
  });
}

/**
 * Find the oldest cache entry
 */
function findOldestCacheEntry(): string | null {
  let oldestKey: string | null = null;
  let oldestTime = Infinity;

  for (const [key, value] of audioCache.entries()) {
    if (value.timestamp < oldestTime) {
      oldestTime = value.timestamp;
      oldestKey = key;
    }
  }

  return oldestKey;
}

/**
 * Clear all cached audio
 */
export function clearAudioCache(): void {
  audioCache.clear();
}

/**
 * Get current cache size
 */
export function getAudioCacheSize(): number {
  return audioCache.size;
}

/**
 * Check if a cache key exists
 */
export function hasCachedAudio(key: string): boolean {
  const cached = getCachedAudio(key);
  return cached !== null;
}

/**
 * Generate a simple key for progress (just based on text, not voice/speed)
 */
export function generateProgressKey(text: string): string {
  return hashString(text);
}

/**
 * Save playback progress for a text
 */
export function savePlaybackProgress(
  textKey: string,
  currentTime: number
): void {
  progressCache.set(textKey, {
    currentTime,
    timestamp: Date.now(),
  });
}

/**
 * Get saved playback progress for a text
 */
export function getPlaybackProgress(textKey: string): number | null {
  const progress = progressCache.get(textKey);

  if (!progress) {
    return null;
  }

  // Check if progress entry has expired
  if (Date.now() - progress.timestamp > CACHE_TTL_MS) {
    progressCache.delete(textKey);
    return null;
  }

  return progress.currentTime;
}

/**
 * Clear playback progress for a text
 */
export function clearPlaybackProgress(textKey: string): void {
  progressCache.delete(textKey);
}
