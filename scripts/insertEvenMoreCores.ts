import dotenv from 'dotenv'
dotenv.config()

import { supabase } from '../config/supabase'

const extraCores = [
  // ── 1. Combo Core ──
  { name: 'Combo Focus', description: 'Correct answers during combo give +10 points per combo level, but wrong answers subtract 30 points.', flat_buff: 0, multiplier_buff: 1.0, tier: 2 },
  { name: 'Super Combo', description: 'Correct answers while combo is 5+ receive a 2.5x score multiplier.', flat_buff: 0, multiplier_buff: 2.5, tier: 3 },

  // ── 2. Speedster ──
  { name: 'Speed Demon', description: 'Answer in under 1.5 seconds to add +3 seconds to the match timer.', flat_buff: 0, multiplier_buff: 1.0, tier: 2 },
  { name: 'Sonic Boom', description: 'Speed bonus points are quadrupled if the question is solved in under 1 second.', flat_buff: 0, multiplier_buff: 1.0, tier: 3 },

  // ── 3. Oracle ──
  { name: 'Oracle Blessing', description: 'Oracle hints are free, and correct answers with active hints grant double points.', flat_buff: 0, multiplier_buff: 2.0, tier: 2 },
  { name: 'Divine Eye', description: 'All hints are free, and your first correct answer of the match awards +1000 points.', flat_buff: 1000, multiplier_buff: 1.0, tier: 3 },

  // ── 4. Mission ──
  { name: 'Swift Mission', description: 'Answer 3 questions in under 4 seconds in a row for +500 points.', flat_buff: 500, multiplier_buff: 1.0, tier: 2 },
  { name: 'Mission Master', description: 'Completing a 3-streak gives +1000 points; completing a 6-streak gives +3000 points.', flat_buff: 1000, multiplier_buff: 1.0, tier: 3 },

  // ── 5. Aegis Shield ──
  { name: 'Shield Burst', description: 'Correct answers while maximum shields are active grant +100 points.', flat_buff: 100, multiplier_buff: 1.0, tier: 2 },
  { name: 'Guardian Angel', description: 'Start match with 3 shields. Earning a shield when at max capacity adds +10s to the timer.', flat_buff: 0, multiplier_buff: 1.0, tier: 3 },

  // ── 6. Balanced ──
  { name: 'Harmony Wave', description: 'Flat +30 points. Mistakes do not subtract points for the next 2 errors.', flat_buff: 30, multiplier_buff: 1.0, tier: 2 },
  { name: 'Universal Harmony', description: 'Flat +120 points, 2.0x multiplier, and wrong answers cost only 10 points.', flat_buff: 120, multiplier_buff: 2.0, tier: 3 },

  // ── 7. Power ──
  { name: 'Overload', description: '2.5x multiplier, but mistakes lock typing board input for 2 seconds.', flat_buff: 0, multiplier_buff: 2.5, tier: 2 },
  { name: 'Supermassive Core', description: 'Grants an extreme 4.5x multiplier, but mistakes deduct 200 points.', flat_buff: 0, multiplier_buff: 4.5, tier: 3 },

  // ── 8. Pandora ──
  { name: "Pandora's Mirror", description: 'Shape-shifts every 20 seconds into Main (Tier 1) cores. Reflects mistakes as positive points.', flat_buff: 0, multiplier_buff: 1.0, tier: 2 },
  { name: "Pandora's Curse", description: 'Shape-shifts every 20 seconds into Main (Tier 1) cores. Curses incorrect answers to deal triple damage.', flat_buff: 0, multiplier_buff: 1.0, tier: 2 },
  { name: 'Cosmic Entropy', description: 'Shape-shifts every 15 seconds into Main (Tier 1) cores. Randomly adds a 1.5x multiplier.', flat_buff: 0, multiplier_buff: 1.5, tier: 3 },
  { name: 'Reality Collapse', description: 'Shape-shifts every 15 seconds into Main (Tier 1) cores. Points earned are randomly doubled or halved.', flat_buff: 0, multiplier_buff: 1.0, tier: 3 },
  { name: "Pandora's Wrath", description: 'Shape-shifts every 15 seconds into Main (Tier 1) cores. Destroys incorrect answers, granting flat +200 points instead of losing points.', flat_buff: 200, multiplier_buff: 1.0, tier: 3 }
]

async function run() {
  console.log('Inserting 16 extra synergistic upgrades...')
  
  for (const core of extraCores) {
    const { data } = await supabase.from('cores').select('id').eq('name', core.name)
    if (data && data.length > 0) {
      console.log(`Core ${core.name} already exists, skipping.`)
      continue
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
