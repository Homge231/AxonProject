/**
 * Centralized icon path registry for all Support Cores.
 *
 * Icons are stored in Supabase Storage bucket `core-icons` and the URL
 * is persisted in the `cores.icon_url` column.  This module provides a
 * **local fallback** mapping so the UI can still render an icon when the
 * DB value hasn't been populated yet (e.g. during development).
 *
 * Once icon_url is populated in the DB, this file is only used as a
 * fallback and for the `getCoreIconPath()` helper.
 */
import { CORE_FAMILIES } from './families'

/** Convert a core name to a filesystem-safe slug */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')   // remove apostrophes
    .replace(/\s+/g, '-')   // spaces → hyphens
}

/** Build the icon path from family + core name */
function toIconPath(family: string, name: string): string {
  return `/icons/cores/${family}/${toSlug(name)}.svg`
}

// Auto-build the full map from CORE_FAMILIES
export const CORE_ICON_MAP: Record<string, string> = {}

for (const [family, tiers] of Object.entries(CORE_FAMILIES)) {
  for (const name of [...tiers.tier1, ...tiers.tier2, ...tiers.tier3]) {
    CORE_ICON_MAP[name.toLowerCase()] = toIconPath(family, name)
  }
}

export const DEFAULT_ICON = '/icons/cores/default.svg'

/**
 * Get the icon path for a core by name.
 * Prefers `icon_url` from DB if available, falls back to local path.
 */
export function getCoreIconPath(coreName: string, iconUrl?: string | null): string {
  if (iconUrl && iconUrl.startsWith('http')) {
    return iconUrl
  }
  return CORE_ICON_MAP[coreName.toLowerCase()] ?? DEFAULT_ICON
}
