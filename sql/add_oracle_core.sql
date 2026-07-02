-- Oracle Core: reveals hints for target words, 50% score penalty on correct answers
-- The penalty is handled in server-side calculateScore() logic, not via multiplier_buff column.
INSERT INTO cores (id, name, description, flat_buff, multiplier_buff)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  'Oracle Core',
  'Reveals hints for target words. Correct answers earn 50% fewer points.',
  0,
  1.0
) ON CONFLICT (id) DO NOTHING;
