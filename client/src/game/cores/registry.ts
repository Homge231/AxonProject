// ── Frontend Core Registry ────────────────────────────────────────────────────
//
// HOW TO ADD A NEW CORE — only this file needs to change:
//   1. Get the UUID from Supabase once you create the core row
//   2. Add one entry to CORE_REGISTRY below
//   Done ✅
//
// UUID placeholder: use PENDING_UUID for cores not yet created in Supabase.
// Once the Supabase row exists, replace PENDING_UUID with the real UUID string.
// ─────────────────────────────────────────────────────────────────────────────

import type { CoreModule } from './BaseCore'

// ── Registry ──────────────────────────────────────────────────────────────────
// Key = Supabase cores.id UUID.

const CORE_REGISTRY: Record<string, CoreModule> = {
  // ── No Core (default) ──────────────────────────────────────────────────────
  '00000000-0000-0000-0000-000000000001': {
    id:           '00000000-0000-0000-0000-000000000001',
    name:         'No Core',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },

  // ── Combo Core ─────────────────────────────────────────────────────────────
  '00000000-0000-0000-0000-000000000005': {
    id:           '00000000-0000-0000-0000-000000000005',
    name:         'Combo Core',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },

  // ── Oracle Core ────────────────────────────────────────────────────────────
  '00000000-0000-0000-0000-000000000006': {
    id:           '00000000-0000-0000-0000-000000000006',
    name:         'Oracle Core',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },

  // ── Speedster Core ─────────────────────────────────────────────────────────
  '00000000-0000-0000-0000-000000000007': {
    id:             '00000000-0000-0000-0000-000000000007',
    name:           'Speedster',
    timerColor:     'text-cyan-300',
    timerClass:     'speedster-timer-glow',
    timerIconClass: 'speedster-timer-icon',
    popupType:      'speedster',
    showWindOverlay: true,
  },

  // ── Pandora's Box ──────────────────────────────────────────────────────────
  '00000000-0000-0000-0000-000000000010': {
    id:           '00000000-0000-0000-0000-000000000010',
    name:         'Pandora\'s Box',
    timerColor:   'text-purple-400',
    timerClass:   'animate-pulse shadow-purple-500',
    timerIconClass: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    popupType:    'correct',
  },

  // ↑ Add new cores here — nothing else needs to change.
}

// ── Fallback ──────────────────────────────────────────────────────────────────
const _fallback: CoreModule = {
  id:             '',
  name:           'Unknown',
  timerColor:     'text-lightOrange',
  timerClass:     '',
  timerIconClass: '',
  popupType:      'correct',
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the CoreModule for the given Supabase UUID.
 * Falls back to a neutral default if the UUID is unknown or null.
 */
export function getCoreModule(id: string | null | undefined): CoreModule {
  if (!id) return _fallback
  return CORE_REGISTRY[id] ?? _fallback
}

/**
 * Convenience: resolve the core name from a UUID.
 * Useful for display labels.
 */
export function getCoreName(id: string | null | undefined): string {
  return getCoreModule(id).name
}

export type { CoreModule }
