import dotenv from 'dotenv'
dotenv.config()

import { generateQuestions } from '../services/aiService'
import { supabase } from '../config/supabase'

async function run() {
  const topic = 'General Software Engineering and Tech Trivia'
  const level = 'Medium'
  const count = 50

  console.log(`🚀 Starting AI Question Generation...`)
  console.log(`Topic: ${topic} | Level: ${level} | Count: ${count}`)
  
  try {
    const newQuestions = await generateQuestions(topic, level, count)
    console.log(`✅ Generated ${newQuestions.length} questions from Gemini.`)
    console.log(`Sample:`, newQuestions[0])
    
    console.log(`🗑️ Deleting old game session answers to resolve foreign keys...`)
    const { error: deleteAnswersErr } = await supabase
      .from('game_session_answers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletes all rows

    if (deleteAnswersErr) {
      console.error('❌ Failed to wipe old game session answers:', deleteAnswersErr)
      process.exit(1)
    }

    console.log(`🗑️ Deleting old questions from Supabase...`)
    const { error: deleteErr } = await supabase
      .from('questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletes all rows

    if (deleteErr) {
      console.error('❌ Failed to wipe old questions:', deleteErr)
      process.exit(1)
    }

    console.log(`💾 Inserting new questions to Supabase...`)
    const { error: insertErr } = await supabase
      .from('questions')
      .insert(newQuestions)

    if (insertErr) {
      console.error('❌ Failed to insert new questions:', insertErr)
      process.exit(1)
    } 

    console.log(`🎉 Successfully wiped and replaced database with ${newQuestions.length} AI generated questions!`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Error during generation script:', err)
    process.exit(1)
  }
}

run()
