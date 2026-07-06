import dotenv from 'dotenv'
dotenv.config()

import { generateQuestions } from '../services/aiService'
import { supabase } from '../config/supabase'

async function run() {
  const topic = 'Daily Life & Habits, Food & Cafe Culture, and Travel & Vacations'
  const levels = ['A1', 'B1', 'B2']
  const countPerLevel = 50

  console.log(`🚀 Starting AI Question Generation...`)
  console.log(`Topic: ${topic} | Levels: ${levels.join(', ')} | Count per level: ${countPerLevel}`)
  
  try {
    let allNewQuestions: any[] = []

    for (const level of levels) {
      console.log(`⏳ Generating ${countPerLevel} questions for Level ${level}...`)
      const questions = await generateQuestions(topic, level, countPerLevel)
      allNewQuestions = allNewQuestions.concat(questions)
      console.log(`✅ Generated ${questions.length} questions for Level ${level}.`)
    }
    
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

    console.log(`💾 Inserting ${allNewQuestions.length} new questions to Supabase...`)
    const { error: insertErr } = await supabase
      .from('questions')
      .insert(allNewQuestions)

    if (insertErr) {
      console.error('❌ Failed to insert new questions:', insertErr)
      process.exit(1)
    } 

    console.log(`🎉 Successfully wiped and replaced database with ${allNewQuestions.length} AI generated questions across levels A1, B1, and B2!`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Error during generation script:', err)
    process.exit(1)
  }
}

run()
