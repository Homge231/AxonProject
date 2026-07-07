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
// Key = Lowercase core name as stored in the DB cores.name column.

const CORE_REGISTRY: Record<string, CoreModule> = {
  // ── No Core (default) ──────────────────────────────────────────────────────
  'no core': {
    id:           'no-core',
    name:         'No Core',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },

  // ── Combo Branch ───────────────────────────────────────────────────────────
  'combo core': {
    id:           'combo-core',
    name:         'Combo Core',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },
  'radiant combo': {
    id:           'radiant-combo',
    name:         'Radiant Combo',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },
  'prismatic combo': {
    id:           'prismatic-combo',
    name:         'Prismatic Combo',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },

  // ── Oracle Branch ──────────────────────────────────────────────────────────
  'oracle core': {
    id:           'oracle-core',
    name:         'Oracle Core',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },
  'clairvoyance': {
    id:           'clairvoyance',
    name:         'Clairvoyance',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },
  'omniscience': {
    id:           'omniscience',
    name:         'Omniscience',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },

  // ── Speedster Branch ───────────────────────────────────────────────────────
  'speedster': {
    id:             'speedster',
    name:           'Speedster',
    timerColor:     'text-cyan-300',
    timerClass:     'speedster-timer-glow',
    timerIconClass: 'speedster-timer-icon',
    popupType:      'speedster',
    showWindOverlay: true,
  },
  'time warp': {
    id:             'time-warp',
    name:           'Time Warp',
    timerColor:     'text-cyan-300',
    timerClass:     'speedster-timer-glow',
    timerIconClass: 'speedster-timer-icon',
    popupType:      'speedster',
    showWindOverlay: true,
  },
  'chronobreak': {
    id:             'chronobreak',
    name:           'Chronobreak',
    timerColor:     'text-cyan-300',
    timerClass:     'speedster-timer-glow',
    timerIconClass: 'speedster-timer-icon',
    popupType:      'speedster',
    showWindOverlay: true,
  },

  // ── Mission Branch ─────────────────────────────────────────────────────────
  'mission core': {
    id:           'mission-core',
    name:         'Mission Core',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },
  'bounty hunter': {
    id:           'bounty-hunter',
    name:         'Bounty Hunter',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },
  'exodia': {
    id:           'exodia',
    name:         'Exodia',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },

  // ── Aegis Branch ───────────────────────────────────────────────────────────
  'aegis shield': {
    id:           'aegis-shield',
    name:         'Aegis Shield',
    timerColor:   'text-cyan-400',
    timerClass:   'shadow-cyan-500',
    timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    popupType:    'correct',
  },
  'reflective aegis': {
    id:           'reflective-aegis',
    name:         'Reflective Aegis',
    timerColor:   'text-cyan-400',
    timerClass:   'shadow-cyan-500',
    timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    popupType:    'correct',
  },
  'bastion of light': {
    id:           'bastion-of-light',
    name:         'Bastion of Light',
    timerColor:   'text-cyan-400',
    timerClass:   'shadow-cyan-500',
    timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    popupType:    'correct',
  },

  // ── Balanced Branch ────────────────────────────────────────────────────────
  'balanced core': {
    id:           'balanced-core',
    name:         'Balanced Core',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },
  'harmony core': {
    id:           'harmony-core',
    name:         'Harmony Core',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },
  'perfect harmony': {
    id:           'perfect-harmony',
    name:         'Perfect Harmony',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },

  // ── Power Branch ───────────────────────────────────────────────────────────
  'power core': {
    id:           'power-core',
    name:         'Power Core',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },
  'overclock core': {
    id:           'overclock-core',
    name:         'Overclock Core',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },
  'supernova core': {
    id:           'supernova-core',
    name:         'Supernova Core',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },

  // ── Pandora Branch ─────────────────────────────────────────────────────────
  'pandora\'s box': {
    id:           'pandoras-box',
    name:         'Pandora\'s Box',
    timerColor:   'text-purple-400',
    timerClass:   'animate-pulse shadow-purple-500',
    timerIconClass: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    popupType:    'correct',
  },
  'trickster\'s glass': {
    id:           'tricksters-glass',
    name:         'Trickster\'s Glass',
    timerColor:   'text-purple-400',
    timerClass:   'animate-pulse shadow-purple-500',
    timerIconClass: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    popupType:    'correct',
  },
  'chaos theory': {
    id:           'chaos-theory',
    name:         'Chaos Theory',
    timerColor:   'text-purple-400',
    timerClass:   'animate-pulse shadow-purple-500',
    timerIconClass: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    popupType:    'correct',
  },
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
 * Returns the CoreModule for the given core name.
 * Falls back to a neutral default if the name is unknown or null.
 */
export function getCoreModule(name: string | null | undefined): CoreModule {
  if (!name) return _fallback
  const key = name.trim().toLowerCase()
  return CORE_REGISTRY[key] ?? _fallback
}

/**
 * Convenience: resolve the core name.
 */
export function getCoreName(name: string | null | undefined): string {
  return getCoreModule(name).name
}

export type { CoreModule }
