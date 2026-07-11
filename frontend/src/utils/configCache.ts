/**
 * configCache.ts
 * Módulo de caché en localStorage para la configuración de catálogos (tarjetas, formas de pago, aerolíneas, etc.).
 * TTL: 15 minutos — ya que los catálogos cambian con menos frecuencia que las ventas.
 * Al crear, modificar o eliminar elementos de los catálogos, el caché se invalida o se actualiza automáticamente.
 */

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos

function getCacheKey(baseKey: string): string {
  try {
    const token = localStorage.getItem('itea_token');
    if (!token) return `${baseKey}_anonymous`;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return `${baseKey}_${payload.userId || 'unknown'}`;
  } catch {
    return `${baseKey}_anonymous`;
  }
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // ignorar silenciosamente en caso de cuota excedida
  }
}

function deleteCache(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

// ---------- API pública ----------

export function saveConfigCache(config: Record<string, any>): void {
  // Guardamos solo las listas de catálogos, excluyendo permisos de rol si estuviesen presentes
  const cacheData = { ...config };
  delete cacheData.rolePermissions; // Los permisos de roles se guardan por separado
  writeCache(getCacheKey('itea_config_cache'), cacheData);
}

export function loadConfigCache(): Record<string, any[]> | null {
  return readCache<Record<string, any[]>>(getCacheKey('itea_config_cache'));
}

export function invalidateConfigCache(): void {
  deleteCache(getCacheKey('itea_config_cache'));
}

// ---------- Cache específico para permisos de rol (sin TTL corto) ----------
const ROLE_PERMS_TTL_MS = 60 * 60 * 1000; // 1 hora

export function saveRolePermissionsCache(rolePermissions: { asesor: any; freelancer: any }): void {
  try {
    const entry = { data: rolePermissions, timestamp: Date.now() };
    localStorage.setItem('itea_role_perms_cache', JSON.stringify(entry));
  } catch {}
}

export function loadRolePermissionsCache(): { asesor: any; freelancer: any } | null {
  try {
    const raw = localStorage.getItem('itea_role_perms_cache');
    if (!raw) return null;
    const entry = JSON.parse(raw);
    const age = Date.now() - entry.timestamp;
    if (age > ROLE_PERMS_TTL_MS) {
      localStorage.removeItem('itea_role_perms_cache');
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function invalidateRolePermissionsCache(): void {
  localStorage.removeItem('itea_role_perms_cache');
}

