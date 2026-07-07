import cron from 'node-cron'
import { generateQuestions } from '../services/aiService'
import { supabase } from '../config/supabase'

export function initQuestionCron() {
  // Run every Sunday at midnight (0 0 * * 0)
  cron.schedule('0 0 * * 0', async () => {
    console.log('Running weekly AI question generation cron job...')
    try {
      // 1. Generate 50 new questions
      const topicConfigs = [
        { slug: 'daily-life', prompt: 'Daily Life & Habits' },
        { slug: 'cafe', prompt: 'Food & Cafe Culture' },
        { slug: 'travel', prompt: 'Travel & Vacations' }
      ]
      const levels = ['A1', 'B1', 'B2']
      let allNewQuestions: any[] = []
      
      for (const t of topicConfigs) {
        for (const level of levels) {
          let success = false;
          let attempts = 0;
          while (!success && attempts < 3) {
            try {
              const questions = await generateQuestions(t.prompt, level, 50)
              const questionsWithTopic = questions.map(q => ({ ...q, topic: t.slug }))
              allNewQuestions = allNewQuestions.concat(questionsWithTopic)
              success = true;
            } catch (err: any) {
              attempts++;
              console.error(`⚠️ Cron attempt ${attempts} failed: ${err.message}`)
              if (attempts < 3) {
                await new Promise(r => setTimeout(r, 5000))
              } else {
                throw err
              }
            }
          }
          await new Promise(r => setTimeout(r, 2000))
        }
      }
      
      // 2. Wipe existing questions (optional depending on your exact preference, 
      //    but since the instruction was "delete all questions", we truncate/delete them here).
      const { error: deleteErr } = await supabase
        .from('questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Deletes all rows

      if (deleteErr) {
        console.error('Failed to wipe old questions:', deleteErr)
        return
      }

      // 3. Insert new questions
      const { error: insertErr } = await supabase
        .from('questions')
        .insert(allNewQuestions)

      if (insertErr) {
        console.error('Failed to insert new questions:', insertErr)
      } else {
        console.log(`Successfully generated and inserted ${allNewQuestions.length} new AI questions across levels A1, B1, and B2!`)
      }
    } catch (err) {
      console.error('Error during weekly question generation cron job:', err)
    }
  })
}
