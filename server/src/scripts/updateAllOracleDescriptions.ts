import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const DESCRIPTIONS: Record<string, string> = {
  'Third Eye': 'Oracle hints are free. Automatically reveals the first letter of the target word.',
  'Future Sight': 'Oracle hints are free. Correct answers in under 4 seconds grant +50 flat points.',
  'Divine Guidance': 'Oracle hints are free. The match timer ticks 10% slower.',
  'Omniscience': 'Oracle hints are free. Automatically reveals the first letter, and timer ticks 20% slower.',
  'Mind Reader': 'Oracle hints are free. Automatically reveals the first 2 letters of the target word.',
  'Predictive Strike': 'Oracle hints are free. Solving a word with all 3 hints revealed awards +300 points.',
  'Cosmic Wisdom': 'Oracle hints are free. Correct answers with no hints used award a 2.0x points multiplier.',
  'Divine Eye': 'Oracle hints are free. Automatically reveals the first letter.'
}

async function updateDescriptions() {
  for (const [name, desc] of Object.entries(DESCRIPTIONS)) {
    const { data, error } = await supabase
      .from('cores')
      .update({ description: desc })
      .eq('name', name)
      .select()

    if (error) {
      console.error(`Failed to update ${name}:`, error)
    } else {
      console.log(`Successfully updated ${name} in database.`)
    }
  }
}

updateDescriptions()
