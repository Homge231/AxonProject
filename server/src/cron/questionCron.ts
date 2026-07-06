import cron from 'node-cron'
import { generateQuestions } from '../services/aiService'
import { supabase } from '../config/supabase'

export function initQuestionCron() {
  // Run every Sunday at midnight (0 0 * * 0)
  cron.schedule('0 0 * * 0', async () => {
    console.log('Running weekly AI question generation cron job...')
    try {
      // 1. Generate 50 new questions
      // Feel free to randomize the topic/level each week if desired.
      const newQuestions = await generateQuestions('General Tech and Software Engineering Trivia', 'Medium', 50)
      
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
        .insert(newQuestions)

      if (insertErr) {
        console.error('Failed to insert new questions:', insertErr)
      } else {
        console.log(`Successfully generated and inserted ${newQuestions.length} new AI questions!`)
      }
    } catch (err) {
      console.error('Error during weekly question generation cron job:', err)
    }
  })
}
