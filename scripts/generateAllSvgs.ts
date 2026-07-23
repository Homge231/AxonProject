import fs from 'fs'
import path from 'path'

// Define the core families and cores to match families.ts
const CORE_FAMILIES = {
  'combo': {
    tier1: ['Combo Core'],
    tier2: ['Radiant Combo', 'Combo Shield', 'Combo Time', 'Combo Multiplier', 'Combo Focus'],
    tier3: ['Prismatic Combo', 'Golden Combo', 'Chain Lightning', 'Combo Mastery', 'Super Combo']
  },
  'speedster': {
    tier1: ['Speedster'],
    tier2: ['Time Warp', 'Speed Shield', 'Mach Speed', 'Overdrive', 'Speed Demon'],
    tier3: ['Chronobreak', 'Time Freeze', 'Warp Speed', 'Grand Prix', 'Sonic Boom']
  },
  'oracle': {
    tier1: ['Oracle Core'],
    tier2: ['Clairvoyance', 'Third Eye', 'Future Sight', 'Divine Guidance', 'Oracle Blessing'],
    tier3: ['Omniscience', 'Mind Reader', 'Predictive Strike', 'Cosmic Wisdom', 'Divine Eye']
  },
  'mission': {
    tier1: ['Mission Core'],
    tier2: ['Bounty Hunter', 'Daily Quest', 'Shield Mission', 'Time Mission', 'Swift Mission'],
    tier3: ['Exodia', 'Bounty Overlord', 'Apex Predator', 'Mission Specialist', 'Mission Master']
  },
  'aegis': {
    tier1: ['Aegis Shield'],
    tier2: ['Reflective Aegis', 'Shield Battery', 'Fortress Aegis', 'Shield Synergy', 'Shield Burst'],
    tier3: ['Bastion of Light', 'Spiked Shield', 'Indomitable', 'Aegis Nova', 'Guardian Angel']
  },
  'balanced': {
    tier1: ['Balanced Core'],
    tier2: ['Harmony Core', 'Equilibrium', 'Yin Yang', 'Steady Pace', 'Harmony Wave'],
    tier3: ['Perfect Harmony', 'Zenith Core', 'Nirvana', 'Cosmic Balance', 'Universal Harmony']
  },
  'power': {
    tier1: ['Power Core'],
    tier2: ['Overclock Core', 'Hypercharge', 'Power Surge', 'Brute Force', 'Overload'],
    tier3: ['Supernova Core', 'Gigawatt Core', 'Desperado', 'Absolute Power', 'Supermassive Core']
  },
  'pandora': {
    tier1: ["Pandora's Box"],
    tier2: ["Trickster's Glass", 'Chaos Prism', 'Warp Reality', "Pandora's Curse", "Pandora's Mirror"],
    tier3: ['Chaos Theory', 'Butterfly Effect', "Pandora's Wrath", 'Cosmic Entropy', 'Reality Collapse']
  }
}

// Convert name to slug
function toSlug(name: string): string {
  return name.toLowerCase().replace(/['']/g, '').replace(/\s+/g, '-')
}

// Colors and gradients for each family
const FAMILY_THEMES: Record<string, {
  primary: string,
  secondary: string,
  accent: string,
  stop1: string,
  stop2: string,
  glow: string
}> = {
  balanced: {
    primary: '#3B82F6', // blue
    secondary: '#60A5FA', // lightBlue
    accent: '#F8FAFC', // white
    stop1: '#0F172A', // darkNavy
    stop2: '#080c16',
    glow: '#3B82F6'
  },
  combo: {
    primary: '#FF7B00', // orange
    secondary: '#FFA62B', // lightOrange
    accent: '#E63946', // hexred
    stop1: '#1c0e08',
    stop2: '#0e0704',
    glow: '#FF7B00'
  },
  speedster: {
    primary: '#60A5FA', // lightBlue
    secondary: '#3B82F6', // blue
    accent: '#FFA62B', // lightOrange
    stop1: '#0d1624',
    stop2: '#050a12',
    glow: '#60A5FA'
  },
  oracle: {
    primary: '#3B82F6', // blue
    secondary: '#FFA62B', // lightOrange
    accent: '#F8FAFC', // white
    stop1: '#0d1324',
    stop2: '#050710',
    glow: '#3B82F6'
  },
  mission: {
    primary: '#FFA62B', // lightOrange
    secondary: '#FF7B00', // orange
    accent: '#22C55E', // success
    stop1: '#1b140a',
    stop2: '#0c0904',
    glow: '#FFA62B'
  },
  aegis: {
    primary: '#3B82F6', // blue
    secondary: '#60A5FA', // lightBlue
    accent: '#F8FAFC', // white
    stop1: '#0c1220',
    stop2: '#050810',
    glow: '#3B82F6'
  },
  power: {
    primary: '#E63946', // hexred
    secondary: '#FF7B00', // orange
    accent: '#FFA62B', // lightOrange
    stop1: '#20080c',
    stop2: '#0e0305',
    glow: '#E63946'
  },
  pandora: {
    primary: '#FF7B00', // orange
    secondary: '#3B82F6', // blue
    accent: '#E63946', // hexred
    stop1: '#100d18',
    stop2: '#06050b',
    glow: '#FF7B00'
  }
}

// Generate the inner SVG content for a given core
function getCoreSymbol(coreName: string, theme: any): string {
  const norm = coreName.trim().toLowerCase()

  // Helper colors
  const p = theme.primary
  const s = theme.secondary
  const a = theme.accent

  switch (norm) {
    // ── BALANCED FAMILY ──────────────────────────────────────────────────────────
    case 'balanced core':
      return `
        <!-- Balanced Scales -->
        <g stroke="${p}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="64" y1="36" x2="64" y2="92" stroke-width="4" />
          <line x1="48" y1="92" x2="80" y2="92" stroke-width="4" />
          <line x1="36" y1="44" x2="92" y2="44" stroke="${a}" stroke-width="4" />
          <circle cx="64" cy="44" r="3" fill="${a}" stroke="none" />
          <!-- Left Plate -->
          <line x1="36" y1="44" x2="24" y2="68" stroke-width="1.5" />
          <line x1="36" y1="44" x2="48" y2="68" stroke-width="1.5" />
          <path d="M20,68 L52,68 C52,78 20,78 20,68 Z" fill="${p}" fill-opacity="0.1" stroke-width="2" />
          <!-- Right Plate -->
          <line x1="92" y1="44" x2="80" y2="68" stroke-width="1.5" />
          <line x1="92" y1="44" x2="104" y2="68" stroke-width="1.5" />
          <path d="M76,68 L108,68 C108,78 76,78 76,68 Z" fill="${p}" fill-opacity="0.1" stroke-width="2" />
        </g>
      `
    case 'harmony core':
      return `
        <!-- Yin Yang styled Balance -->
        <g stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="28" stroke-width="4" />
          <path d="M64,36 C78,36 78,64 64,64 C50,64 50,92 64,92" fill="${s}" fill-opacity="0.1" stroke-width="3" />
          <circle cx="64" cy="50" r="4" fill="${a}" stroke="none" />
          <circle cx="64" cy="78" r="4" fill="${p}" stroke="none" />
        </g>
      `
    case 'perfect harmony':
      return `
        <!-- Complex Geometry Mandala -->
        <g stroke="${a}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="30" />
          <polygon points="64,34 90,79 38,79" stroke="${p}" />
          <polygon points="64,94 38,49 90,49" stroke="${s}" />
          <circle cx="64" cy="64" r="8" fill="${a}" fill-opacity="0.2" />
        </g>
      `
    case 'equilibrium':
      return `
        <!-- Mirrored geometric balance -->
        <g stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="64,32 92,60 36,60" stroke="${s}" />
          <polygon points="64,96 36,68 92,68" stroke="${a}" />
          <line x1="30" y1="64" x2="98" y2="64" stroke-width="2" stroke-dasharray="4,4" />
        </g>
      `
    case 'yin yang':
      return `
        <!-- Classic Yin Yang -->
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="30" stroke="${p}" stroke-width="4" />
          <path d="M64,34 A15,15 0 0,0 64,64 A15,15 0 0,1 64,94 A30,30 0 0,1 64,34 Z" fill="${p}" fill-opacity="0.2" stroke="${p}" stroke-width="3" />
          <path d="M64,34 A15,15 0 0,0 64,64 A15,15 0 0,1 64,94 A30,30 0 0,0 64,34 Z" fill="${s}" fill-opacity="0.1" stroke="${s}" stroke-width="3" />
          <circle cx="64" cy="49" r="5" fill="${a}" />
          <circle cx="64" cy="79" r="5" fill="${p}" />
        </g>
      `
    case 'steady pace':
      return `
        <!-- Metronome pendulum -->
        <g stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="64,32 84,88 44,88" stroke-width="4" />
          <line x1="64" y1="80" x2="64" y2="40" stroke="${a}" stroke-width="4" />
          <circle cx="64" cy="48" r="6" fill="${s}" stroke="none" />
          <!-- Speed arcs -->
          <path d="M52,44 Q64,38 76,44" stroke="${s}" stroke-width="1.5" stroke-dasharray="2,2" />
        </g>
      `
    case 'harmony wave':
      return `
        <!-- Interlocking Sine waves -->
        <g stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M34,64 Q49,40 64,64 T94,64" stroke="${p}" />
          <path d="M34,64 Q49,88 64,64 T94,64" stroke="${s}" />
          <circle cx="64" cy="64" r="6" fill="${a}" stroke="none" />
        </g>
      `
    case 'zenith core':
      return `
        <!-- Mountain and Star -->
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="64,48 94,88 34,88" stroke="${p}" stroke-width="3.5" fill="${p}" fill-opacity="0.1" />
          <polygon points="52,64 64,48 76,64 64,72" stroke="${s}" stroke-width="2" fill="${s}" fill-opacity="0.2" />
          <!-- Star of Zenith -->
          <path d="M64,22 L67,31 L76,31 L69,37 L72,46 L64,40 L56,46 L59,37 L52,31 L61,31 Z" fill="${a}" />
        </g>
      `
    case 'nirvana':
      return `
        <!-- Lotus flower -->
        <g stroke="${p}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- Petals -->
          <path d="M64,38 C64,38 52,56 64,90 C76,56 64,38 64,38 Z" fill="${p}" fill-opacity="0.2" stroke-width="3.5" />
          <path d="M64,52 C44,58 44,78 64,90 C84,78 84,58 64,52 Z" fill="${s}" fill-opacity="0.15" />
          <path d="M64,64 C34,70 34,84 64,90 C94,84 94,70 64,64 Z" fill="${a}" fill-opacity="0.1" stroke="${a}" />
          <circle cx="64" cy="90" r="3" fill="${a}" />
        </g>
      `
    case 'cosmic balance':
      return `
        <!-- Galaxy scale -->
        <g stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <ellipse cx="64" cy="64" rx="34" ry="12" stroke="${s}" stroke-width="2" stroke-dasharray="6,3" />
          <line x1="64" y1="36" x2="64" y2="92" stroke-width="4" />
          <line x1="36" y1="44" x2="92" y2="44" stroke="${a}" stroke-width="4" />
          <!-- Planet weights -->
          <circle cx="36" cy="68" r="8" fill="${p}" stroke="${a}" stroke-width="2" />
          <circle cx="92" cy="68" r="8" fill="${s}" stroke="${a}" stroke-width="2" />
        </g>
      `
    case 'universal harmony':
      return `
        <!-- Celtic Trinity Knot / Triquetra -->
        <g stroke="${a}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M64,34 C76,56 40,78 64,90 C88,78 52,56 64,34 Z" stroke="${p}" />
          <path d="M34,80 C56,68 78,104 90,80 C78,56 56,92 34,80 Z" stroke="${s}" />
          <circle cx="64" cy="64" r="18" stroke-dasharray="4,4" />
        </g>
      `

    // ── COMBO FAMILY ─────────────────────────────────────────────────────────────
    case 'combo core':
      return `
        <!-- Infinity Flame Loop -->
        <g stroke="${p}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M44,64 C44,50 54,44 64,64 C74,84 84,78 84,64 C84,50 74,44 64,64 C54,84 44,78 44,64 Z" stroke-width="5" />
          <path d="M44,64 C44,50 54,44 64,64 C74,84 84,78 84,64" stroke="${a}" stroke-width="2" />
          <!-- Fire accents -->
          <path d="M64,48 Q64,36 68,42" stroke="${s}" stroke-width="3" />
          <path d="M64,80 Q64,92 60,86" stroke="${s}" stroke-width="3" />
        </g>
      `
    case 'radiant combo':
      return `
        <!-- Sunburst combo -->
        <g stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="18" fill="${a}" fill-opacity="0.2" stroke-width="4" />
          <!-- Rays -->
          <line x1="64" y1="36" x2="64" y2="24" stroke="${a}" stroke-width="4" />
          <line x1="64" y1="92" x2="64" y2="104" stroke="${a}" stroke-width="4" />
          <line x1="36" y1="64" x2="24" y2="64" stroke="${a}" stroke-width="4" />
          <line x1="92" y1="64" x2="104" y2="64" stroke="${a}" stroke-width="4" />
          <line x1="44" y1="44" x2="36" y2="36" stroke="${s}" stroke-width="3" />
          <line x1="84" y1="84" x2="92" y2="92" stroke="${s}" stroke-width="3" />
          <line x1="44" y1="84" x2="36" y2="92" stroke="${s}" stroke-width="3" />
          <line x1="84" y1="44" x2="92" y2="36" stroke="${s}" stroke-width="3" />
        </g>
      `
    case 'prismatic combo':
      return `
        <!-- Light refraction triangle -->
        <g stroke-linecap="round" stroke-linejoin="round" fill="none">
          <polygon points="64,34 94,86 34,86" stroke="${p}" stroke-width="4" fill="${p}" fill-opacity="0.1" />
          <!-- Light ray in -->
          <line x1="16" y1="74" x2="52" y2="64" stroke="#fff" stroke-width="4" />
          <!-- Multi-colored fire rays out -->
          <line x1="74" y1="60" x2="112" y2="44" stroke="${a}" stroke-width="4" />
          <line x1="76" y1="66" x2="112" y2="60" stroke="${s}" stroke-width="3.5" />
          <line x1="74" y1="72" x2="112" y2="76" stroke="${p}" stroke-width="3" />
        </g>
      `
    case 'combo shield':
      return `
        <!-- Flame shield -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M34,40 L64,30 L94,40 C94,68 76,88 64,96 C52,88 34,68 34,40 Z" fill="${s}" fill-opacity="0.1" />
          <circle cx="64" cy="56" r="10" fill="${a}" stroke="${a}" stroke-width="2.5" />
          <path d="M64,52 C64,52 60,62 64,66 C68,62 64,52 64,52 Z" fill="#fff" />
        </g>
      `
    case 'combo time':
      return `
        <!-- Hourglass of combo -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="44" y1="36" x2="84" y2="36" stroke-width="5" />
          <line x1="44" y1="92" x2="84" y2="92" stroke-width="5" />
          <path d="M48,36 L52,54 C54,58 60,62 64,62 C68,62 74,58 76,54 L80,36" stroke="${s}" />
          <path d="M48,92 L52,74 C54,70 60,66 64,66 C68,66 74,70 76,74 L80,92" stroke="${s}" />
          <!-- Sand flow of fire -->
          <circle cx="64" cy="64" r="3" fill="${a}" stroke="none" />
          <polygon points="64,48 60,84 68,84" fill="${a}" fill-opacity="0.5" stroke="none" />
        </g>
      `
    case 'combo multiplier':
      return `
        <!-- Multiplier growth chart -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="34" y1="92" x2="94" y2="92" stroke-width="4" />
          <line x1="34" y1="32" x2="34" y2="92" stroke-width="4" />
          <!-- Upward fire trend arrow -->
          <path d="M38,82 L52,68 L68,74 L94,36" stroke="${a}" stroke-width="5" />
          <polygon points="94,36 84,36 94,46" fill="${a}" stroke="none" />
          <circle cx="52" cy="68" r="4" fill="${s}" />
          <circle cx="68" cy="74" r="4" fill="${s}" />
        </g>
      `
    case 'golden combo':
      return `
        <!-- Golden crown/combo master -->
        <g stroke="${a}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M30,84 L38,44 L52,60 L64,36 L76,60 L90,44 L98,84 Z" fill="${a}" fill-opacity="0.2" stroke-width="4" />
          <circle cx="38" cy="38" r="3" fill="${s}" />
          <circle cx="64" cy="30" r="3.5" fill="${s}" />
          <circle cx="90" cy="38" r="3" fill="${s}" />
          <line x1="24" y1="84" x2="104" y2="84" stroke="${p}" stroke-width="4" />
        </g>
      `
    case 'chain lightning':
      return `
        <!-- Lightning combo -->
        <g stroke="${a}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M76,28 L44,56 L64,56 L48,96 L84,64 L64,64 Z" fill="${a}" fill-opacity="0.2" />
          <path d="M80,36 L52,64 L72,64 L56,92" stroke="${s}" stroke-width="2" />
        </g>
      `
    case 'combo mastery':
      return `
        <!-- Mortarboard capped flame -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="64,34 100,48 64,62 28,48" fill="${s}" fill-opacity="0.2" stroke-width="4" />
          <path d="M40,54 L40,80 C40,88 88,88 88,80 L88,54" />
          <path d="M100,48 L104,74 C104,74 98,78 96,70" stroke="${a}" stroke-width="2.5" />
          <circle cx="64" cy="48" r="4" fill="${a}" stroke="none" />
        </g>
      `
    case 'super combo':
      return `
        <!-- Super combo explosion -->
        <g stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="14" fill="${a}" stroke="${a}" stroke-width="4" />
          <!-- Shock rings -->
          <circle cx="64" cy="64" r="26" stroke="${s}" stroke-width="2.5" stroke-dasharray="8,4" />
          <circle cx="64" cy="64" r="36" stroke="${p}" stroke-width="1.5" stroke-dasharray="12,6" />
          <!-- Burst rays -->
          <line x1="64" y1="44" x2="64" y2="18" stroke="${a}" stroke-width="3" />
          <line x1="64" y1="84" x2="64" y2="110" stroke="${a}" stroke-width="3" />
          <line x1="44" y1="64" x2="18" y2="64" stroke="${a}" stroke-width="3" />
          <line x1="84" y1="64" x2="110" y2="64" stroke="${a}" stroke-width="3" />
        </g>
      `
    case 'combo focus':
      return `
        <!-- Concentrated combo focus -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="24" stroke-width="4" />
          <circle cx="64" cy="64" r="8" fill="${a}" />
          <!-- Crosshairs -->
          <line x1="64" y1="28" x2="64" y2="40" stroke="${s}" stroke-width="4" />
          <line x1="64" y1="88" x2="64" y2="100" stroke="${s}" stroke-width="4" />
          <line x1="28" y1="64" x2="40" y2="64" stroke="${s}" stroke-width="4" />
          <line x1="88" y1="64" x2="100" y2="64" stroke="${s}" stroke-width="4" />
        </g>
      `

    // ── SPEEDSTER FAMILY ──────────────────────────────────────────────────────────
    case 'speedster':
      return `
        <!-- Lightning speed bolt -->
        <g stroke="${p}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M72,24 L40,60 L64,60 L52,104 L88,68 L64,68 Z" fill="${p}" fill-opacity="0.2" stroke-width="5" />
          <!-- Speed lines behind -->
          <line x1="20" y1="44" x2="40" y2="44" stroke="${s}" stroke-width="2.5" />
          <line x1="16" y1="64" x2="36" y2="64" stroke="${s}" stroke-width="3.5" />
          <line x1="24" y1="84" x2="44" y2="84" stroke="${s}" stroke-width="2.5" />
        </g>
      `
    case 'time warp':
      return `
        <!-- Warp clock -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M34,44 C34,44 48,28 68,34 C88,40 94,64 88,80 C82,96 54,98 44,88 C34,78 34,44 34,44 Z" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <circle cx="64" cy="60" r="3" fill="${a}" stroke="none" />
          <line x1="64" y1="60" x2="76" y2="48" stroke="${a}" stroke-width="3" />
          <line x1="64" y1="60" x2="56" y2="72" stroke="${p}" stroke-width="3.5" />
        </g>
      `
    case 'chronobreak':
      return `
        <!-- Rewind / Shattered time -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="28" stroke-dasharray="6,4" />
          <!-- Counter-clockwise circular arrow -->
          <path d="M84,44 A28,28 0 1,0 84,84" stroke-width="4.5" />
          <polygon points="84,32 94,46 76,46" fill="${p}" stroke="none" />
          <!-- Rewind double triangles -->
          <polygon points="68,64 80,52 80,76" fill="${a}" />
          <polygon points="52,64 64,52 64,76" fill="${a}" />
        </g>
      `
    case 'speed shield':
      return `
        <!-- Aerodynamic shield -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M34,44 L64,36 L94,44 C94,68 76,84 64,96 C52,84 34,68 34,44 Z" fill="${s}" fill-opacity="0.1" />
          <!-- Horizontal speed cuts -->
          <line x1="20" y1="52" x2="48" y2="52" stroke="${a}" stroke-width="3" />
          <line x1="16" y1="68" x2="44" y2="68" stroke="${a}" stroke-width="3" />
        </g>
      `
    case 'mach speed':
      return `
        <!-- Sonic Mach Cone -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M24,64 L84,34 L80,64 L84,94 Z" fill="${s}" fill-opacity="0.1" />
          <path d="M84,34 C64,54 64,74 84,94" stroke="${a}" stroke-width="4" />
          <path d="M96,44 C84,58 84,70 96,84" stroke="${p}" stroke-width="2.5" />
          <line x1="16" y1="64" x2="72" y2="64" stroke="${a}" stroke-width="4" />
        </g>
      `
    case 'overdrive':
      return `
        <!-- Overdrive gears -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="18" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <!-- Teeth -->
          <line x1="64" y1="40" x2="64" y2="30" stroke-width="5" />
          <line x1="64" y1="88" x2="64" y2="98" stroke-width="5" />
          <line x1="40" y1="64" x2="30" y2="64" stroke-width="5" />
          <line x1="88" y1="64" x2="98" y2="64" stroke-width="5" />
          <!-- Angled teeth -->
          <line x1="47" y1="47" x2="40" y2="40" stroke-width="4" />
          <line x1="81" y1="81" x2="88" y2="88" stroke-width="4" />
          <line x1="47" y1="81" x2="40" y2="88" stroke-width="4" />
          <line x1="81" y1="47" x2="88" y2="40" stroke-width="4" />
          <!-- Core core -->
          <circle cx="64" cy="64" r="6" fill="${a}" stroke="none" />
        </g>
      `
    case 'time freeze':
      return `
        <!-- Frozen clock/snowflake -->
        <g stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="28" stroke-width="4" />
          <!-- Snowflake arms -->
          <line x1="64" y1="36" x2="64" y2="92" stroke="${s}" stroke-width="3" />
          <line x1="36" y1="64" x2="92" y2="64" stroke="${s}" stroke-width="3" />
          <line x1="44" y1="44" x2="84" y2="84" stroke="${s}" stroke-width="2.5" />
          <line x1="44" y1="84" x2="84" y2="44" stroke="${s}" stroke-width="2.5" />
          <!-- Little icicle ticks -->
          <circle cx="64" cy="64" r="4" fill="${a}" stroke="none" />
        </g>
      `
    case 'warp speed':
      return `
        <!-- Tunnel starlight -->
        <g stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="6" fill="${a}" stroke="none" />
          <!-- Converging starlight lines -->
          <line x1="16" y1="16" x2="52" y2="52" stroke-width="5" />
          <line x1="112" y1="112" x2="76" y2="76" stroke-width="5" />
          <line x1="112" y1="16" x2="76" y2="52" stroke-width="5" />
          <line x1="16" y1="112" x2="52" y2="76" stroke-width="5" />
          <line x1="12" y1="64" x2="48" y2="64" stroke="${s}" stroke-width="4.5" />
          <line x1="116" y1="64" x2="80" y2="64" stroke="${s}" stroke-width="4.5" />
        </g>
      `
    case 'grand prix':
      return `
        <!-- Checkered speed flags -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="36" y1="92" x2="56" y2="32" stroke-width="5" />
          <!-- Flag 1 -->
          <path d="M56,32 Q72,24 84,36 Q96,48 108,40 L98,72 Q86,80 74,68 Q62,56 46,62 Z" fill="${s}" fill-opacity="0.2" />
          <!-- Checkered pattern cuts -->
          <line x1="72" y1="36" x2="62" y2="64" stroke="${a}" stroke-width="2" />
          <line x1="88" y1="42" x2="78" y2="70" stroke="${a}" stroke-width="2" />
        </g>
      `
    case 'sonic boom':
      return `
        <!-- Sonic boom wave shock -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="64,28 72,56 98,56 78,72 86,100 64,84 42,100 50,72 30,56 56,56" fill="${a}" fill-opacity="0.2" stroke="${a}" stroke-width="4" />
          <!-- Shockwaves -->
          <path d="M30,36 C10,50 10,78 30,92" stroke="${s}" stroke-width="4.5" />
          <path d="M98,36 C118,50 118,78 98,92" stroke="${s}" stroke-width="4.5" />
        </g>
      `
    case 'speed demon':
      return `
        <!-- Devil horn speed lines -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M40,44 C44,36 44,24 34,16 C48,24 56,36 56,52 L72,52 C72,36 80,24 94,16 C84,24 84,36 88,44" stroke-width="5" stroke="${s}" />
          <path d="M44,64 L84,64 L64,96 Z" fill="${a}" fill-opacity="0.3" stroke-width="4" />
        </g>
      `

    // ── ORACLE FAMILY ────────────────────────────────────────────────────────────
    case 'oracle core':
      return `
        <!-- Mystical Third Eye -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M28,64 C40,44 88,44 100,64 C88,84 40,84 28,64 Z" fill="${s}" fill-opacity="0.1" stroke-width="4" />
          <circle cx="64" cy="64" r="14" stroke="${a}" stroke-width="3.5" />
          <circle cx="64" cy="64" r="6" fill="${a}" />
          <!-- Radiating eye rays -->
          <line x1="64" y1="44" x2="64" y2="34" />
          <line x1="48" y1="52" x2="40" y2="44" />
          <line x1="80" y1="52" x2="88" y2="44" />
        </g>
      `
    case 'clairvoyance':
      return `
        <!-- Vision crystal ball -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="56" r="24" fill="${s}" fill-opacity="0.1" stroke-width="4" />
          <!-- Stand -->
          <path d="M44,88 L84,88 C80,88 80,76 64,76 C48,76 48,88 44,88 Z" fill="${p}" fill-opacity="0.2" />
          <!-- Visions inside -->
          <path d="M52,56 Q64,48 76,56" stroke="${a}" stroke-width="2.5" />
          <circle cx="64" cy="56" r="4" fill="${a}" stroke="none" />
        </g>
      `
    case 'omniscience':
      return `
        <!-- Stellar constellation eye -->
        <g stroke="${a}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="64,28 78,56 108,56 84,74 94,102 64,84 34,102 44,74 20,56 50,56" stroke-width="1.5" stroke-dasharray="3,3" />
          <circle cx="64" cy="64" r="20" stroke="${p}" stroke-width="4" />
          <circle cx="64" cy="64" r="8" fill="${a}" />
          <line x1="34" y1="64" x2="94" y2="64" stroke="${s}" stroke-dasharray="4,4" />
        </g>
      `
    case 'third eye':
      return `
        <!-- Luminous geometric eye -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="64,32 96,64 64,96 32,64" stroke-width="4" />
          <circle cx="64" cy="64" r="12" fill="${s}" fill-opacity="0.1" stroke="${a}" stroke-width="3" />
          <circle cx="64" cy="64" r="5" fill="${a}" />
        </g>
      `
    case 'future sight':
      return `
        <!-- Vision looking glass -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="56" cy="52" r="20" fill="${s}" fill-opacity="0.1" stroke-width="4" />
          <line x1="70" y1="66" x2="94" y2="90" stroke-width="6" />
          <!-- Star glint -->
          <polygon points="56,38 58,45 65,45 60,49 62,56 56,52 50,56 52,49 47,45 54,45" fill="${a}" stroke="none" />
        </g>
      `
    case 'divine guidance':
      return `
        <!-- Angel wing compass -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M30,48 C30,48 40,24 64,48 C88,24 98,48 98,48 C98,48 88,72 64,56 C40,72 30,48 30,48 Z" fill="${s}" fill-opacity="0.15" />
          <!-- Compass needle -->
          <polygon points="64,36 68,56 64,62 60,56" fill="${a}" />
          <polygon points="64,76 68,56 64,62 60,56" fill="${p}" />
        </g>
      `
    case 'mind reader':
      return `
        <!-- Brain with thought waves -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M44,68 C38,68 34,60 38,52 C34,44 42,34 50,38 C54,30 74,30 78,38 C86,34 94,44 90,52 C94,60 90,68 84,68 C80,76 48,76 44,68 Z" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <line x1="64" y1="36" x2="64" y2="72" stroke-dasharray="2,2" />
          <!-- Thought waves -->
          <path d="M32,36 A48,48 0 0,1 96,36" stroke="${a}" stroke-width="2.5" />
          <path d="M24,28 A64,64 0 0,1 104,28" stroke="${a}" stroke-width="1.5" />
        </g>
      `
    case 'predictive strike':
      return `
        <!-- Strike trajectory sword -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="36" y1="92" x2="92" y2="36" stroke-width="5" stroke="${a}" />
          <line x1="32" y1="84" x2="44" y2="96" stroke-width="5" />
          <!-- Prediction dashed lines -->
          <path d="M52,36 Q64,48 76,36" stroke="${s}" stroke-dasharray="3,3" />
          <path d="M52,76 Q64,88 76,76" stroke="${s}" stroke-dasharray="3,3" />
        </g>
      `
    case 'cosmic wisdom':
      return `
        <!-- Ancient book -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <rect x="34" y="36" width="60" height="52" rx="4" fill="${s}" fill-opacity="0.15" stroke-width="4" />
          <line x1="64" y1="36" x2="64" y2="88" stroke-width="4" />
          <!-- Mystic symbol on pages -->
          <circle cx="48" cy="62" r="5" stroke="${a}" />
          <line x1="76" y1="54" x2="84" y2="54" stroke="${a}" stroke-width="3" />
          <line x1="76" y1="62" x2="84" y2="62" stroke="${a}" stroke-width="3" />
          <line x1="76" y1="70" x2="82" y2="70" stroke="${a}" stroke-width="3" />
        </g>
      `
    case 'divine eye':
      return `
        <!-- Radiant golden halo eye -->
        <g stroke="${a}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="28" stroke="${p}" stroke-dasharray="6,4" />
          <path d="M30,64 C44,48 84,48 98,64 C84,80 44,80 30,64 Z" fill="${s}" fill-opacity="0.15" stroke-width="4.5" />
          <circle cx="64" cy="64" r="10" stroke="${a}" stroke-width="3" />
          <circle cx="64" cy="64" r="4" fill="#fff" />
        </g>
      `
    case 'oracle blessing':
      return `
        <!-- Open blessing hand -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M48,88 L48,60 C48,56 46,52 46,48 C46,40 52,36 56,36 C60,36 64,40 64,48 L64,64 L68,48 C68,42 74,40 78,44 L78,88 Z" fill="${s}" fill-opacity="0.1" />
          <path d="M48,88 L34,88 L34,70 L48,70 Z" fill="${p}" fill-opacity="0.3" />
          <circle cx="64" cy="24" r="4" fill="${a}" stroke="none" />
        </g>
      `

    // ── MISSION FAMILY ────────────────────────────────────────────────────────────
    case 'mission core':
      return `
        <!-- Crosshair Target -->
        <g stroke="${p}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="24" stroke-width="5" />
          <circle cx="64" cy="64" r="10" stroke="${a}" stroke-width="3" />
          <circle cx="64" cy="64" r="3" fill="${a}" stroke="none" />
          <!-- Crosshair lines -->
          <line x1="64" y1="28" x2="64" y2="100" stroke-width="4" />
          <line x1="28" y1="64" x2="100" y2="64" stroke-width="4" />
        </g>
      `
    case 'bounty hunter':
      return `
        <!-- Wanted scroll/Coin bag -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M36,36 L92,36 C92,36 100,56 92,76 L36,76 C36,76 44,56 36,36 Z" fill="${s}" fill-opacity="0.15" stroke-width="4" />
          <!-- Star/Dollar symbol -->
          <path d="M64,44 L67,52 L76,52 L69,57 L71,66 L64,60 L57,66 L59,57 L52,52 L61,52 Z" fill="${a}" stroke="none" />
          <line x1="28" y1="36" x2="28" y2="84" stroke-width="5" />
          <line x1="100" y1="36" x2="100" y2="84" stroke-width="5" />
        </g>
      `
    case 'exodia':
      return `
        <!-- Exodia ultimate crown -->
        <g stroke="${a}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="64,24 88,48 64,72 40,48" fill="${a}" fill-opacity="0.2" stroke-width="5" />
          <line x1="64" y1="24" x2="64" y2="72" stroke-width="3" />
          <line x1="40" y1="48" x2="88" y2="48" stroke-width="3" />
          <!-- Pillars -->
          <line x1="24" y1="92" x2="104" y2="92" stroke="${p}" stroke-width="6" />
          <line x1="40" y1="72" x2="40" y2="92" stroke-width="4" />
          <line x1="88" y1="72" x2="88" y2="92" stroke-width="4" />
        </g>
      `
    case 'daily quest':
      return `
        <!-- Parchment checklist scroll -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <rect x="36" y="32" width="56" height="64" rx="4" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <!-- Lines and checkmarks -->
          <line x1="56" y1="48" x2="80" y2="48" />
          <line x1="56" y1="64" x2="80" y2="64" />
          <line x1="56" y1="80" x2="80" y2="80" />
          <!-- Mini checks -->
          <path d="M44,48 L46,50 L50,46" stroke="${a}" stroke-width="3" />
          <path d="M44,64 L46,66 L50,62" stroke="${a}" stroke-width="3" />
          <path d="M44,80 L46,82 L50,78" stroke="${a}" stroke-width="3" />
        </g>
      `
    case 'shield mission':
      return `
        <!-- Shield with target -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M34,44 L64,34 L94,44 C94,68 76,84 64,96 C52,84 34,68 34,44 Z" fill="${s}" fill-opacity="0.1" stroke-width="4" />
          <circle cx="64" cy="58" r="14" stroke="${a}" stroke-width="3" />
          <circle cx="64" cy="58" r="4" fill="${a}" />
        </g>
      `
    case 'time mission':
      return `
        <!-- Clock target -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="28" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <!-- Clock hands as crosshair -->
          <line x1="64" y1="36" x2="64" y2="64" stroke="${a}" stroke-width="4.5" />
          <line x1="64" y1="64" x2="84" y2="64" stroke="${a}" stroke-width="4.5" />
          <circle cx="64" cy="64" r="3" fill="${a}" stroke="none" />
          <!-- Target marks on circle -->
          <line x1="36" y1="64" x2="42" y2="64" />
          <line x1="64" y1="86" x2="64" y2="92" />
        </g>
      `
    case 'bounty overlord':
      return `
        <!-- Crowned dollar / Throne -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="24" fill="${s}" fill-opacity="0.1" stroke-width="4" />
          <!-- Crown over circle -->
          <polygon points="48,40 52,24 64,32 76,24 80,40" fill="${a}" stroke="${a}" />
          <!-- Large center star -->
          <path d="M64,50 L67,58 L76,58 L69,63 L71,72 L64,66 L57,72 L59,63 L52,58 L61,58 Z" fill="${a}" stroke="none" />
        </g>
      `
    case 'apex predator':
      return `
        <!-- Predator claw marks -->
        <g stroke="${a}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- 3 claw swipes -->
          <path d="M44,36 C52,48 48,72 40,92" />
          <path d="M64,28 C72,48 68,76 56,96" stroke="${p}" />
          <path d="M84,36 C92,48 88,72 80,92" />
        </g>
      `
    case 'mission specialist':
      return `
        <!-- Magnifying target scope -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="56" cy="56" r="20" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <line x1="70" y1="70" x2="94" y2="94" stroke-width="7" />
          <!-- Scope marks inside -->
          <line x1="56" y1="42" x2="56" y2="70" stroke="${a}" stroke-width="2.5" />
          <line x1="42" y1="56" x2="70" y2="56" stroke="${a}" stroke-width="2.5" />
        </g>
      `
    case 'mission master':
      return `
        <!-- Master badge and laurels -->
        <g stroke="${a}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="64,26 84,40 84,88 64,102 44,88 44,40" fill="${s}" fill-opacity="0.2" stroke-width="4.5" />
          <!-- Laurels -->
          <path d="M32,44 Q24,68 40,88" stroke="${p}" stroke-width="3" />
          <path d="M96,44 Q104,68 88,88" stroke="${p}" stroke-width="3" />
          <!-- Star of mastery -->
          <path d="M64,48 L67,56 L76,56 L69,61 L71,70 L64,64 L57,70 L59,61 L52,56 L61,56 Z" fill="${a}" stroke="none" />
        </g>
      `
    case 'swift mission':
      return `
        <!-- Winged target / Swift icon -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="16" fill="${s}" fill-opacity="0.1" stroke-width="4" />
          <!-- Target wings -->
          <path d="M48,64 L20,48 L28,68 L48,68 Z" fill="${a}" />
          <path d="M80,64 L108,48 L100,68 L80,68 Z" fill="${a}" />
          <circle cx="64" cy="64" r="6" fill="${p}" />
        </g>
      `

    // ── AEGIS FAMILY ──────────────────────────────────────────────────────────────
    case 'aegis shield':
      return `
        <!-- Defensive crystal shield -->
        <g stroke="${p}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M34,36 L64,26 L94,36 L94,68 C94,84 76,96 64,102 C52,96 34,84 34,68 Z" fill="${p}" fill-opacity="0.15" stroke-width="5" />
          <!-- Inner shield pattern -->
          <polygon points="64,42 82,54 64,88 46,54" stroke="${a}" stroke-width="3" />
          <circle cx="64" cy="58" r="4" fill="${a}" stroke="none" />
        </g>
      `
    case 'reflective aegis':
      return `
        <!-- Mirror shield reflecting light -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M34,40 L64,30 L94,40 C94,68 76,84 64,94 C52,84 34,68 34,40 Z" fill="${s}" fill-opacity="0.1" stroke-width="4" />
          <!-- Reflection sheen -->
          <line x1="44" y1="72" x2="84" y2="42" stroke="#fff" stroke-width="5" opacity="0.6" />
          <!-- Reflected beams -->
          <path d="M16,56 L48,56 L28,32" stroke="${a}" stroke-width="3" />
          <path d="M112,56 L80,56 L100,32" stroke="${a}" stroke-width="3" />
        </g>
      `
    case 'bastion of light':
      return `
        <!-- Bastion tower -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M44,88 L44,48 L52,48 L52,38 L76,38 L76,48 L84,48 L84,88 Z" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <!-- Battlement notches -->
          <line x1="56" y1="38" x2="56" y2="44" />
          <line x1="64" y1="38" x2="64" y2="44" />
          <line x1="72" y1="38" x2="72" y2="44" />
          <!-- Holy light beams radiating -->
          <line x1="64" y1="28" x2="64" y2="14" stroke="${a}" stroke-width="4.5" />
          <line x1="44" y1="28" x2="30" y2="18" stroke="${a}" stroke-width="3" />
          <line x1="84" y1="28" x2="98" y2="18" stroke="${a}" stroke-width="3" />
        </g>
      `
    case 'shield battery':
      return `
        <!-- Battery cell shield -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <rect x="44" y="38" width="40" height="52" rx="4" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <line x1="52" y1="38" x2="76" y2="38" stroke-width="6" />
          <!-- Charge level bars (glowing shield outline inside) -->
          <path d="M52,50 L76,50" stroke="${a}" stroke-width="5" />
          <path d="M52,64 L76,64" stroke="${a}" stroke-width="5" />
          <path d="M52,78 L76,78" stroke="${a}" stroke-width="5" />
        </g>
      `
    case 'fortress aegis':
      return `
        <!-- Fortress walls -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- Wall structure -->
          <path d="M24,78 L38,78 L38,56 L52,56 L52,44 L76,44 L76,56 L90,56 L90,78 L104,78 L104,90 L24,90 Z" fill="${s}" fill-opacity="0.2" stroke-width="4.5" />
          <line x1="24" y1="78" x2="104" y2="78" stroke-width="3" />
          <!-- Gate -->
          <path d="M56,90 L56,76 C56,72 72,72 72,76 L72,90 Z" fill="${a}" stroke="${a}" stroke-width="3" />
        </g>
      `
    case 'shield synergy':
      return `
        <!-- Interlocking double shields -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M28,48 L52,40 L76,48 C76,70 60,82 52,90 C44,82 28,70 28,48 Z" fill="${s}" fill-opacity="0.1" stroke-width="4" />
          <path d="M52,56 L76,48 L100,56 C100,78 84,90 76,98 C68,90 52,78 52,56 Z" fill="${a}" fill-opacity="0.15" stroke="${a}" stroke-width="4" />
        </g>
      `
    case 'spiked shield':
      return `
        <!-- Shield with spikes -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M34,44 L64,34 L94,44 C94,68 76,84 64,94 C52,84 34,68 34,44 Z" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <!-- Spikes -->
          <polygon points="64,20 60,34 68,34" fill="${a}" stroke="none" />
          <polygon points="20,44 34,46 34,38" fill="${a}" stroke="none" />
          <polygon points="108,44 94,38 94,46" fill="${a}" stroke="none" />
          <!-- Center boss -->
          <circle cx="64" cy="58" r="8" fill="${s}" stroke="${p}" stroke-width="3.5" />
        </g>
      `
    case 'indomitable':
      return `
        <!-- Unbreakable diamond -->
        <g stroke="${a}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="64,28 94,58 64,88 34,58" fill="${s}" fill-opacity="0.2" stroke-width="4.5" />
          <line x1="34" y1="58" x2="94" y2="58" stroke-width="2.5" />
          <line x1="64" y1="28" x2="64" y2="88" stroke-width="2.5" />
          <!-- Facets -->
          <line x1="64" y1="44" x2="48" y2="58" />
          <line x1="64" y1="44" x2="80" y2="58" />
          <line x1="64" y1="72" x2="48" y2="58" />
          <line x1="64" y1="72" x2="80" y2="58" />
        </g>
      `
    case 'aegis nova':
      return `
        <!-- Nova explosion shield -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M34,44 L64,34 L94,44 C94,68 76,84 64,94 C52,84 34,68 34,44 Z" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <!-- Outer blast marks -->
          <circle cx="64" cy="58" r="12" stroke="${a}" stroke-width="4" />
          <line x1="64" y1="40" x2="64" y2="24" stroke="${a}" stroke-width="3" />
          <line x1="64" y1="76" x2="64" y2="92" stroke="${a}" stroke-width="3" />
          <line x1="46" y1="58" x2="30" y2="58" stroke="${a}" stroke-width="3" />
          <line x1="82" y1="58" x2="98" y2="58" stroke="${a}" stroke-width="3" />
        </g>
      `
    case 'guardian angel':
      return `
        <!-- Angel winged shield -->
        <g stroke="${a}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M44,52 L64,44 L84,52 C84,70 72,82 64,90 C56,82 44,70 44,52 Z" fill="${s}" fill-opacity="0.1" />
          <!-- Wing left -->
          <path d="M40,52 C24,44 20,28 34,24 C34,24 28,44 44,52 Z" fill="${p}" fill-opacity="0.3" />
          <!-- Wing right -->
          <path d="M88,52 C104,44 108,28 94,24 C94,24 100,44 84,52 Z" fill="${p}" fill-opacity="0.3" />
          <circle cx="64" cy="62" r="3" fill="#fff" />
        </g>
      `
    case 'shield burst':
      return `
        <!-- Shattered shield shockwave -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- Fractured shield outline -->
          <path d="M34,44 L48,39 M58,36 L64,34 L80,39 M90,42 L94,44 C94,68 76,84 64,94 C54,86 44,76 38,62" stroke-width="4.5" />
          <!-- Crack lines inside -->
          <line x1="64" y1="34" x2="52" y2="58" stroke="${s}" />
          <line x1="52" y1="58" x2="76" y2="70" stroke="${s}" />
          <line x1="76" y1="70" x2="38" y2="80" stroke="${s}" />
          <circle cx="64" cy="56" r="6" fill="${a}" stroke="none" />
        </g>
      `

    // ── POWER FAMILY ──────────────────────────────────────────────────────────────
    case 'power core':
      return `
        <!-- Clenched Energy Fist -->
        <g stroke="${p}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- Arm/wrist base -->
          <path d="M52,96 L52,76 L76,76 L76,96 Z" fill="${s}" fill-opacity="0.1" stroke-width="3" />
          <!-- Fist knuckles and fingers -->
          <rect x="46" y="56" width="36" height="20" rx="3" fill="${p}" fill-opacity="0.2" stroke-width="5" />
          <path d="M46,62 C40,62 40,70 46,70" stroke-width="4" />
          <!-- Upward blast energy lines -->
          <path d="M64,48 L64,20" stroke="${a}" stroke-width="5" />
          <path d="M48,48 L32,28" stroke="${a}" stroke-width="3.5" />
          <path d="M80,48 L96,28" stroke="${a}" stroke-width="3.5" />
        </g>
      `
    case 'overclock core':
      return `
        <!-- Overclocked microchip -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <rect x="40" y="40" width="48" height="48" rx="4" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <!-- Chip pins -->
          <line x1="48" y1="40" x2="48" y2="30" stroke-width="3" />
          <line x1="64" y1="40" x2="64" y2="30" stroke-width="3" />
          <line x1="80" y1="40" x2="80" y2="30" stroke-width="3" />
          <line x1="48" y1="88" x2="48" y2="98" stroke-width="3" />
          <line x1="64" y1="88" x2="64" y2="98" stroke-width="3" />
          <line x1="80" y1="88" x2="80" y2="98" stroke-width="3" />
          <line x1="40" y1="48" x2="30" y2="48" stroke-width="3" />
          <line x1="40" y1="64" x2="30" y2="64" stroke-width="3" />
          <line x1="40" y1="80" x2="30" y2="80" stroke-width="3" />
          <line x1="88" y1="48" x2="98" y2="48" stroke-width="3" />
          <line x1="88" y1="64" x2="98" y2="64" stroke-width="3" />
          <line x1="88" y1="80" x2="98" y2="80" stroke-width="3" />
          <!-- Central core glowing -->
          <rect x="52" y="52" width="24" height="24" rx="2" fill="${a}" stroke="none" />
        </g>
      `
    case 'supernova core':
      return `
        <!-- Star explosion -->
        <g stroke="${a}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="16" fill="${a}" stroke-width="4.5" />
          <!-- Exploding rays -->
          <line x1="64" y1="36" x2="64" y2="12" stroke-width="5" />
          <line x1="64" y1="92" x2="64" y2="116" stroke-width="5" />
          <line x1="36" y1="64" x2="12" y2="64" stroke-width="5" />
          <line x1="92" y1="64" x2="116" y2="64" stroke-width="5" />
          <!-- Diagonals -->
          <line x1="44" y1="44" x2="24" y2="24" stroke="${s}" stroke-width="4" />
          <line x1="84" y1="84" x2="104" y2="104" stroke="${s}" stroke-width="4" />
          <line x1="44" y1="84" x2="24" y2="104" stroke="${s}" stroke-width="4" />
          <line x1="84" y1="44" x2="104" y2="24" stroke="${s}" stroke-width="4" />
        </g>
      `
    case 'hypercharge':
      return `
        <!-- Battery with lightning charge -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <rect x="44" y="38" width="40" height="52" rx="4" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <line x1="52" y1="38" x2="76" y2="38" stroke-width="6" />
          <!-- Charging lightning bolt -->
          <path d="M68,46 L52,66 L64,66 L56,84" stroke="${a}" stroke-width="5" />
        </g>
      `
    case 'power surge':
      return `
        <!-- High voltage electrical waves -->
        <g stroke="${p}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- Power pylons/lines -->
          <line x1="20" y1="88" x2="108" y2="88" stroke-width="3" />
          <line x1="34" y1="88" x2="34" y2="52" stroke-width="3.5" />
          <line x1="94" y1="88" x2="94" y2="52" stroke-width="3.5" />
          <!-- Heavy voltage surge line -->
          <path d="M20,52 Q34,24 50,56 T80,36 T108,52" stroke="${a}" stroke-width="6.5" />
        </g>
      `
    case 'brute force':
      return `
        <!-- War hammer/Fist crushing ground -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="48" y1="84" x2="80" y2="36" stroke-width="6.5" />
          <rect x="28" y="68" width="30" height="24" rx="2" fill="${s}" fill-opacity="0.15" stroke-width="4.5" />
          <!-- Crushing impact lines -->
          <path d="M16,92 L28,84" stroke="${a}" stroke-width="4.5" />
          <path d="M40,92 L44,88" stroke="${a}" stroke-width="4.5" />
          <line x1="16" y1="80" x2="26" y2="78" stroke="${a}" stroke-width="3" />
        </g>
      `
    case 'gigawatt core':
      return `
        <!-- Giant generator spark -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="22" stroke-dasharray="6,4" />
          <line x1="64" y1="36" x2="64" y2="92" stroke-width="4.5" />
          <line x1="36" y1="64" x2="92" y2="64" stroke-width="4.5" />
          <!-- Arcing sparks -->
          <path d="M52,48 L44,36" stroke="${a}" stroke-width="3.5" />
          <path d="M76,48 L84,36" stroke="${a}" stroke-width="3.5" />
          <path d="M52,80 L44,92" stroke="${a}" stroke-width="3.5" />
          <path d="M76,80 L84,92" stroke="${a}" stroke-width="3.5" />
          <circle cx="64" cy="64" r="8" fill="${a}" stroke="none" />
        </g>
      `
    case 'desperado':
      return `
        <!-- Skull with crossed bullets/guns -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="52" r="14" fill="${s}" fill-opacity="0.1" />
          <rect x="52" y="62" width="24" height="12" fill="${s}" fill-opacity="0.1" />
          <!-- Eye sockets -->
          <circle cx="56" cy="52" r="3.5" fill="${a}" stroke="none" />
          <circle cx="72" cy="52" r="3.5" fill="${a}" stroke="none" />
          <!-- Crossed weapons -->
          <line x1="34" y1="84" x2="94" y2="36" stroke-width="4.5" stroke="${a}" />
          <line x1="94" y1="84" x2="34" y2="36" stroke-width="4.5" stroke="${a}" />
        </g>
      `
    case 'absolute power':
      return `
        <!-- Power Crown of Absolute rule -->
        <g stroke="${a}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M30,84 L38,40 L52,56 L64,28 L76,56 L90,40 L98,84 Z" fill="${s}" fill-opacity="0.15" stroke-width="5" />
          <!-- Glow centers on crown tips -->
          <circle cx="38" cy="34" r="3" fill="#fff" />
          <circle cx="64" cy="22" r="3.5" fill="#fff" />
          <circle cx="90" cy="34" r="3" fill="#fff" />
          <!-- Underline -->
          <line x1="24" y1="84" x2="104" y2="84" stroke="${p}" stroke-width="5" />
        </g>
      `
    case 'overload':
      return `
        <!-- Overloading circuit boards -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <rect x="36" y="36" width="56" height="56" rx="4" fill="${s}" fill-opacity="0.15" />
          <!-- Broken circuit wire spark -->
          <path d="M48,64 L60,64 L56,52 L72,70" stroke="${a}" stroke-width="5" />
          <!-- Exploding details -->
          <circle cx="48" cy="48" r="3" fill="${p}" />
          <circle cx="80" cy="80" r="3" fill="${p}" />
        </g>
      `

    // ── PANDORA FAMILY ────────────────────────────────────────────────────────────
    case "pandora's box":
      return `
        <!-- Ornate chaos cube -->
        <g stroke="${p}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- 3D Cube shape -->
          <polygon points="64,26 94,42 94,76 64,94 34,76 34,42" fill="${s}" fill-opacity="0.1" stroke-width="5" />
          <line x1="64" y1="94" x2="64" y2="58" stroke-width="4" />
          <line x1="34" y1="42" x2="64" y2="58" stroke-width="4" />
          <line x1="94" y1="42" x2="64" y2="58" stroke-width="4" />
          <!-- Swirling chaos trails out -->
          <path d="M64,52 Q72,30 92,26" stroke="${a}" stroke-width="3" />
          <path d="M64,52 Q56,30 36,26" stroke="${a}" stroke-width="3" />
        </g>
      `
    case "trickster's glass":
      return `
        <!-- Jester mask mirroring -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- Split mask outline -->
          <path d="M38,68 C38,68 34,52 48,44 C62,36 64,56 64,56 L64,84" stroke-width="4" fill="${s}" fill-opacity="0.1" />
          <!-- Mirrored mask outline -->
          <path d="M90,68 C90,68 94,52 80,44 C66,36 64,56 64,56 L64,84" stroke-width="4" stroke="${a}" fill="${a}" fill-opacity="0.15" />
          <!-- Jester cap points -->
          <path d="M48,44 Q64,22 40,24" />
          <path d="M80,44 Q64,22 88,24" stroke="${a}" />
        </g>
      `
    case 'chaos theory':
      return `
        <!-- Infinite fractal helix spiral -->
        <g stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M64,64 A6,6 0 0,0 60,58 A12,12 0 0,1 72,64 A18,18 0 0,0 52,64 A24,24 0 0,1 88,64 A30,30 0 0,0 34,64" stroke-width="4.5" />
          <circle cx="64" cy="64" r="3" fill="${a}" stroke="none" />
        </g>
      `
    case 'chaos prism':
      return `
        <!-- Refracting chaos shard -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="64,24 94,52 80,94 48,94 34,52" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <!-- Internal refracting lines -->
          <line x1="64" y1="24" x2="64" y2="94" stroke="${a}" />
          <line x1="34" y1="52" x2="80" y2="94" stroke="${s}" />
          <line x1="94" y1="52" x2="48" y2="94" stroke="${s}" />
        </g>
      `
    case 'warp reality':
      return `
        <!-- Dimensional rift -->
        <g stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <ellipse cx="64" cy="64" rx="34" ry="14" stroke-width="4.5" />
          <!-- Warping spiral lines entering rift -->
          <path d="M34,44 Q52,56 64,64" stroke="${a}" stroke-width="4" />
          <path d="M94,84 Q76,72 64,64" stroke="${a}" stroke-width="4" />
          <circle cx="64" cy="64" r="5" fill="#000" stroke="${s}" stroke-width="2" />
        </g>
      `
    case "pandora's curse":
      return `
        <!-- Poison/Cursed skull -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <rect x="50" y="68" width="28" height="16" rx="2" fill="${s}" fill-opacity="0.1" />
          <circle cx="64" cy="50" r="20" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <!-- Cursed glowing eyes -->
          <circle cx="56" cy="50" r="4.5" fill="${a}" stroke="none" />
          <circle cx="72" cy="50" r="4.5" fill="${a}" stroke="none" />
          <!-- Crossbones -->
          <line x1="28" y1="84" x2="100" y2="28" stroke-width="4.5" stroke-dasharray="8,4" />
          <line x1="100" y1="84" x2="28" y2="28" stroke-width="4.5" stroke-dasharray="8,4" />
        </g>
      `
    case 'butterfly effect':
      return `
        <!-- Reality ripple butterfly wings -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- Wings -->
          <path d="M64,60 C64,60 52,28 30,36 C18,40 28,68 64,72 Z" fill="${s}" fill-opacity="0.2" stroke-width="4" />
          <path d="M64,60 C64,60 76,28 98,36 C110,40 100,68 64,72 Z" fill="${s}" fill-opacity="0.2" stroke-width="4" />
          <!-- Lower wings -->
          <path d="M64,72 C64,72 52,90 38,84 C28,80 44,68 64,72 Z" fill="${a}" fill-opacity="0.1" />
          <path d="M64,72 C64,72 76,90 90,84 C100,80 84,68 64,72 Z" fill="${a}" fill-opacity="0.1" />
          <!-- Body -->
          <line x1="64" y1="36" x2="64" y2="88" stroke-width="4.5" stroke="${a}" />
        </g>
      `
    case "pandora's wrath":
      return `
        <!-- Demon face in fire -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="54" r="22" fill="${s}" fill-opacity="0.1" stroke-width="4" />
          <!-- Demon horns -->
          <path d="M46,36 Q34,16 38,24 T46,44" stroke-width="4" />
          <path d="M82,36 Q94,16 90,24 T82,44" stroke-width="4" />
          <!-- Angry eyes -->
          <polygon points="50,56 60,54 58,48" fill="${a}" />
          <polygon points="78,56 68,54 70,48" fill="${a}" />
          <!-- Fangs -->
          <polygon points="56,72 60,64 64,72" fill="#fff" />
          <polygon points="72,72 68,64 64,72" fill="#fff" />
        </g>
      `
    case 'cosmic entropy':
      return `
        <!-- Entropy spiral dissolving -->
        <g stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <ellipse cx="64" cy="64" rx="28" ry="12" stroke-dasharray="6,4" />
          <ellipse cx="64" cy="64" rx="20" ry="8" stroke="${s}" />
          <!-- Particles escaping -->
          <circle cx="44" cy="48" r="3" fill="${a}" stroke="none" />
          <circle cx="84" cy="80" r="3.5" fill="${a}" stroke="none" />
          <circle cx="92" cy="52" r="2" fill="${p}" stroke="none" />
          <circle cx="36" cy="76" r="2" fill="${p}" stroke="none" />
        </g>
      `
    case 'reality collapse':
      return `
        <!-- Black hole pulling in shards -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="14" fill="#000" stroke="${s}" stroke-width="5" />
          <!-- Inward gravity curves -->
          <path d="M28,32 Q52,52 64,50" stroke="${a}" />
          <path d="M100,96 Q76,76 64,78" stroke="${a}" />
          <path d="M100,32 Q76,52 78,64" stroke="${a}" />
          <path d="M28,96 Q52,76 50,64" stroke="${a}" />
        </g>
      `
    case "pandora's mirror":
      return `
        <!-- Mirror reflecting rift -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <ellipse cx="64" cy="64" rx="20" ry="28" fill="${s}" fill-opacity="0.1" stroke-width="4.5" />
          <!-- Crack lines across glass -->
          <line x1="48" y1="48" x2="80" y2="80" stroke="${a}" stroke-width="2.5" />
          <line x1="74" y1="48" x2="60" y2="60" stroke="${a}" stroke-width="2.5" />
          <line x1="60" y1="60" x2="48" y2="76" stroke="${a}" stroke-width="2.5" />
        </g>
      `

    default:
      // Generic placeholder based on theme
      return `
        <!-- Unknown placeholder -->
        <g stroke="${p}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="64" cy="64" r="24" stroke-dasharray="4,4" />
          <polygon points="64,44 76,76 48,60 80,60 52,76" fill="${a}" fill-opacity="0.2" />
        </g>
      `
  }
}

// Generate a full SVG file content
function generateSvgContent(name: string, family: string): string {
  const theme = FAMILY_THEMES[family] || FAMILY_THEMES.balanced
  const symbol = getCoreSymbol(name, theme)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${theme.stop1}" />
      <stop offset="100%" stop-color="${theme.stop2}" />
    </radialGradient>

    <!-- Glowing Border Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.primary}" />
      <stop offset="50%" stop-color="${theme.secondary}" />
      <stop offset="100%" stop-color="${theme.accent}" />
    </linearGradient>

    <!-- Inner Glow Gradient -->
    <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="70%" stop-color="${theme.glow}" stop-opacity="0" />
      <stop offset="100%" stop-color="${theme.glow}" stop-opacity="0.25" />
    </radialGradient>

    <!-- Symbol Glow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Drop Shadow for Depth -->
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- Hexagon Outer Shape with Shadow -->
  <g filter="url(#shadow)">
    <!-- Glowing Hexagon Border -->
    <polygon points="64,6 114,35 114,93 64,122 14,93 14,35" fill="url(#borderGrad)" />
    
    <!-- Dark Inner Hexagon Background -->
    <polygon points="64,9 111,36 111,92 64,119 17,92 17,36" fill="url(#bgGrad)" />

    <!-- Inner Hexagon Glow overlay -->
    <polygon points="64,9 111,36 111,92 64,119 17,92 17,36" fill="url(#innerGlow)" />
  </g>

  <!-- Glowing Central Symbol -->
  <g filter="url(#glow)">
    ${symbol}
  </g>

  <!-- Small geometric accent details -->
  <circle cx="64" cy="22" r="1.5" fill="#fff" opacity="0.8" />
  <circle cx="34" cy="98" r="1" fill="${theme.accent}" opacity="0.4" />
  <circle cx="94" cy="98" r="1" fill="${theme.primary}" opacity="0.4" />
</svg>
`
}

function run() {
  const outputRoot = path.resolve(__dirname, '../../../client/public/icons/cores')
  console.log(`🚀 Starting SVG Core Icon generation to: ${outputRoot}\n`)

  let count = 0

  // Ensure output directory exists
  if (!fs.existsSync(outputRoot)) {
    fs.mkdirSync(outputRoot, { recursive: true })
  }

  // Create default fallback icon
  const defaultSvg = generateSvgContent('Default Core', 'balanced')
  fs.writeFileSync(path.join(outputRoot, 'default.svg'), defaultSvg)
  console.log(`✅ Generated: default.svg`)

  // Loop through families and write SVGs
  for (const [family, tiers] of Object.entries(CORE_FAMILIES)) {
    const familyDir = path.join(outputRoot, family)
    if (!fs.existsSync(familyDir)) {
      fs.mkdirSync(familyDir, { recursive: true })
    }

    const allCores = [...tiers.tier1, ...tiers.tier2, ...tiers.tier3]
    for (const name of allCores) {
      const slug = toSlug(name)
      const svg = generateSvgContent(name, family)
      fs.writeFileSync(path.join(familyDir, `${slug}.svg`), svg)
      count++
    }
    console.log(`✅ Generated family "${family}": ${allCores.length} icons`)
  }

  console.log(`\n🎉 Done! Successfully generated ${count} vector SVG icons.`)
}

run()
