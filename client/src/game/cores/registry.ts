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

  // ── Phoenix Branch (US-29 Upgrades) ────────────────────────────────────────
  'phoenix': {
    id:           '11111111-1111-1111-1111-111111111111',
    name:         'Phoenix',
    timerColor:   'text-hexred',
    timerClass:   'drop-shadow-[0_0_10px_rgba(230,57,70,0.8)]',
    timerIconClass: '',
    popupType:    'correct',
  },
  'phoenix flame': {
    id:           '11111111-1111-1111-1111-222222222222',
    name:         'Phoenix Flame',
    timerColor:   'text-orange',
    timerClass:   'drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]',
    timerIconClass: '',
    popupType:    'correct',
  },
  'rebirth': {
    id:           '11111111-1111-1111-1111-333333333333',
    name:         'Rebirth',
    timerColor:   'text-green-400',
    timerClass:   'drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]',
    timerIconClass: '',
    popupType:    'correct',
  },
  'ashes to ashes': {
    id:           '11111111-1111-1111-1111-444444444444',
    name:         'Ashes to Ashes',
    timerColor:   'text-gray-400',
    timerClass:   'drop-shadow-[0_0_10px_rgba(156,163,175,0.8)]',
    timerIconClass: '',
    popupType:    'correct',
  },
  'immortal phoenix': {
    id:           '11111111-1111-1111-1111-555555555555',
    name:         'Immortal Phoenix',
    timerColor:   'text-red-500',
    timerClass:   'drop-shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse',
    timerIconClass: '',
    popupType:    'correct',
  },
  'eternal rebirth': {
    id:           '11111111-1111-1111-1111-666666666666',
    name:         'Eternal Rebirth',
    timerColor:   'text-emerald-400',
    timerClass:   'drop-shadow-[0_0_20px_rgba(52,211,153,1)]',
    timerIconClass: '',
    popupType:    'correct',
  },
  'supernova ashes': {
    id:           '11111111-1111-1111-1111-777777777777',
    name:         'Supernova Ashes',
    timerColor:   'text-yellow-300',
    timerClass:   'drop-shadow-[0_0_25px_rgba(253,224,71,1)] animate-bounce',
    timerIconClass: '',
    popupType:    'correct',
  },

  // ── High Roller Branch (US-29 Upgrades) ────────────────────────────────────
  'high roller': {
    id:           '22222222-2222-2222-2222-222222222222',
    name:         'High Roller',
    timerColor:   'text-purple-400',
    timerClass:   'drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]',
    timerIconClass: '',
    popupType:    'correct',
  },
  'jackpot': {
    id:           '22222222-2222-2222-2222-111111111111',
    name:         'Jackpot',
    timerColor:   'text-yellow-400',
    timerClass:   'drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]',
    timerIconClass: '',
    popupType:    'correct',
  },
  'safe bet': {
    id:           '22222222-2222-2222-2222-333333333333',
    name:         'Safe Bet',
    timerColor:   'text-blue-400',
    timerClass:   'drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]',
    timerIconClass: '',
    popupType:    'correct',
  },
  'double or nothing': {
    id:           '22222222-2222-2222-2222-444444444444',
    name:         'Double or Nothing',
    timerColor:   'text-pink-500',
    timerClass:   'drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]',
    timerIconClass: '',
    popupType:    'correct',
  },
  'all in': {
    id:           '22222222-2222-2222-2222-555555555555',
    name:         'All In',
    timerColor:   'text-red-600',
    timerClass:   'drop-shadow-[0_0_20px_rgba(220,38,38,1)] animate-pulse',
    timerIconClass: '',
    popupType:    'correct',
  },
  'house advantage': {
    id:           '22222222-2222-2222-2222-666666666666',
    name:         'House Advantage',
    timerColor:   'text-indigo-400',
    timerClass:   'drop-shadow-[0_0_15px_rgba(129,140,248,0.8)]',
    timerIconClass: '',
    popupType:    'correct',
  },
  'russian roulette': {
    id:           '22222222-2222-2222-2222-777777777777',
    name:         'Russian Roulette',
    timerColor:   'text-zinc-500',
    timerClass:   'drop-shadow-[0_0_15px_rgba(113,113,122,1)]',
    timerIconClass: '',
    popupType:    'correct',
  },

  // ── Combo Branch ───────────────────────────────────────────────────────────
  'perfect combo': {
    id:           'perfect-combo',
    name:         'Perfect Combo',
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
  'argus eyes': {
    id:           'argus-eyes',
    name:         'Argus Eyes',
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
  'mission impossible': {
    id:           'mission-impossible',
    name:         'Mission Impossible',
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
  'balance': {
    id:           'balance',
    name:         'Balance',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },
  'harmony': {
    id:           'harmony-core',
    name:         'Harmony',
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
  'power strike': {
    id:           'power-strike',
    name:         'Power Strike',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },
  'overclock': {
    id:           'overclock-core',
    name:         'Overclock',
    timerColor:   'text-lightOrange',
    timerClass:   '',
    timerIconClass: '',
    popupType:    'correct',
  },
  'supernova': {
    id:           'supernova-core',
    name:         'Supernova',
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
  'combo shield': { id: 'combo-shield', name: 'Combo Shield', timerColor: 'text-cyan-400', timerClass: 'shadow-cyan-500', timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]', popupType: 'correct' },
  'combo time': { id: 'combo-time', name: 'Combo Time', timerColor: 'text-cyan-300', timerClass: 'speedster-timer-glow', timerIconClass: 'speedster-timer-icon', popupType: 'speedster', showWindOverlay: true },
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
  'shield mission': { id: 'shield-mission', name: 'Shield Mission', timerColor: 'text-cyan-400', timerClass: 'shadow-cyan-500', timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]', popupType: 'correct' },
  'time mission': { id: 'time-mission', name: 'Time Mission', timerColor: 'text-cyan-300', timerClass: 'speedster-timer-glow', timerIconClass: 'speedster-timer-icon', popupType: 'speedster', showWindOverlay: true },
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
  'zenith': { id: 'zenith-core', name: 'Zenith', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'nirvana': { id: 'nirvana', name: 'Nirvana', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'cosmic balance': { id: 'cosmic-balance', name: 'Cosmic Balance', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },

  // ── Power Branch Upgrades ──
  'hypercharge': { id: 'hypercharge', name: 'Hypercharge', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'power surge': { id: 'power-surge', name: 'Power Surge', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'brute force': { id: 'brute-force', name: 'Brute Force', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'gigawatt': { id: 'gigawatt-core', name: 'Gigawatt', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
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
  'swift mission': { id: 'swift-mission', name: 'Swift Mission', timerColor: 'text-cyan-300', timerClass: 'speedster-timer-glow', timerIconClass: 'speedster-timer-icon', popupType: 'speedster', showWindOverlay: true },
  'mission master': { id: 'mission-master', name: 'Mission Master', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'shield burst': { id: 'shield-burst', name: 'Shield Burst', timerColor: 'text-cyan-400', timerClass: 'shadow-cyan-500', timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]', popupType: 'correct' },
  'guardian angel': { id: 'guardian-angel', name: 'Guardian Angel', timerColor: 'text-cyan-400', timerClass: 'shadow-cyan-500', timerIconClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]', popupType: 'correct' },
  'overload': { id: 'overload', name: 'Overload', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
  'supermassive': { id: 'supermassive-core', name: 'Supermassive', timerColor: 'text-lightOrange', timerClass: '', timerIconClass: '', popupType: 'correct' },
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

/**
 * Checks if the given core name belongs to the Combo Core family.
 */
export function isComboCore(name: string | null | undefined): boolean {
  if (!name) return false
  const key = name.trim().toLowerCase()
  return [
    'perfect combo',
    'radiant combo',
    'prismatic combo',
    'combo time',
    'combo multiplier',
    'golden combo',
    'chain lightning',
    'combo mastery',
    'combo focus',
    'super combo',
    'combo shield',
    'speed demon'
  ].includes(key)
}

/**
 * Checks if the given core name belongs to the Oracle Core family.
 */
export function isOracleCore(name: string | null | undefined): boolean {
  if (!name) return false
  const key = name.trim().toLowerCase()
  return [
    'argus eyes',
    'clairvoyance',
    'omniscience',
    'third eye',
    'future sight',
    'divine guidance',
    'mind reader',
    'predictive strike',
    'cosmic wisdom',
    'oracle blessing',
    'divine eye'
  ].includes(key)
}

/**
 * Checks if the given core name belongs to the Speedster family.
 */
export function isSpeedsterCore(name: string | null | undefined): boolean {
  if (!name) return false
  const key = name.trim().toLowerCase()
  return [
    'speedster',
    'time warp',
    'chronobreak',
    'mach speed',
    'overdrive',
    'time freeze',
    'warp speed',
    'grand prix',
    'speed demon',
    'sonic boom',
    'speed shield',
    'combo time',
    'time mission',
    'swift mission'
  ].includes(key)
}

/**
 * Checks if the given core name belongs to the Mission Core family.
 */
export function isMissionCore(name: string | null | undefined): boolean {
  if (!name) return false
  const key = name.trim().toLowerCase()
  return [
    'mission impossible',
    'bounty hunter',
    'exodia',
    'daily quest',
    'time mission',
    'bounty overlord',
    'apex predator',
    'mission specialist',
    'swift mission',
    'mission master',
    'shield mission'
  ].includes(key)
}

/**
 * Checks if the given core name belongs to the Aegis Shield family.
 */
export function isAegisCore(name: string | null | undefined): boolean {
  if (!name) return false
  const key = name.trim().toLowerCase()
  return [
    'aegis shield',
    'reflective aegis',
    'bastion of light',
    'shield battery',
    'fortress aegis',
    'shield synergy',
    'spiked shield',
    'indomitable',
    'aegis nova',
    'shield burst',
    'guardian angel',
    'combo shield',
    'speed shield',
    'shield mission'
  ].includes(key)
}

/**
 * Checks if the given core name belongs to the Pandora's Box family.
 */
export function isPandoraCore(name: string | null | undefined): boolean {
  if (!name) return false
  const key = name.trim().toLowerCase()
  return [
    "pandora's box",
    "trickster's glass",
    "chaos theory",
    'chaos prism',
    'warp reality',
    "pandora's curse",
    'butterfly effect',
    "pandora's wrath",
    'cosmic entropy',
    "pandora's mirror",
    'reality collapse'
  ].includes(key)
}

/**
 * Returns the maximum shield count for the given Aegis-family core name.
 */
export function getMaxShields(name: string | null | undefined): number {
  if (!name) return 3
  const key = name.trim().toLowerCase()
  if (key === 'bastion of light') return 5
  if (key === 'shield battery') return 4
  return 3
}

export type { CoreModule }
