-- =============================================================================
-- NAENRA SUPABASE DATABASE AUDIT & SCHEMA UPDATE SCRIPT
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. RECENT FIELD UPDATES & ENHANCEMENTS FOR ACTIVE TABLES
-- -----------------------------------------------------------------------------

-- 1.1 `players`: Ensure single-session versioning & auto-updated_at
ALTER TABLE players ADD COLUMN IF NOT EXISTS session_version INT DEFAULT 1;
ALTER TABLE players ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 1.2 `game_sessions`: Add core_history array & session_version tracking
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS session_version INT DEFAULT 1;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS core_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 1.3 `cores`: Ensure classification & core_type fields exist
ALTER TABLE cores ADD COLUMN IF NOT EXISTS core_type VARCHAR(20) DEFAULT 'upgrade';
ALTER TABLE cores ADD COLUMN IF NOT EXISTS classification VARCHAR(20) DEFAULT 'power';
ALTER TABLE cores ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Standardize core_type & classification for the 10 Main Anchor Cores
UPDATE cores 
SET core_type = 'main', classification = 'main'
WHERE name IN (
  'Balance', 'Power Strike', 'Speedster', 'Argus Eyes', 'Pandora''s Box', 
  'Mission Impossible', 'High Roller', 'Aegis Shield', 'Perfect Combo', 'Phoenix'
);

-- 1.4 `user_vocab_stats`: Ensure schema for Sprint 5 Analytics
CREATE TABLE IF NOT EXISTS user_vocab_stats (
  user_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  correct_count INT DEFAULT 0,
  incorrect_count INT DEFAULT 0,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, word_id)
);

-- -----------------------------------------------------------------------------
-- 2. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
DROP TRIGGER IF EXISTS set_players_updated_at ON players;
CREATE TRIGGER set_players_updated_at
BEFORE UPDATE ON players
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS set_game_sessions_updated_at ON game_sessions;
CREATE TRIGGER set_game_sessions_updated_at
BEFORE UPDATE ON game_sessions
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS set_user_vocab_stats_updated_at ON user_vocab_stats;
CREATE TRIGGER set_user_vocab_stats_updated_at
BEFORE UPDATE ON user_vocab_stats
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- -----------------------------------------------------------------------------
-- 3. UNNECESSARY / REDUNDANT TABLE CLEANUP (OPTIONAL)
-- Note: Uncomment the statements below if you wish to drop unused legacy tables.
-- -----------------------------------------------------------------------------
-- DROP TABLE IF EXISTS round_results CASCADE; -- Unused; replaced by game_sessions + matchStore
-- DROP TABLE IF EXISTS player_inventory CASCADE; -- Unused in current core selection flow

COMMIT;
