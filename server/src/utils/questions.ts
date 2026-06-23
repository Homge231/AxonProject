/**
 * US-06 [BE] — Standardize Payload Format
 *
 * Single source of truth for the question payload shape used by every game
 * endpoint and controller. Both fields are REQUIRED; the frontend uses
 * `target_word` to derive blank-slot count independently of `question_text`.
 */

export interface QuestionPayload {
  /** The context sentence shown to the player. The blank is marked as "________". */
  question_text: string
  /** The exact answer word the player must type (lowercase). */
  target_word: string
}

// ---------------------------------------------------------------------------
// Mock question bank — replace / augment with DB or AI calls in a later sprint
// ---------------------------------------------------------------------------

const QUESTIONS: QuestionPayload[] = [
  {
    question_text: 'The scientist made a remarkable ________ that changed the field of medicine forever.',
    target_word: 'discovery',
  },
  {
    question_text: 'She spoke with great ________ when addressing the crowd at the packed stadium.',
    target_word: 'confidence',
  },
  {
    question_text: 'The old map revealed a hidden ________ deep inside the mountain range.',
    target_word: 'treasure',
  },
  {
    question_text: 'His ability to ________ complex data in seconds impressed the entire engineering team.',
    target_word: 'analyze',
  },
  {
    question_text: 'The committee reached a unanimous ________ after hours of careful deliberation.',
    target_word: 'decision',
  },
  {
    question_text: 'The athlete showed incredible ________ by finishing the race despite her injury.',
    target_word: 'resilience',
  },
  {
    question_text: 'Every successful project starts with a clear ________ of what needs to be achieved.',
    target_word: 'objective',
  },
  {
    question_text: 'The new policy created significant ________ among employees across all departments.',
    target_word: 'controversy',
  },
]

/**
 * Returns a random question from the bank in the standardized payload format.
 */
export function getRandomQuestion(): QuestionPayload {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
}

/**
 * Validates that a raw object (from AI / DB) conforms to QuestionPayload
 * before it is forwarded to the client. Throws a descriptive Error on failure.
 */
export function validateQuestionPayload(raw: unknown): QuestionPayload {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Question payload must be a non-null object.')
  }

  const obj = raw as Record<string, unknown>

  if (typeof obj.question_text !== 'string' || obj.question_text.trim() === '') {
    throw new Error('Payload missing or empty "question_text".')
  }
  if (typeof obj.target_word !== 'string' || obj.target_word.trim() === '') {
    throw new Error('Payload missing or empty "target_word".')
  }

  return {
    question_text: obj.question_text.trim(),
    target_word:   obj.target_word.trim().toLowerCase(),
  }
}