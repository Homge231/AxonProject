import dotenv from 'dotenv'
dotenv.config()

import { supabase } from '../config/supabase'

const upgradeLinks = [
  // ── Combo Core Family ──
  { from: 'Combo Shield', to: 'Golden Combo' },
  { from: 'Combo Time', to: 'Chain Lightning' },
  { from: 'Combo Multiplier', to: 'Combo Mastery' },
  { from: 'Combo Focus', to: 'Super Combo' },

  // ── Speedster Family ──
  { from: 'Speed Shield', to: 'Time Freeze' },
  { from: 'Mach Speed', to: 'Warp Speed' },
  { from: 'Overdrive', to: 'Grand Prix' },
  { from: 'Speed Demon', to: 'Sonic Boom' },

  // ── Oracle Family ──
  { from: 'Third Eye', to: 'Mind Reader' },
  { from: 'Future Sight', to: 'Predictive Strike' },
  { from: 'Divine Guidance', to: 'Cosmic Wisdom' },
  { from: 'Oracle Blessing', to: 'Divine Eye' },

  // ── Mission Family ──
  { from: 'Daily Quest', to: 'Bounty Overlord' },
  { from: 'Shield Mission', to: 'Apex Predator' },
  { from: 'Time Mission', to: 'Mission Specialist' },
  { from: 'Swift Mission', to: 'Mission Master' },

  // ── Aegis Shield Family ──
  { from: 'Shield Battery', to: 'Spiked Shield' },
  { from: 'Fortress Aegis', to: 'Indomitable' },
  { from: 'Shield Synergy', to: 'Aegis Nova' },
  { from: 'Shield Burst', to: 'Guardian Angel' },

  // ── Balanced Family ──
  { from: 'Equilibrium', to: 'Zenith Core' },
  { from: 'Yin Yang', to: 'Nirvana' },
  { from: 'Steady Pace', to: 'Cosmic Balance' },
  { from: 'Harmony Wave', to: 'Universal Harmony' },

  // ── Power Family ──
  { from: 'Hypercharge', to: 'Gigawatt Core' },
  { from: 'Power Surge', to: 'Desperado' },
  { from: 'Brute Force', to: 'Absolute Power' },
  { from: 'Overload', to: 'Supermassive Core' },

  // ── Pandora's Box Family ──
  { from: 'Chaos Prism', to: 'Butterfly Effect' },
  { from: 'Warp Reality', to: 'Pandora\'s Wrath' },
  { from: 'Pandora\'s Curse', to: 'Cosmic Entropy' },
  { from: 'Pandora\'s Mirror', to: 'Reality Collapse' }
]

async function run() {
  console.log('Linking cores upgrades_to relationships in Supabase...')

  // Fetch all cores to get their IDs
  const { data: allCores, error } = await supabase.from('cores').select('id, name')
  if (error || !allCores) {
    console.error('Error fetching cores:', error)
    return
  }

  // Create lookup maps
  const coreMapByName: Record<string, string> = {}
  allCores.forEach(core => {
    coreMapByName[core.name.toLowerCase().trim()] = core.id
  })

  let count = 0
  for (const link of upgradeLinks) {
    const fromId = coreMapByName[link.from.toLowerCase().trim()]
    const toId = coreMapByName[link.to.toLowerCase().trim()]

    if (!fromId) {
      console.warn(`Could not find core: "${link.from}"`)
      continue
    }
    if (!toId) {
      console.warn(`Could not find core: "${link.to}"`)
      continue
    }

    const { error: updateError } = await supabase
      .from('cores')
      .update({ upgrades_to: toId })
      .eq('id', fromId)

    if (updateError) {
      console.error(`Failed to link "${link.from}" -> "${link.to}":`, updateError)
    } else {
      console.log(`✅ Linked: "${link.from}" -> "${link.to}"`)
      count++
    }
  }

  console.log(`Successfully completed linking. Linked ${count} relationships.`)
}

run()
