import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
async function run() {
  const { data } = await supabase.from('cores').select('id, name')
  console.log(data?.map(c => c.name))
}
run()
