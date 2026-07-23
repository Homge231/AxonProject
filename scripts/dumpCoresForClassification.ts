import dotenv from 'dotenv'
dotenv.config()
import { supabase } from '../config/supabase'
import fs from 'fs'

async function run() {
  const { data, error } = await supabase.from('cores').select('id, name, description, tier, core_type, classification')
  if (error) throw error
  fs.writeFileSync('cores_dump.json', JSON.stringify(data, null, 2))
  console.log('Dumped to cores_dump.json')
}
run()
