-- NAENRA Core System v1 Standardization Migration

BEGIN;

-- 1. Fix the 10 Main Cores to be core_type = 'main' and classification = 'main'
UPDATE cores 
SET core_type = 'main', classification = 'main'
WHERE name IN (
  'Balance', 
  'Power Strike', 
  'Speedster', 
  'Argus Eyes', 
  'Pandora''s Box', 
  'Mission Impossible', 
  'High Roller', 
  'Aegis Shield', 
  'Perfect Combo', 
  'Phoenix'
);

-- Reset upgrades_to for randomized Tier 1 branching
UPDATE cores 
SET upgrades_to = NULL
WHERE name IN ('High Roller', 'Phoenix');

-- 2. Fix all Tier 2 and Tier 3 cores to be 'upgrade'
UPDATE cores 
SET core_type = 'upgrade'
WHERE name NOT IN (
  'Balance', 
  'Power Strike', 
  'Speedster', 
  'Argus Eyes', 
  'Pandora''s Box', 
  'Mission Impossible', 
  'High Roller', 
  'Aegis Shield', 
  'Perfect Combo', 
  'Phoenix'
);

-- 3. Classify 'power' upgrades
-- These are cores that directly multiply points, add flat bonus points, or manipulate time.
UPDATE cores 
SET classification = 'power'
WHERE name IN (
  -- Combo
  'Radiant Combo', 'Combo Time', 'Combo Multiplier', 'Combo Focus', 'Super Combo', 'Prismatic Combo', 'Golden Combo', 'Combo Mastery', 'Combo Shield',
  -- Speedster
  'Time Warp', 'Mach Speed', 'Overdrive', 'Speed Demon', 'Chronobreak', 'Time Freeze', 'Warp Speed', 'Grand Prix', 'Sonic Boom', 'Speed Shield',
  -- Balanced
  'Harmony', 'Equilibrium', 'Yin Yang', 'Steady Pace', 'Harmony Wave', 'Perfect Harmony', 'Zenith', 'Nirvana', 'Cosmic Balance', 'Universal Harmony',
  -- Power
  'Overclock', 'Hypercharge', 'Power Surge', 'Brute Force', 'Overload', 'Supernova', 'Gigawatt', 'Desperado', 'Absolute Power', 'Supermassive', 'Supermassive Core'
);

-- 4. Classify 'effect' upgrades
-- These are cores that change mechanics: shields, hints, shape-shifting, streaks, probabilities.
UPDATE cores 
SET classification = 'effect'
WHERE name IN (
  -- Combo (Exceptions)
  'Chain Lightning', -- reveals word
  -- Oracle
  'Clairvoyance', 'Third Eye', 'Future Sight', 'Divine Guidance', 'Oracle Blessing', 'Omniscience', 'Mind Reader', 'Predictive Strike', 'Cosmic Wisdom', 'Divine Eye',
  -- Mission
  'Bounty Hunter', 'Daily Quest', 'Shield Mission', 'Time Mission', 'Swift Mission', 'Exodia', 'Bounty Overlord', 'Apex Predator', 'Mission Specialist', 'Mission Master',
  -- Aegis
  'Reflective Aegis', 'Shield Battery', 'Fortress Aegis', 'Shield Synergy', 'Shield Burst', 'Bastion of Light', 'Spiked Shield', 'Indomitable', 'Aegis Nova', 'Guardian Angel',
  -- Pandora
  'Trickster''s Glass', 'Chaos Prism', 'Warp Reality', 'Pandora''s Curse', 'Pandora''s Mirror', 'Chaos Theory', 'Butterfly Effect', 'Pandora''s Wrath', 'Cosmic Entropy', 'Reality Collapse',
  -- Phoenix
  'Phoenix Flame', 'Rebirth', 'Ashes to Ashes', 'Immortal Phoenix', 'Eternal Rebirth', 'Supernova Ashes',
  -- High Roller
  'Jackpot', 'Safe Bet', 'Double or Nothing', 'All In', 'House Advantage', 'Russian Roulette'
);

COMMIT;
