import dotenv from 'dotenv'
dotenv.config()

import { supabase } from '../config/supabase'

async function run() {
  const updates = [
    {
      name: 'Ashes to Ashes',
      description: 'The more consecutive mistakes you make, the higher your score multiplier (+0.5x per mistake, Max 3.0x).'
    },
    {
      name: 'Supernova Ashes',
      description: 'The more consecutive mistakes you make, the higher your score multiplier (+1.0x per mistake, Max 5.0x).'
    }
  ]

  for (const update of updates) {
    const { error } = await supabase
      .from('cores')
      .update({ description: update.description })
      .eq('name', update.name)
    
    if (error) {
      console.error(`❌ Failed to update ${update.name}:`, error)
    } else {
      console.log(`✅ Updated ${update.name} description.`)
    }
  }
}

run()
