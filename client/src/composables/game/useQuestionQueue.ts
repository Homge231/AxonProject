import { ref, nextTick } from 'vue'

export interface QuestionPayload {
  id: string
  question_text: string
  target_length: number
  target_hash: string
  oracle_hints: string[]
  hint?: string
  correct_word?: string
  topic?: string
}

export interface UseQuestionQueueOptions {
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>
  matchStore: any
  gameStore: any
  gameState: any // Ref<GameState>
  typedLetters: any // Ref<string[]>
  oracleRevealLevel: any // Ref<number>
  oracleTotalPenalty: any // Ref<number>
  questionStartTime: any // Ref<number>
  inputRef: any // Ref<HTMLInputElement | null>
  refetchThreshold?: number
}

export function useQuestionQueue(options: UseQuestionQueueOptions) {
  const REFETCH_THRESHOLD = options.refetchThreshold ?? 3
  const questionQueue = ref<QuestionPayload[]>([])
  const isFetchingBatch = ref(false)
  const currentQuestion = ref<QuestionPayload>({
    id: '',
    question_text: '',
    target_length: 0,
    target_hash: '',
    oracle_hints: ['', '', '']
  })

  const MOCK_QUESTIONS: QuestionPayload[] = [
    { id: 'm1', question_text: 'The scientist made a remarkable ________ that changed medicine forever.', target_length: 9, target_hash: '', oracle_hints: ['D·······Y', 'D·S···E·Y', 'D·S·O·E·Y'], hint: 'The act of finding something new' },
    { id: 'm2', question_text: 'She spoke with great ________ when addressing the crowd at the stadium.', target_length: 10, target_hash: '', oracle_hints: ['C········E', 'C·N····C·E', 'C·N·I·E·C·E'], hint: 'A feeling of self-assurance' },
    { id: 'm3', question_text: 'His ability to ________ complex data in seconds impressed the entire team.', target_length: 7, target_hash: '', oracle_hints: ['A·····E', 'A·A··Z·E', 'A·A·Y·Z·E'], hint: 'Examine methodically and in detail' },
    { id: 'm4', question_text: 'The team celebrated their ________ after months of hard work.', target_length: 7, target_hash: '', oracle_hints: ['V·····Y', 'V·C··R·Y', 'V·C·O·R·Y'], hint: 'Winning a competition' },
    { id: 'm5', question_text: 'She showed great ________ in the face of adversity.', target_length: 10, target_hash: '', oracle_hints: ['R········E', 'R·S····N·E', 'R·S·L·E·N·E'], hint: 'Ability to recover quickly' },
  ]

  async function fetchBatch(): Promise<void> {
    if (isFetchingBatch.value || options.gameState.value === 'timeout') return
    isFetchingBatch.value = true
    try {
      const topic = options.matchStore.topics?.[options.matchStore.currentRound - 1] || 'daily-life'
      const res = await options.fetchWithAuth(`/api/game/questions?topic=${topic}`)
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      questionQueue.value.push(...(data.questions as QuestionPayload[]))
    } catch {
      const shuffled = [...MOCK_QUESTIONS].sort(() => Math.random() - 0.5)
      questionQueue.value.push(...shuffled)
    } finally {
      isFetchingBatch.value = false
    }
  }

  async function loadQuestion() {
    options.gameState.value = 'loading'
    options.typedLetters.value = []
    options.oracleRevealLevel.value = 0
    options.oracleTotalPenalty.value = 0

    if (questionQueue.value.length <= REFETCH_THRESHOLD) {
      fetchBatch()
    }

    const next = questionQueue.value.shift()
    if (!next) {
      currentQuestion.value = MOCK_QUESTIONS[Math.floor(Math.random() * MOCK_QUESTIONS.length)]
      fetchBatch()
    } else {
      currentQuestion.value = next
    }

    options.questionStartTime.value = Date.now()
    options.gameState.value = 'playing'

    const activeName = (options.gameStore.activeCoreName || '').toLowerCase()
    const hasThirdEye = activeName === 'third eye'
    const hasOmniscience = activeName === 'omniscience'
    const hasMindReader = activeName === 'mind reader'
    const hasDivineEye = activeName === 'divine eye'

    if ((hasOmniscience || hasThirdEye || hasDivineEye) && currentQuestion.value.target_length > 0) {
      const firstLetter = currentQuestion.value.oracle_hints?.[0]?.charAt(0)?.toLowerCase() || '_'
      if (firstLetter && firstLetter !== '·') {
        options.typedLetters.value = [firstLetter]
      }
    } else if (hasMindReader && currentQuestion.value.target_length > 1) {
      const hintLetters = currentQuestion.value.oracle_hints?.[2]?.split(' ') || []
      const first = hintLetters[0]?.toLowerCase()
      const second = hintLetters[1]?.toLowerCase()
      if (first && first !== '·' && second && second !== '·') {
        options.typedLetters.value = [first, second]
      }
    }

    await nextTick()
    options.inputRef.value?.focus()
  }

  function clearQueue() {
    questionQueue.value = []
  }

  return {
    questionQueue,
    isFetchingBatch,
    currentQuestion,
    fetchBatch,
    loadQuestion,
    clearQueue
  }
}
