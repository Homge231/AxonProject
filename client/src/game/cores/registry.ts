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
  // ── Combo Branch Upgrades ──
  'combo shield': { id: 'combo-shield', name: 'Combo Shield', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'combo time': { id: 'combo-time', name: 'Combo Time', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'combo multiplier': { id: 'combo-multiplier', name: 'Combo Multiplier', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'golden combo': { id: 'golden-combo', name: 'Golden Combo', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'chain lightning': { id: 'chain-lightning', name: 'Chain Lightning', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'combo mastery': { id: 'combo-mastery', name: 'Combo Mastery', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },

  // ── Speedster Branch Upgrades ──
  'speed shield': { id: 'speed-shield', name: 'Speed Shield', timerColor: 'text-cyan-300', timerClass: 'speedster-timer-glow', timerIconClass: 'speedster-timer-icon', popupType: 'speedster', showWindOverlay: true },
  'mach speed': { id: 'mach-speed', name: 'Mach Speed', timerColor: 'text-cyan-300', timerClass: 'speedster-timer-glow', timerIconClass: 'speedster-timer-icon', popupType: 'speedster', showWindOverlay: true },
  'overdrive': { id: 'overdrive', name: 'Overdrive', timerColor: 'text-cyan-300', timerClass: 'speedster-timer-glow', timerIconClass: 'speedster-timer-icon', popupType: 'speedster', showWindOverlay: true },
  'time freeze': { id: 'time-freeze', name: 'Time Freeze', timerColor: 'text-cyan-300', timerClass: 'speedster-timer-glow', timerIconClass: 'speedster-timer-icon', popupType: 'speedster', showWindOverlay: true },
  'warp speed': { id: 'warp-speed', name: 'Warp Speed', timerColor: 'text-cyan-300', timerClass: 'speedster-timer-glow', timerIconClass: 'speedster-timer-icon', popupType: 'speedster', showWindOverlay: true },
  'grand prix': { id: 'grand-prix', name: 'Grand Prix', timerColor: 'text-cyan-300', timerClass: 'speedster-timer-glow', timerIconClass: 'speedster-timer-icon', popupType: 'speedster', showWindOverlay: true },

  // ── Oracle Branch Upgrades ──
  'third eye': { id: 'third-eye', name: 'Third Eye', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'future sight': { id: 'future-sight', name: 'Future Sight', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'divine guidance': { id: 'divine-guidance', name: 'Divine Guidance', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'mind reader': { id: 'mind-reader', name: 'Mind Reader', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'predictive strike': { id: 'predictive-strike', name: 'Predictive Strike', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'cosmic wisdom': { id: 'cosmic-wisdom', name: 'Cosmic Wisdom', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },

  // ── Mission Branch Upgrades ──
  'daily quest': { id: 'daily-quest', name: 'Daily Quest', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'shield mission': { id: 'shield-mission', name: 'Shield Mission', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'time mission': { id: 'time-mission', name: 'Time Mission', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'bounty overlord': { id: 'bounty-overlord', name: 'Bounty Overlord', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'apex predator': { id: 'apex-predator', name: 'Apex Predator', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'mission specialist': { id: 'mission-specialist', name: 'Mission Specialist', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },

  // ── Aegis Branch Upgrades ──
  'shield battery': { id: 'shield-battery', name: 'Shield Battery', timerColor: 'text-cyan-400', timerClass: 'shadow-cyan-500', timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]', popupType: 'correct' },
  'fortress aegis': { id: 'fortress-aegis', name: 'Fortress Aegis', timerColor: 'text-cyan-400', timerClass: 'shadow-cyan-500', timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]', popupType: 'correct' },
  'shield synergy': { id: 'shield-synergy', name: 'Shield Synergy', timerColor: 'text-cyan-400', timerClass: 'shadow-cyan-500', timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]', popupType: 'correct' },
  'spiked shield': { id: 'spiked-shield', name: 'Spiked Shield', timerColor: 'text-cyan-400', timerClass: 'shadow-cyan-500', timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]', popupType: 'correct' },
  'indomitable': { id: 'indomitable', name: 'Indomitable', timerColor: 'text-cyan-400', timerClass: 'shadow-cyan-500', timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]', popupType: 'correct' },
  'aegis nova': { id: 'aegis-nova', name: 'Aegis Nova', timerColor: 'text-cyan-400', timerClass: 'shadow-cyan-500', timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]', popupType: 'correct' },

  // ── Balanced Branch Upgrades ──
  'equilibrium': { id: 'equilibrium', name: 'Equilibrium', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'yin yang': { id: 'yin-yang', name: 'Yin Yang', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'steady pace': { id: 'steady-pace', name: 'Steady Pace', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'zenith core': { id: 'zenith-core', name: 'Zenith Core', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'nirvana': { id: 'nirvana', name: 'Nirvana', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'cosmic balance': { id: 'cosmic-balance', name: 'Cosmic Balance', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },

  // ── Power Branch Upgrades ──
  'hypercharge': { id: 'hypercharge', name: 'Hypercharge', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'power surge': { id: 'power-surge', name: 'Power Surge', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'brute force': { id: 'brute-force', name: 'Brute Force', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'gigawatt core': { id: 'gigawatt-core', name: 'Gigawatt Core', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'desperado': { id: 'desperado', name: 'Desperado', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'absolute power': { id: 'absolute-power', name: 'Absolute Power', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },

  // ── Pandora Branch Upgrades ──
  'chaos prism': { id: 'chaos-prism', name: 'Chaos Prism', timerColor: 'text-purple-400', timerClass: 'animate-pulse shadow-purple-500', timerIconClass: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]', popupType: 'correct' },
  'warp reality': { id: 'warp-reality', name: 'Warp Reality', timerColor: 'text-purple-400', timerClass: 'animate-pulse shadow-purple-500', timerIconClass: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]', popupType: 'correct' },
  'pandora\'s curse': { id: 'pandoras-curse', name: 'Pandora\'s Curse', timerColor: 'text-purple-400', timerClass: 'animate-pulse shadow-purple-500', timerIconClass: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]', popupType: 'correct' },
  'butterfly effect': { id: 'butterfly-effect', name: 'Butterfly Effect', timerColor: 'text-purple-400', timerClass: 'animate-pulse shadow-purple-500', timerIconClass: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]', popupType: 'correct' },
  'pandora\'s wrath': { id: 'pandoras-wrath', name: 'Pandora\'s Wrath', timerColor: 'text-purple-400', timerClass: 'animate-pulse shadow-purple-500', timerIconClass: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]', popupType: 'correct' },
  'cosmic entropy': { id: 'cosmic-entropy', name: 'Cosmic Entropy', timerColor: 'text-purple-400', timerClass: 'animate-pulse shadow-purple-500', timerIconClass: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]', popupType: 'correct' },
  'harmony wave': { id: 'harmony-wave', name: 'Harmony Wave', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'universal harmony': { id: 'universal-harmony', name: 'Universal Harmony', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'combo focus': { id: 'combo-focus', name: 'Combo Focus', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'super combo': { id: 'super-combo', name: 'Super Combo', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'speed demon': { id: 'speed-demon', name: 'Speed Demon', timerColor: 'text-cyan-300', timerClass: 'speedster-timer-glow', timerIconClass: 'speedster-timer-icon', popupType: 'speedster', showWindOverlay: true },
  'sonic boom': { id: 'sonic-boom', name: 'Sonic Boom', timerColor: 'text-cyan-300', timerClass: 'speedster-timer-glow', timerIconClass: 'speedster-timer-icon', popupType: 'speedster', showWindOverlay: true },
  'oracle blessing': { id: 'oracle-blessing', name: 'Oracle Blessing', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'divine eye': { id: 'divine-eye', name: 'Divine Eye', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'swift mission': { id: 'swift-mission', name: 'Swift Mission', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'mission master': { id: 'mission-master', name: 'Mission Master', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'shield burst': { id: 'shield-burst', name: 'Shield Burst', timerColor: 'text-cyan-400', timerClass: 'shadow-cyan-500', timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]', popupType: 'correct' },
  'guardian angel': { id: 'guardian-angel', name: 'Guardian Angel', timerColor: 'text-cyan-400', timerClass: 'shadow-cyan-500', timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]', popupType: 'correct' },
  'overload': { id: 'overload', name: 'Overload', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'supermassive core': { id: 'supermassive-core', name: 'Supermassive Core', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'pandora\'s mirror': { id: 'pandoras-mirror', name: 'Pandora\'s Mirror', timerColor: 'text-purple-400', timerClass: 'animate-pulse shadow-purple-500', timerIconClass: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]', popupType: 'correct' },
  'reality collapse': { id: 'reality-collapse', name: 'Reality Collapse', timerColor: 'text-purple-400', timerClass: 'animate-pulse shadow-purple-500', timerIconClass: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]', popupType: 'correct' },
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
