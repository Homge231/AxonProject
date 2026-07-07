export const CORE_FAMILIES: Record<string, { tier1: string[], tier2: string[], tier3: string[] }> = {
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

export function getCoreFamily(coreName: string): string | null {
  const normalized = coreName.trim().toLowerCase()
  for (const [familyName, family] of Object.entries(CORE_FAMILIES)) {
    const allNames = [...family.tier1, ...family.tier2, ...family.tier3].map(n => n.toLowerCase())
    if (allNames.includes(normalized)) {
      return familyName
    }
  }
  return null
}

export function getUpgradesForCore(coreName: string, targetTier: number): string[] {
  const familyName = getCoreFamily(coreName)
  if (!familyName) return []
  const family = CORE_FAMILIES[familyName]
  if (targetTier === 2) return family.tier2
  if (targetTier === 3) return family.tier3
  return []
}
