import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function run() {
  const { data: cores } = await supabase.from('cores').select('id, name, tier')
  const trailing = cores?.filter(c => c.name !== c.name.trim())
  if (trailing && trailing.length > 0) {
    console.log('⚠️  CORES WITH TRAILING/LEADING SPACES:')
    trailing.forEach(c => console.log(`  [Tier ${c.tier}] ID=${c.id} name=|${c.name}|`))
    console.log('\nFixing...')
    for (const c of trailing) {
      await supabase.from('cores').update({ name: c.name.trim() }).eq('id', c.id)
      console.log(`  ✅ Fixed: "${c.name}" → "${c.name.trim()}"`)
    }
  } else {
    console.log('✅ No trailing/leading spaces found in any core name.')
  }
}
run()
