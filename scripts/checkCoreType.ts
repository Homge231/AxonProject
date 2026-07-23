import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Must match families.ts classification
const POWER_FAMILIES = ['power', 'balanced', 'combo', 'speedster']
const EFFECT_FAMILIES = ['aegis', 'mission', 'oracle', 'pandora']

async function run() {
  const { data: cores, error } = await supabase
    .from('cores')
    .select('id, name, core_type, classification')

  if (error || !cores) { console.error(error); return }

  console.log('\n=== core_type values (current) ===')
  console.log('Distinct core_type:', [...new Set(cores.map(c => c.core_type))])
  console.log('Distinct classification:', [...new Set(cores.map(c => c.classification))])

  console.log('\n=== Sample rows ===')
  cores.slice(0, 10).forEach(c =>
    console.log(`  "${c.name}" | core_type="${c.core_type}" | classification="${c.classification}"`)
  )

  // Check if classification already holds the family name (aegis/combo/etc)
  const hasCorrectClassification = cores.every(c =>
    [...POWER_FAMILIES, ...EFFECT_FAMILIES].includes(c.classification)
  )
  console.log('\n✅ classification already holds family name?', hasCorrectClassification)

  // Count power vs effect using classification
  const powerCount = cores.filter(c => POWER_FAMILIES.includes(c.classification)).length
  const effectCount = cores.filter(c => EFFECT_FAMILIES.includes(c.classification)).length
  console.log(`  Power family cores: ${powerCount}`)
  console.log(`  Effect family cores: ${effectCount}`)
  console.log(`  Others: ${cores.length - powerCount - effectCount}`)
}

run()
