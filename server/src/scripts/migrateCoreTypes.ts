import { supabase } from '../config/supabase'

async function run() {
  console.log('Fetching all cores from Supabase...')
  const { data: cores, error } = await supabase.from('cores').select('*')
  if (error) {
    console.error('Error fetching cores:', error)
    return
  }
  
  if (!cores) {
    console.log('No cores found.')
    return
  }

  const updates = []

  const mainCoreIds = [
    '00000000-0000-0000-0000-000000000004', // Balance
    '00000000-0000-0000-0000-000000000003', // Power Strike
    '00000000-0000-0000-0000-000000000007', // Speedster
    '00000000-0000-0000-0000-000000000006', // Argus Eyes
    '00000000-0000-0000-0000-000000000010', // Pandora's Box
    '544f6a46-cc62-48ac-890b-67e8810a94e9', // Mission Impossible
    '22222222-2222-2222-2222-222222222222', // High Roller
    '00000000-0000-0000-0000-000000000011', // Aegis Shield
    '00000000-0000-0000-0000-000000000005', // Perfect Combo
    '11111111-1111-1111-1111-111111111111'  // Phoenix
  ]
  
  for (const core of cores) {
    let newCoreType = core.core_type
    let newClassification = core.classification
    let newUpgradesTo = core.upgrades_to
    
    // 1. Process 10 Main Cores
    if (mainCoreIds.includes(core.id)) {
      newCoreType = 'main'
      newClassification = 'main'
      if (core.id === '22222222-2222-2222-2222-222222222222' || core.id === '11111111-1111-1111-1111-111111111111') {
         newUpgradesTo = null
      }
    } else {
      // 2. Process Upgrade Cores (Tier 2 and Tier 3)
      newCoreType = 'upgrade'
      
      const name = (core.name || '').toLowerCase()
      
      // Default to what's mapped manually
      // Combo
      if (['radiant combo', 'combo time', 'combo multiplier', 'combo focus', 'super combo', 'prismatic combo', 'golden combo', 'combo mastery'].includes(name)) {
        newClassification = 'power'
      } else if (['chain lightning'].includes(name)) { // Reveals word
        newClassification = 'effect'
      } else if (['combo shield'].includes(name)) { // Adds shield
        newClassification = 'power' 
      }
      
      // Speedster
      if (['time warp', 'mach speed', 'overdrive', 'speed demon', 'chronobreak', 'time freeze', 'warp speed', 'grand prix', 'sonic boom'].includes(name)) {
        newClassification = 'power'
      } else if (['speed shield'].includes(name)) {
        newClassification = 'power'
      }
      
      // Oracle
      if (['clairvoyance', 'third eye', 'future sight', 'divine guidance', 'oracle blessing', 'omniscience', 'mind reader', 'predictive strike', 'cosmic wisdom', 'divine eye'].includes(name)) {
        newClassification = 'effect'
      }
      
      // Mission
      if (['bounty hunter', 'daily quest', 'shield mission', 'time mission', 'swift mission', 'exodia', 'bounty overlord', 'apex predator', 'mission specialist', 'mission master'].includes(name)) {
        newClassification = 'effect'
      }
      
      // Aegis
      if (['reflective aegis', 'shield battery', 'fortress aegis', 'shield synergy', 'shield burst', 'bastion of light', 'spiked shield', 'indomitable', 'aegis nova', 'guardian angel'].includes(name)) {
        newClassification = 'effect'
      }
      
      // Balanced
      if (['harmony', 'equilibrium', 'yin yang', 'steady pace', 'harmony wave', 'perfect harmony', 'zenith', 'nirvana', 'cosmic balance', 'universal harmony'].includes(name)) {
        newClassification = 'power'
      }
      
      // Power
      if (['overclock', 'hypercharge', 'power surge', 'brute force', 'overload', 'supernova', 'gigawatt', 'desperado', 'absolute power', 'supermassive', 'supermassive core'].includes(name)) {
        newClassification = 'power'
      }
      
      // Pandora
      if (["trickster's glass", 'chaos prism', 'warp reality', "pandora's curse", "pandora's mirror", 'chaos theory', 'butterfly effect', "pandora's wrath", 'cosmic entropy', 'reality collapse'].includes(name)) {
        newClassification = 'effect'
      }
      
      // Phoenix
      if (['phoenix flame', 'rebirth', 'ashes to ashes', 'immortal phoenix', 'eternal rebirth', 'supernova ashes'].includes(name)) {
        newClassification = 'effect' // Giving bonuses after mistakes -> behavior effect
      }
      
      // High Roller
      if (['jackpot', 'safe bet', 'double or nothing', 'all in', 'house advantage', 'russian roulette'].includes(name)) {
        newClassification = 'effect' // Probabilistic effect
      }
    }
    
    // Add to updates if changed
    if (core.core_type !== newCoreType || core.classification !== newClassification || core.upgrades_to !== newUpgradesTo) {
      updates.push({
        id: core.id,
        name: core.name,
        core_type: newCoreType,
        classification: newClassification,
        upgrades_to: newUpgradesTo,
        old_core_type: core.core_type,
        old_classification: core.classification,
        old_upgrades_to: core.upgrades_to
      })
    }
  }
  
  console.log(`Found ${updates.length} cores that need updating.`)
  for (const update of updates) {
    console.log(`Updating ${update.name}: core_type (${update.old_core_type} -> ${update.core_type}), classification (${update.old_classification} -> ${update.classification}), upgrades_to (${update.old_upgrades_to} -> ${update.upgrades_to})`)
    const { error } = await supabase.from('cores').update({
      core_type: update.core_type,
      classification: update.classification,
      upgrades_to: update.upgrades_to
    }).eq('id', update.id)
    if (error) {
      console.error(`Failed to update ${update.name}:`, error)
    }
  }
  
  console.log('Done.')
}

run()
