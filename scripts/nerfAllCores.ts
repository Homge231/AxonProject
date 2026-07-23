/**
 * nerfAllCores.ts
 *
 * Global rebalance: reset flat_buff and multiplier_buff for all cores so that
 * every correct answer returns ~100 pts by default.
 *
 * Rules:
 *   - Oracle, Balanced, Combo, Speedster → mult=1.0, flat=0  (bonus only from code mechanics)
 *   - Power   T1 → mult=1.5  T2 → mult=2.0  T3 → mult=2.5  flat=0
 *   - Mission → mult=1.0, flat = completion-bonus (per-streak reward)
 *   - Aegis   → mult=1.0, flat = event-bonus (reflect / nova / bastion)
 *   - Pandora → mult=1.0, flat = event-bonus (wrath / chaos prism etc.)
 */
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

type CorePatch = { flat_buff: number; multiplier_buff: number }

const CORE_VALUES: Record<string, CorePatch> = {
  // ── Oracle family ──────────────────────────────────────────────────────────
  // All bonus mechanics are handled in OracleCoreStrategy (hint penalty, 2× on blessing,
  // +300 on predictive strike, 2× on cosmic wisdom, etc.) — DB is neutral.
  'Oracle Core':       { flat_buff: 0, multiplier_buff: 1.0 },
  'Clairvoyance':      { flat_buff: 0, multiplier_buff: 1.0 },
  'Third Eye':         { flat_buff: 0, multiplier_buff: 1.0 },
  'Future Sight':      { flat_buff: 0, multiplier_buff: 1.0 },
  'Divine Guidance':   { flat_buff: 0, multiplier_buff: 1.0 },
  'Oracle Blessing':   { flat_buff: 0, multiplier_buff: 1.0 },
  'Omniscience':       { flat_buff: 0, multiplier_buff: 1.0 },
  'Mind Reader':       { flat_buff: 0, multiplier_buff: 1.0 },
  'Predictive Strike': { flat_buff: 0, multiplier_buff: 1.0 }, // +300 bonus handled in code
  'Cosmic Wisdom':     { flat_buff: 0, multiplier_buff: 1.0 }, // 2× no-hint handled in code
  'Divine Eye':        { flat_buff: 0, multiplier_buff: 1.0 }, // first-correct bonus kept in code

  // ── Balanced family ────────────────────────────────────────────────────────
  // immuneToPenalty handled in BalancedCoreStrategy (code), not DB multiplier.
  'Balanced Core':     { flat_buff: 0, multiplier_buff: 1.0 },
  'Harmony Core':      { flat_buff: 0, multiplier_buff: 1.0 },
  'Equilibrium':       { flat_buff: 0, multiplier_buff: 1.0 },
  'Yin Yang':          { flat_buff: 0, multiplier_buff: 1.0 },
  'Steady Pace':       { flat_buff: 0, multiplier_buff: 1.0 },
  'Harmony Wave':      { flat_buff: 0, multiplier_buff: 1.0 }, // 2-miss immunity in code
  'Perfect Harmony':   { flat_buff: 0, multiplier_buff: 1.0 }, // full penalty immunity in code
  'Zenith Core':       { flat_buff: 0, multiplier_buff: 1.0 },
  'Nirvana':           { flat_buff: 0, multiplier_buff: 1.0 },
  'Cosmic Balance':    { flat_buff: 0, multiplier_buff: 1.0 },
  'Universal Harmony': { flat_buff: 0, multiplier_buff: 1.0 }, // full penalty immunity in code

  // ── Combo family ───────────────────────────────────────────────────────────
  // Streak bonus (comboBonus) is calculated in ComboCoreStrategy, not DB.
  'Combo Core':        { flat_buff: 0, multiplier_buff: 1.0 },
  'Radiant Combo':     { flat_buff: 0, multiplier_buff: 1.0 },
  'Combo Shield':      { flat_buff: 0, multiplier_buff: 1.0 },
  'Combo Time':        { flat_buff: 0, multiplier_buff: 1.0 },
  'Combo Multiplier':  { flat_buff: 0, multiplier_buff: 1.0 },
  'Combo Focus':       { flat_buff: 0, multiplier_buff: 1.0 },
  'Prismatic Combo':   { flat_buff: 0, multiplier_buff: 1.0 },
  'Golden Combo':      { flat_buff: 0, multiplier_buff: 1.0 },
  'Chain Lightning':   { flat_buff: 0, multiplier_buff: 1.0 },
  'Combo Mastery':     { flat_buff: 0, multiplier_buff: 1.0 },
  'Super Combo':       { flat_buff: 0, multiplier_buff: 1.0 },

  // ── Speedster family ───────────────────────────────────────────────────────
  // Speed bonus calculated entirely in SpeedsterCoreStrategy (up to +150), not DB.
  'Speedster':         { flat_buff: 0, multiplier_buff: 1.0 },
  'Time Warp':         { flat_buff: 0, multiplier_buff: 1.0 }, // +2s per correct in FE
  'Speed Shield':      { flat_buff: 0, multiplier_buff: 1.0 },
  'Mach Speed':        { flat_buff: 0, multiplier_buff: 1.0 },
  'Overdrive':         { flat_buff: 0, multiplier_buff: 1.0 },
  'Speed Demon':       { flat_buff: 0, multiplier_buff: 1.0 }, // +3s if < 1.5s in FE
  'Chronobreak':       { flat_buff: 0, multiplier_buff: 1.0 }, // 3s pause per 3-combo in FE
  'Time Freeze':       { flat_buff: 0, multiplier_buff: 1.0 },
  'Warp Speed':        { flat_buff: 0, multiplier_buff: 1.0 },
  'Grand Prix':        { flat_buff: 0, multiplier_buff: 1.0 },
  'Sonic Boom':        { flat_buff: 0, multiplier_buff: 1.0 },

  // ── Power family ───────────────────────────────────────────────────────────
  // Power IS a stat core — higher pts justifies higher penalty risk.
  // T1=1.5× (150pts), T2=2.0× (200pts), T3=2.5× (250pts) — flat=0 always.
  'Power Core':        { flat_buff: 0, multiplier_buff: 1.5 },
  'Overclock Core':    { flat_buff: 0, multiplier_buff: 2.0 },
  'Hypercharge':       { flat_buff: 0, multiplier_buff: 2.0 },
  'Power Surge':       { flat_buff: 0, multiplier_buff: 2.0 },
  'Brute Force':       { flat_buff: 0, multiplier_buff: 2.0 },
  'Overload':          { flat_buff: 0, multiplier_buff: 2.0 },
  'Supernova Core':    { flat_buff: 0, multiplier_buff: 2.5 },
  'Gigawatt Core':     { flat_buff: 0, multiplier_buff: 2.5 },
  'Desperado':         { flat_buff: 0, multiplier_buff: 2.5 },
  'Absolute Power':    { flat_buff: 0, multiplier_buff: 2.5 },
  'Supermassive Core': { flat_buff: 0, multiplier_buff: 2.5 },

  // ── Mission family ─────────────────────────────────────────────────────────
  // flat_buff = points awarded on streak completion (NOT per-answer bonus).
  // mult=1.0 always: every non-mission answer = 100 pts.
  'Mission Core':       { flat_buff: 500,  multiplier_buff: 1.0 }, // every 5 correct → +500
  'Bounty Hunter':      { flat_buff: 500,  multiplier_buff: 1.0 }, // every 5 correct → +500
  'Daily Quest':        { flat_buff: 300,  multiplier_buff: 1.0 }, // every 3 correct → +300
  'Shield Mission':     { flat_buff: 0,    multiplier_buff: 1.0 }, // gives shield, not points
  'Time Mission':       { flat_buff: 400,  multiplier_buff: 1.0 }, // every 5 correct → +400
  'Swift Mission':      { flat_buff: 500,  multiplier_buff: 1.0 }, // every 3 correct → +500
  'Exodia':             { flat_buff: 2000, multiplier_buff: 1.0 }, // every 10 correct → +2000
  'Bounty Overlord':    { flat_buff: 1500, multiplier_buff: 1.0 }, // every 5 correct → +1500
  'Apex Predator':      { flat_buff: 800,  multiplier_buff: 1.0 }, // every 3 correct → +800
  'Mission Specialist': { flat_buff: 1200, multiplier_buff: 1.0 }, // every 4 correct → +1200
  'Mission Master':     { flat_buff: 600,  multiplier_buff: 1.0 }, // every 3 correct → +600

  // ── Aegis family ───────────────────────────────────────────────────────────
  // flat_buff = bonus pts on specific shield events (reflect, nova, etc.).
  'Aegis Shield':      { flat_buff: 0,   multiplier_buff: 1.0 },
  'Reflective Aegis':  { flat_buff: 50,  multiplier_buff: 1.0 }, // +50 on block
  'Shield Battery':    { flat_buff: 0,   multiplier_buff: 1.0 },
  'Fortress Aegis':    { flat_buff: 0,   multiplier_buff: 1.0 },
  'Shield Synergy':    { flat_buff: 50,  multiplier_buff: 1.0 }, // +50 at max shields
  'Shield Burst':      { flat_buff: 50,  multiplier_buff: 1.0 }, // +50 on block
  'Bastion of Light':  { flat_buff: 0,   multiplier_buff: 1.0 }, // 2× at full shields (code)
  'Spiked Shield':     { flat_buff: 150, multiplier_buff: 1.0 }, // +150 on block
  'Indomitable':       { flat_buff: 0,   multiplier_buff: 1.0 }, // +0.15× per shield (code)
  'Aegis Nova':        { flat_buff: 200, multiplier_buff: 1.0 }, // +200 at max shields
  'Guardian Angel':    { flat_buff: 0,   multiplier_buff: 1.0 }, // +10s on overcap (FE)

  // ── Pandora family ─────────────────────────────────────────────────────────
  // flat_buff = bonus pts on triggered events (wrath: wrong→+pts, prism: correct+pts).
  "Pandora's Box":     { flat_buff: 0,   multiplier_buff: 1.0 },
  "Trickster's Glass": { flat_buff: 0,   multiplier_buff: 1.0 }, // 0.5× penalty (code)
  'Chaos Prism':       { flat_buff: 50,  multiplier_buff: 1.0 }, // +50 on correct
  'Warp Reality':      { flat_buff: 0,   multiplier_buff: 1.0 }, // 1.5× on correct (code)
  "Pandora's Curse":   { flat_buff: 0,   multiplier_buff: 1.0 }, // 2× penalty (code)
  "Pandora's Mirror":  { flat_buff: 0,   multiplier_buff: 1.0 }, // typo→positive (code)
  'Chaos Theory':      { flat_buff: 0,   multiplier_buff: 1.0 }, // dual-core (code)
  'Butterfly Effect':  { flat_buff: 0,   multiplier_buff: 1.0 }, // 2× at combo 5+ (code)
  "Pandora's Wrath":   { flat_buff: 200, multiplier_buff: 1.0 }, // wrong→+200 (code)
  'Cosmic Entropy':    { flat_buff: 0,   multiplier_buff: 1.0 }, // random 1-5× (code)
  'Reality Collapse':  { flat_buff: 0,   multiplier_buff: 1.0 }, // 2×/0.5× random (code)
}

async function run() {
  console.log('🔧 Fetching all cores from DB...')
  const { data: cores, error } = await supabase.from('cores').select('id, name, flat_buff, multiplier_buff')
  if (error || !cores) { console.error('Failed to fetch cores:', error); return }

  let updated = 0
  let skipped = 0

  for (const core of cores) {
    const patch = CORE_VALUES[core.name]
    if (!patch) {
      console.warn(`⚠️  No patch defined for core: "${core.name}" — skipping`)
      skipped++
      continue
    }

    if (core.flat_buff === patch.flat_buff && core.multiplier_buff === patch.multiplier_buff) {
      console.log(`✓  ${core.name} already correct (flat=${patch.flat_buff}, mult=${patch.multiplier_buff})`)
      continue
    }

    const { error: updateErr } = await supabase
      .from('cores')
      .update({ flat_buff: patch.flat_buff, multiplier_buff: patch.multiplier_buff })
      .eq('id', core.id)

    if (updateErr) {
      console.error(`❌ Failed to update ${core.name}:`, updateErr)
    } else {
      console.log(`✅ ${core.name}: flat ${core.flat_buff}→${patch.flat_buff}  mult ${core.multiplier_buff}→${patch.multiplier_buff}`)
      updated++
    }
  }

  console.log(`\n📊 Done. Updated: ${updated}, Skipped (no patch): ${skipped}`)
}

run()
