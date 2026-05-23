/**
 * dashboardCache.ts
 * Módulo de caché en localStorage para el Dashboard.
 * TTL: 5 minutos.
 */

const DASHBOARD_CACHE_KEY = 'itea_dashboard_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function saveDashboardCache(data: any): void {
  try {
    const entry: CacheEntry<any> = { data, timestamp: Date.now() };
    localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignorar si localStorage está lleno
  }
}

export function loadDashboardCache(): any | null {
  try {
    const raw = localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry<any> = JSON.parse(raw);
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL_MS) {
      localStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function invalidateDashboardCache(): void {
  try {
    localStorage.removeItem(DASHBOARD_CACHE_KEY);
  } catch {}
}
