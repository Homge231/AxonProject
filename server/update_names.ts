import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
async function run() {
  const { data, error } = await supabase.from('cores').select('id, name')
  if (error) { console.error(error); return }
  const toUpdate = data.filter(c => c.name.toLowerCase().includes('core'))
  console.log('To update:', toUpdate)
}
run()
