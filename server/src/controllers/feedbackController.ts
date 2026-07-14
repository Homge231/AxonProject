import { Request, Response } from 'express';
import { supabase } from '../config/supabase'; // Adjust path to your Supabase client

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { user_id, session_id, rating, comments } = req.body;

    // Basic validation
    if (!user_id || !session_id || !rating) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('match_feedback')
      .insert([{ user_id, session_id, rating, comments }])
      .select();

    if (error) {
      // Postgres error code 23505 indicates a unique constraint violation
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Feedback already submitted for this session.' });
      }
      throw error;
    }

    return res.status(201).json({ message: 'Feedback submitted successfully', data });
  } catch (err) {
    console.error('Feedback Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};