import { runScoring } from './src/cores/index';
import { ScoringContext } from './src/cores/BaseCore';
import { PandoraCoreStrategy } from './src/cores/PandoraCoreStrategy';

function createCtx(overrides: Partial<ScoringContext> = {}): ScoringContext {
  return {
    timeTaken: 5000,
    totalTime: 60000,
    combo: 0,
    wrongPenalty: 20,
    oracleRevealLevel: 0,
    flatBuff: 0,
    multiplierBuff: 1.0,
    answerHistory: [],
    targetWord: 'testword', // base points = targetWord.length * 10 = 80
    ...overrides
  };
}

console.log("--- 1. Testing Aegis Shield ---")
let ctx = createCtx({ answerHistory: [true, true, true], initialShieldCount: 0 }); // streak 3
let res = runScoring(true, 'aegis shield', ctx);
console.log("Correct answer (streak 3):", res.breakdown.finalShieldCount, "shields (expected 3)");

ctx = createCtx({ answerHistory: [true, true, true, false], initialShieldCount: 0 }); // streak 3 then wrong
res = runScoring(false, 'aegis shield', ctx);
console.log("Wrong answer with 3 shields:", res.breakdown.shield_blocked, "blocked, points delta:", res.pointsDelta, "(expected 0)");

console.log("\n--- 2. Testing Mission Impossible ---")
ctx = createCtx({ answerHistory: [true, true, true, true, true] }); // streak 5
res = runScoring(true, 'mission impossible', ctx);
console.log("Correct answer (streak 5):", res.breakdown.mission_completed, "completed, flat_buff:", res.breakdown.flat_buff, "(expected 500)");

console.log("\n--- 3. Testing Time Mission ---")
ctx = createCtx({ answerHistory: [true, true, true, true, true] }); // streak 5
res = runScoring(true, 'time mission', ctx);
console.log("Correct answer (streak 5): timerDelta:", res.timerDelta, "(expected 10000)");

console.log("\n--- 4. Testing Super Combo ---")
ctx = createCtx({ combo: 4 }); // combo 4 -> 5
res = runScoring(true, 'super combo', ctx);
console.log("Correct answer (combo 4 -> 5): multiplier:", res.breakdown.multiplier_buff, "(expected 2.5x)");

console.log("\n--- 5. Testing Trickster's Glass (Pandora) ---")
ctx = createCtx({ secondaryCoreName: 'aegis shield' });
// Base result from Aegis Shield for a wrong answer
res = runScoring(false, 'aegis shield', ctx); 
// Apply Pandora modifier
const pandoraStrategy = new PandoraCoreStrategy("trickster's glass");
res = pandoraStrategy.applyModifiers(res, false, ctx, ""); // empty answer
console.log("Trickster's Glass wrong answer (empty): pointsDelta:", res.pointsDelta, "(expected 0)");

console.log("\n--- 6. Testing Chaos Theory (Pandora) ---")
ctx = createCtx({ secondaryCoreName: 'aegis shield' });
res = runScoring(true, 'aegis shield', ctx); 
const chaos = new PandoraCoreStrategy("chaos theory");
res = chaos.applyModifiers(res, true, ctx, "testword");
console.log("Chaos Theory correct answer: pointsDelta:", res.pointsDelta, "(expected > 100)");

console.log("\n--- 7. Testing Golden Combo ---")
ctx = createCtx({ combo: 5 }); 
res = runScoring(true, 'golden combo', ctx);
console.log("Golden Combo correct answer (combo 5): combo_bonus:", res.breakdown.combo_bonus, "(expected 5 * 20 = 100)");
