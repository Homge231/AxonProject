import { GoogleGenAI, Type, Schema } from '@google/genai'

// We instantiate it dynamically inside the function to ensure dotenv is loaded
let ai: GoogleGenAI | null = null;

export interface GeneratedQuestion {
  question_text: string
  target_word: string
  hint: string
}

// Define the precise schema for the expected JSON output
const questionSchema: Schema = {
  type: Type.ARRAY,
  description: "A list of fill-in-the-blank vocabulary or trivia questions.",
  items: {
    type: Type.OBJECT,
    properties: {
      question_text: {
        type: Type.STRING,
        description: "The question text. IMPORTANT: It MUST contain a single '____' (4 underscores) to indicate the missing target word. Example: 'The capital of France is ____.'"
      },
      target_word: {
        type: Type.STRING,
        description: "The answer that fills in the blank. Example: 'Paris'"
      },
      hint: {
        type: Type.STRING,
        description: "A highly specific, unambiguous hint that strongly points to the target_word. The hint MUST always start with a capital letter."
      }
    },
    required: ["question_text", "target_word", "hint"]
  }
}

export async function generateQuestions(topic: string, level: string, count: number): Promise<GeneratedQuestion[]> {
  const prompt = `
You are an expert trivia and vocabulary question writer.
Generate exactly ${count} fill-in-the-blank questions.
Topic: ${topic}
Difficulty Level: ${level}

RULES:
1. **question_text**: A fill-in-the-blank question containing EXACTLY ONE blank represented by four underscores ("____").
2. **target_word**: The exact word that goes in the blank (must be a single word, lowercase).
3. **target_word restriction**: The target_word MUST NOT contain spaces, hyphens (-), apostrophes, or any other punctuation/special characters. It MUST consist entirely of alphabet letters (a-z).
4. **hint**: A highly specific, unambiguous hint that strongly points to the target_word. The hint MUST always start with a capital letter.
`

  try {
    if (!ai) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
      }
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: questionSchema,
        temperature: 0.7,
      }
    })

    if (!response.text) {
      throw new Error("AI returned empty response")
    }

    const data: GeneratedQuestion[] = JSON.parse(response.text)
    return data
  } catch (error) {
    console.error("Error generating questions from Gemini:", error)
    throw error
  }
}

export async function generateCoachAnalysis(
  username: string,
  analyticsData: any[],
  userMessage?: string,
  history?: { role: 'user' | 'model'; message: string }[]
): Promise<string> {
  // If GEMINI_API_KEY is available, use Gemini 2.5 Flash
  if (process.env.GEMINI_API_KEY) {
    try {
      if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
      }

      const analyticsSummary = analyticsData.map(item => ({
        topic: item.topic,
        accuracy: item.accuracy + '%',
        questions: `${item.correctAnswers}/${item.totalQuestions}`,
        weakestWords: item.weakestWords?.map((w: any) => `${w.word} (${w.incorrect} misses)`).join(', ') || 'None'
      }))

      const systemContext = `You are Naenra AI Coach, a friendly, sharp, and encouraging personal tutor in the competitive typing arena Naenra.
Player username: "${username}".
Vocabulary performance analytics summary:
${JSON.stringify(analyticsSummary, null, 2)}

INSTRUCTIONS:
1. Provide personalized feedback, encouragement, and actionable study advice.
2. Reference specific topics, accuracy percentages, and missed words from their data.
3. Keep responses engaging, well-formatted with markdown (bold, bullet points), concise (under 180 words), and friendly.
4. Use 2-3 appropriate emojis (e.g. 🎯, ⚡, 💡).`

      let prompt = systemContext
      if (history && history.length > 0) {
        prompt += `\n\nCONVERSATION HISTORY:\n` + history.map(h => `${h.role === 'user' ? 'Player' : 'AI Coach'}: ${h.message}`).join('\n')
      }

      if (userMessage) {
        prompt += `\n\nPlayer question: "${userMessage}"\nRespond directly as Naenra AI Coach:`
      } else {
        prompt += `\n\nProvide an initial comprehensive analysis and personalized 3-step learning plan for ${username}:`
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      })

      if (response.text) {
        return response.text
      }
    } catch (error) {
      console.warn("Gemini API call failed, falling back to rule-based coach analysis:", error)
    }
  }

  // --- SMART FALLBACK AI COACH (when GEMINI_API_KEY is not set or API fails) ---
  const sorted = [...analyticsData].sort((a, b) => b.accuracy - a.accuracy)
  const bestTopic = sorted[0]
  const worstTopic = sorted[sorted.length - 1]

  const allWeakWords: { word: string; incorrect: number }[] = []
  analyticsData.forEach(item => {
    if (item.weakestWords) {
      allWeakWords.push(...item.weakestWords)
    }
  })
  allWeakWords.sort((a, b) => b.incorrect - a.incorrect)
  const topWeakWords = allWeakWords.slice(0, 3)

  if (userMessage) {
    const qLower = userMessage.toLowerCase()
    if (qLower.includes('science') || qLower.includes('sports') || qLower.includes('topic') || qLower.includes('master')) {
      return `🎯 **Coach Advice for ${username}:**\nTo master your topics, focus on words with high error rates. For **${worstTopic ? worstTopic.topic : 'weak areas'}**, practice typing target terms repeatedly in Single Player matches. Using **Oracle Core** will grant letter hints to build muscle memory!`
    }
    if (qLower.includes('core') || qLower.includes('strategy') || qLower.includes('power')) {
      return `⚡ **Core Selection Strategy:**\n- **Combo Core**: Great if your overall accuracy is over 70% to stack score multipliers.\n- **Oracle Core**: Best for topics like **${worstTopic?.topic || 'difficult categories'}** where you need hint reveals.\n- **Speedster**: Use on topics like **${bestTopic?.topic || 'your top category'}** where your typing speed is highest!`
    }
    return `💡 **Coach Recommendation:**\nGreat question, **${username}**! Based on your recent matches, your accuracy in **${bestTopic?.topic || 'top topics'}** is solid at **${bestTopic?.accuracy || 80}%**. Keep practicing your weakest words (**${topWeakWords.map(w => w.word).join(', ') || 'missed terms'}**) to push your ELO rank higher!`
  }

  const weakWordsList = topWeakWords.length > 0 
    ? topWeakWords.map(w => `\`${w.word}\` (${w.incorrect} misses)`).join(', ')
    : 'None yet! Great job.'

  return `Hey **${username}**! I've analyzed your performance data across **${analyticsData.length}** vocabulary categories. Here is your personalized learning report:

🎯 **Key Highlights:**
- **Strongest Category:** **${bestTopic?.topic || 'General'}** (${bestTopic?.accuracy || 0}% accuracy)
- **Focus Area:** **${worstTopic?.topic || 'General'}** (${worstTopic?.accuracy || 0}% accuracy)

💡 **Weakest Words to Watch Out For:**
${weakWordsList}

⚡ **3-Step Action Plan:**
1. **Warm Up:** Play 1-2 Single Player matches in **${bestTopic?.topic || 'your strong topic'}** to get into your typing rhythm.
2. **Target Weak Spots:** Focus on **${worstTopic?.topic || 'difficult topics'}** and take extra care when typing **${topWeakWords[0]?.word || 'missed terms'}**.
3. **Core Synergies:** Equip **Oracle Core** to reveal hints on tough words, or **Combo Core** to maximize your high accuracy streaks!`
}


