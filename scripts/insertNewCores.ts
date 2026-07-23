import dotenv from 'dotenv'
dotenv.config()

import { supabase } from '../config/supabase'

const newCores = [
  // 1. Combo Focus
  { name: 'Radiant Combo', description: 'Tracks consecutive correct answers. Each combo level adds bonus points, capped at +200.', flat_buff: 0, multiplier_buff: 1 },
  { name: 'Prismatic Combo', description: 'Max cap +300 points per combo. Correct answers trigger explosive VFX.', flat_buff: 0, multiplier_buff: 1 },
  
  // 2. Speed Focus
  { name: 'Time Warp', description: 'Answer faster for exponential points. Adds +2 seconds to the timer for every correct answer.', flat_buff: 0, multiplier_buff: 1 },
  { name: 'Chronobreak', description: 'Inherits Time Warp. Maintaining a 3-streak pauses the match timer for 3 seconds.', flat_buff: 0, multiplier_buff: 1 },
  
  // 3. Oracle Focus
  { name: 'Clairvoyance', description: 'Reveals hints for target words. You earn 100% of points (no penalty).', flat_buff: 0, multiplier_buff: 1 },
  { name: 'Omniscience', description: 'Reveals hints, no point penalty, and automatically types the first letter of the target word for you.', flat_buff: 0, multiplier_buff: 1 },
  
  // 4. Mission Focus
  { name: 'Bounty Hunter', description: 'Answer 5 questions correctly in a row for a massive +1000 point bonus.', flat_buff: 1000, multiplier_buff: 1 },
  { name: 'Exodia', description: 'Answer 10 questions correctly in a row for +5000 points and trigger a camera shake.', flat_buff: 5000, multiplier_buff: 1 },
  
  // 5. Aegis Focus
  { name: 'Reflective Aegis', description: 'Stacks shields (Max 3). Mistakes consume 1 shield and grant +50 points instead of losing points.', flat_buff: 0, multiplier_buff: 1 },
  { name: 'Bastion of Light', description: 'Stacks shields (Max 5). When at maximum shields, all points earned are doubled.', flat_buff: 0, multiplier_buff: 1 },
  
  // 6. Balanced Focus
  { name: 'Harmony Core', description: 'Flat +20 pts and 1.5× multiplier.', flat_buff: 20, multiplier_buff: 1.5 },
  { name: 'Perfect Harmony', description: 'Flat +50 pts and 2.0× multiplier. Mistakes are completely forgiven (0 points lost).', flat_buff: 50, multiplier_buff: 2.0 },
  
  // 7. Power Focus
  { name: 'Overclock Core', description: '2.0× multiplier on every score calculation.', flat_buff: 0, multiplier_buff: 2.0 },
  { name: 'Supernova Core', description: '3.0× multiplier on every score calculation, but mistakes cost double points.', flat_buff: 0, multiplier_buff: 3.0 },
  
  // 8. Pandora Focus
  { name: "Trickster's Glass", description: 'Shape-shifts every 20 seconds into powerful Main (Tier 1) cores.', flat_buff: 0, multiplier_buff: 1 },
  { name: 'Chaos Theory', description: 'Shape-shifts every 15 seconds. Fuses the power of Main (Tier 1) cores.', flat_buff: 0, multiplier_buff: 1 }
]

async function run() {
  console.log('Inserting 16 new synergistic cores...')
  
  for (const core of newCores) {
    // Check if it exists
    const { data } = await supabase.from('cores').select('id').eq('name', core.name)
    if (data && data.length > 0) {
      console.log(`Core ${core.name} already exists, skipping.`)
      continue;
    }
    const { error } = await supabase.from('cores').insert(core)
    if (error) {
      console.error(`Failed to insert ${core.name}:`, error)
    } else {
      console.log(`✅ Inserted ${core.name}`)
    }
  }
  console.log('Done.')
}

run()
