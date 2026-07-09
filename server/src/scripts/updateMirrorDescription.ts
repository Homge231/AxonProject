import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function updateDescription() {
  const { data, error } = await supabase
    .from('cores')
    .update({
      description: 'Shape-shifts every 20 seconds into Main (Tier 1) cores. Reflects close typos (accuracy >= 80%) as positive points.'
    })
    .eq('name', "Pandora's Mirror")
    .select()

  if (error) {
    console.error('Failed to update description:', error)
  } else {
    console.log('Successfully updated description in database:', data)
  }
}

updateDescription()
