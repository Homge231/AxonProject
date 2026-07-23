/**
 * Cross-check script: compares DB core names against all hardcoded names in families.ts
 * Run: npx ts-node src/scripts/crossCheckCores.ts
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// ── Copy of BOTH client and server families for comparison ───────────────────
const FAMILIES_IN_CODE: Record<string, { tier1: string[], tier2: string[], tier3: string[] }> = {
  'combo': {
    tier1: ['Perfect Combo'],
    tier2: ['Radiant Combo', 'Combo Shield', 'Combo Time', 'Combo Multiplier', 'Combo Focus'],
    tier3: ['Prismatic Combo', 'Golden Combo', 'Chain Lightning', 'Combo Mastery', 'Super Combo']
  },
  'speedster': {
    tier1: ['Speedster'],
    tier2: ['Time Warp', 'Speed Shield', 'Mach Speed', 'Overdrive', 'Speed Demon'],
    tier3: ['Chronobreak', 'Time Freeze', 'Warp Speed', 'Grand Prix', 'Sonic Boom']
  },
  'oracle': {
    tier1: ['Argus Eyes'],
    tier2: ['Clairvoyance', 'Third Eye', 'Future Sight', 'Divine Guidance', 'Oracle Blessing'],
    tier3: ['Omniscience', 'Mind Reader', 'Predictive Strike', 'Cosmic Wisdom', 'Divine Eye']
  },
  'mission': {
    tier1: ['Mission Impossible'],
    tier2: ['Bounty Hunter', 'Daily Quest', 'Shield Mission', 'Time Mission', 'Swift Mission'],
    tier3: ['Exodia', 'Bounty Overlord', 'Apex Predator', 'Mission Specialist', 'Mission Master']
  },
  'aegis': {
    tier1: ['Aegis Shield'],
    tier2: ['Reflective Aegis', 'Shield Battery', 'Fortress Aegis', 'Shield Synergy', 'Shield Burst'],
    tier3: ['Bastion of Light', 'Spiked Shield', 'Indomitable', 'Aegis Nova', 'Guardian Angel']
  },
  'balanced': {
    tier1: ['Balance'],
    tier2: ['Harmony Core', 'Equilibrium', 'Yin Yang', 'Steady Pace', 'Harmony Wave'],
    tier3: ['Perfect Harmony', 'Zenith Core', 'Nirvana', 'Cosmic Balance', 'Universal Harmony']
  },
  'power': {
    tier1: ['Power Strike'],
    tier2: ['Overclock Core', 'Hypercharge', 'Power Surge', 'Brute Force', 'Overload'],
    tier3: ['Supernova Core', 'Gigawatt Core', 'Desperado', 'Absolute Power', 'Supermassive Core']
  },
  'pandora': {
    tier1: ["Pandora's Box"],
    tier2: ["Trickster's Glass", 'Chaos Prism', 'Warp Reality', "Pandora's Curse", "Pandora's Mirror"],
    tier3: ['Chaos Theory', 'Butterfly Effect', "Pandora's Wrath", 'Cosmic Entropy', 'Reality Collapse']
  }
}

const ALL_CODE_NAMES = new Set(
  Object.values(FAMILIES_IN_CODE).flatMap(f => [...f.tier1, ...f.tier2, ...f.tier3].map(n => n.trim().toLowerCase()))
)

async function run() {
  const { data: cores, error } = await supabase.from('cores').select('name, tier')
  if (error || !cores) { console.error(error); return }

  const dbNames = cores.map(c => c.name.trim())
  const dbNamesLower = new Set(dbNames.map(n => n.toLowerCase()))

  console.log('\n========================================')
  console.log('  CORE NAME MISMATCH REPORT')
  console.log('========================================\n')

  // 1. DB names NOT in code
  const dbMissingFromCode = dbNames.filter(n => !ALL_CODE_NAMES.has(n.toLowerCase()))
  if (dbMissingFromCode.length > 0) {
    console.log('❌ IN DATABASE but NOT IN CODE families.ts:')
    dbMissingFromCode.forEach(n => {
      const c = cores.find(c => c.name.trim() === n)
      console.log(`   [Tier ${c?.tier}] "${n}"`)
    })
  } else {
    console.log('✅ All DB cores are represented in code families.ts')
  }

  // 2. Code names NOT in DB
  const codeMissingFromDB: string[] = []
  for (const [family, tiers] of Object.entries(FAMILIES_IN_CODE)) {
    for (const [tierKey, names] of Object.entries(tiers)) {
      for (const name of names) {
        if (!dbNamesLower.has(name.trim().toLowerCase())) {
          codeMissingFromDB.push(`[${family} ${tierKey}] "${name}"`)
        }
      }
    }
  }
  if (codeMissingFromDB.length > 0) {
    console.log('\n❌ IN CODE families.ts but NOT IN DATABASE:')
    codeMissingFromDB.forEach(n => console.log(`   ${n}`))
  } else {
    console.log('\n✅ All code family names exist in DB')
  }

  // 3. Note the trailing space issue
  const trailingSpace = dbNames.filter(n => n !== n.trim())
  if (trailingSpace.length > 0) {
    console.log('\n⚠️  CORES WITH TRAILING SPACES IN DB (will cause hidden mismatches!):')
    trailingSpace.forEach(n => console.log(`   "${n}" (length=${n.length})`))
  }

  console.log('\n========================================\n')
}

run()
