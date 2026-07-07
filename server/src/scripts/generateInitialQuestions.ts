import dotenv from 'dotenv'
dotenv.config()

import { generateQuestions } from '../services/aiService'
import { supabase } from '../config/supabase'

async function run() {
  const topicConfigs = [
    { slug: 'daily-life', prompt: 'Daily Life & Habits' },
    { slug: 'cafe', prompt: 'Food & Cafe Culture' },
    { slug: 'travel', prompt: 'Travel & Vacations' }
  ]
  const levels = ['A1', 'B1', 'B2']
  const countPerTopicLevel = 50 // 50 questions per topic per level

  console.log(`🚀 Starting AI Question Generation...`)
  console.log(`Topics: ${topicConfigs.map(t => t.slug).join(', ')} | Levels: ${levels.join(', ')} | Count per topic/level: ${countPerTopicLevel}`)
  
  try {
    let allNewQuestions: any[] = []

    for (const t of topicConfigs) {
      for (const level of levels) {
        console.log(`⏳ Generating ${countPerTopicLevel} questions for Topic '${t.prompt}' (Level ${level})...`)
        let success = false;
        let attempts = 0;
        while (!success && attempts < 3) {
          try {
            const questions = await generateQuestions(t.prompt, level, countPerTopicLevel)
            const questionsWithTopic = questions.map(q => ({ ...q, topic: t.slug }))
            allNewQuestions = allNewQuestions.concat(questionsWithTopic)
            console.log(`✅ Generated ${questions.length} questions.`)
            success = true;
          } catch (err: any) {
            attempts++;
            console.error(`⚠️ Attempt ${attempts} failed: ${err.message}`)
            if (attempts < 3) {
              console.log('Sleeping for 5 seconds before retrying...')
              await new Promise(r => setTimeout(r, 5000))
            } else {
              throw err
            }
          }
        }
        // Small delay between successful requests to prevent rate limit
        await new Promise(r => setTimeout(r, 2000))
      }
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
