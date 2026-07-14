CREATE TABLE IF NOT EXISTS user_vocab_stats (
  user_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  correct_count INT DEFAULT 0,
  incorrect_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, word_id)
);

-- Enable RLS (Row Level Security) if your project enforces it
ALTER TABLE user_vocab_stats ENABLE ROW LEVEL SECURITY;

-- Allow users to read/update their own stats, and the service role to insert/update
CREATE POLICY "Users can manage their own vocab stats" ON user_vocab_stats
  FOR ALL USING (auth.uid() = user_id);
