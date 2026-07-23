import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function run() {
  const { data: cores, error } = await supabase
    .from('cores')
    .select('id, name, tier, core_type, classification')
    .order('tier')
  
  if (error) { console.error(error); return }

  console.log('\n=== ALL CORES IN DATABASE ===')
  const tier1 = cores?.filter(c => c.tier === 1)
  const tier2 = cores?.filter(c => c.tier === 2)
  const tier3 = cores?.filter(c => c.tier === 3)

  console.log('\n--- TIER 1 (Main) ---')
  tier1?.forEach(c => console.log(`  [${c.id}] ${c.name}`))

  console.log('\n--- TIER 2 (Upgrade) ---')
  tier2?.forEach(c => console.log(`  [${c.id}] ${c.name}`))

  console.log('\n--- TIER 3 (Upgrade) ---')
  tier3?.forEach(c => console.log(`  [${c.id}] ${c.name}`))
}

run()
