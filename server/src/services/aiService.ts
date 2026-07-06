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
        description: "A short hint for the answer. Example: 'City of light'"
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
1. Every "question_text" MUST contain exactly one blank represented by four underscores ("____").
2. The "target_word" is the correct answer that belongs in the blank. It should be a single word or short phrase.
3. The "hint" should be a brief, helpful clue.
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
