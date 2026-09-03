import { Injectable } from '@angular/core';
const CACHE_VERSION = 1;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEnvelope<T> {
  _v: number;
  _t: number;
  data: T;
}
/**
 * Abstraction over localStorage for testability and type safety.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      
      // If it's an old schema or missing our envelope, invalidate it
      if (typeof parsed !== 'object' || parsed === null || !('_v' in parsed)) {
        this.remove(key);
        return null;
      }
      
      const envelope = parsed as CacheEnvelope<T>;
      if (envelope._v !== CACHE_VERSION) {
        this.remove(key);
        return null;
      }
      
      if (Date.now() - envelope._t > CACHE_TTL_MS) {
        this.remove(key);
        return null;
      }
      
      return envelope.data;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      const envelope: CacheEnvelope<T> = {
        _v: CACHE_VERSION,
        _t: Date.now(),
        data: value,
      };
      localStorage.setItem(key, JSON.stringify(envelope));
    } catch {
      // Storage full or unavailable — fail silently
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Fail silently
    }
  }

  has(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }
}
