// Tile cache — in-memory LRU cache for satellite imagery tiles
// Prevents redundant Sentinel Hub API calls

interface CacheEntry {
  data: ArrayBuffer;
  contentType: string;
  timestamp: number;
  size: number;
}

const MAX_CACHE_SIZE_MB = 256;
const MAX_CACHE_ENTRIES = 500;
const TTL_MS = 30 * 60 * 1000; // 30 minutes

class TileCache {
  private cache = new Map<string, CacheEntry>();
  private totalSize = 0;

  /**
   * Generate cache key from tile parameters
   */
  static key(params: {
    bbox: string;
    type: string;
    width?: number;
    height?: number;
  }): string {
    return `${params.type}:${params.bbox}:${params.width ?? 512}x${params.height ?? 512}`;
  }

  /**
   * Get cached tile if available and not expired
   */
  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > TTL_MS) {
      this.delete(key);
      return null;
    }

    // Move to end (LRU refresh)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry;
  }

  /**
   * Store a tile in cache
   */
  set(key: string, data: ArrayBuffer, contentType: string): void {
    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.delete(key);
    }

    const size = data.byteLength;

    // Evict old entries if needed
    while (
      this.totalSize + size > MAX_CACHE_SIZE_MB * 1024 * 1024 ||
      this.cache.size >= MAX_CACHE_ENTRIES
    ) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.delete(oldest);
      else break;
    }

    this.cache.set(key, {
      data,
      contentType,
      timestamp: Date.now(),
      size,
    });
    this.totalSize += size;
  }

  private delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.totalSize -= entry.size;
      this.cache.delete(key);
    }
  }

  /**
   * Cache stats for monitoring
   */
  stats() {
    return {
      entries: this.cache.size,
      sizeMB: (this.totalSize / (1024 * 1024)).toFixed(1),
      maxSizeMB: MAX_CACHE_SIZE_MB,
      hitRate: "N/A", // Would need tracking
    };
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.totalSize = 0;
  }
}

// Singleton instance
export const tileCache = new TileCache();
