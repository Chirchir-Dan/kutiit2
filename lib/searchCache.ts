// lib/searchCache.ts
// Simple in-memory cache for search results

interface CacheEntry {
  results: any[];
  timestamp: number;
  count: number;
}

class SearchCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxAge: number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Store search results in cache
  set(key: string, results: any[], count: number) {
    this.cache.set(key, {
      results,
      count,
      timestamp: Date.now()
    });
    console.log(`📦 Cached: "${key}" (${results.length} results) - Valid for 24 hours`);
  }

  // Get cached results if they exist and aren't expired
  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if cache is expired (older than 24 hours)
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      console.log(`⏰ Cache expired: "${key}" (24 hours passed)`);
      return null;
    }
    
    console.log(`✅ Cache hit: "${key}"`);
    return entry;
  }

  // Clear all cached data
  clear() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Get cache size
  size() {
    return this.cache.size;
  }

  // Remove expired entries
  cleanup() {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
      console.log(`🧹 Cleaned ${removed} expired cache entries (24h+ old)`);
    }
  }
}

// Create a single instance to use across the app
export const searchCache = new SearchCache();

// Run cleanup every hour (since cache lasts 24h)
if (typeof window === 'undefined') {
  setInterval(() => searchCache.cleanup(), 60 * 60 * 1000);
}