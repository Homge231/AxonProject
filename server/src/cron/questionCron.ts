import cron from 'node-cron'
import { generateQuestions } from '../services/aiService'
import { supabase } from '../config/supabase'

export function initQuestionCron() {
  // Run every Sunday at midnight (0 0 * * 0)
  cron.schedule('0 0 * * 0', async () => {
    console.log('Running weekly AI question generation cron job...')
    try {
      // 1. Generate 50 new questions
      // 1. Generate 150 new questions (50 for A1, 50 for B1, 50 for B2)
      const topic = 'Daily Life & Habits, Food & Cafe Culture, and Travel & Vacations'
      const levels = ['A1', 'B1', 'B2']
      let allNewQuestions: any[] = []
      
      for (const level of levels) {
        const questions = await generateQuestions(topic, level, 50)
        allNewQuestions = allNewQuestions.concat(questions)
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
