import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { getCoreFamily } from '../cores/families'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function run() {
  console.log("Fetching all cores from database...")
  const { data: cores, error } = await supabase.from('cores').select('*')
  if (error || !cores) {
    console.error("Error fetching cores:", error)
    return
  }

  console.log(`Found ${cores.length} cores. Populating core_type and classification...`)

  for (const core of cores) {
    const family = getCoreFamily(core.name)
    const isMain = core.tier === 1
    const core_type = isMain ? 'main' : 'upgrade'
    let classification = null

    if (family) {
      if (['power', 'balanced', 'combo', 'speedster'].includes(family)) {
        classification = 'power'
      } else if (['aegis', 'mission', 'oracle', 'pandora'].includes(family)) {
        classification = 'effect'
      }
    }

    console.log(`Updating '${core.name}': core_type = ${core_type}, classification = ${classification}`)
    const { error: updateErr } = await supabase
      .from('cores')
      .update({
        core_type,
        classification
      } as any)
      .eq('id', core.id)

    if (updateErr) {
      console.error(`❌ Failed to update '${core.name}':`, updateErr.message)
    } else {
      console.log(`✅ Successfully updated '${core.name}'`)
    }
  }

  console.log("🎉 Core classification seeding complete!")
}

run()
