const postgres = require('postgres')
require('dotenv').config()
const sql = postgres(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL)

async function run() {
  try {
    const questions = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'questions'
    `
    console.log('Questions:', questions)
    const players = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'players'
    `
    console.log('Players:', players)
  } catch (e) {
    console.error(e)
  }
  process.exit(0)
}
run()
