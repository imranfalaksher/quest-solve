import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();

// Support large PDF payloads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface GenerateRequestBody {
  pdfBase64?: string;
  pdfName?: string;
  pdfText?: string;
  quantity?: number;
  difficulty?: 'balanced' | 'intermediate' | 'advanced';
  focusTopics?: string;
}

// API Route: Generate MCQs from PDF
app.post('/api/generate-mcqs', async (req: Request<{}, {}, GenerateRequestBody>, res: Response) => {
  try {
    const { pdfBase64, pdfName, pdfText, quantity = 30, difficulty = 'balanced', focusTopics } = req.body;

    if (!pdfBase64 && !pdfText) {
      return res.status(400).json({ error: 'Please provide either a PDF file or text extract.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in the server environment. Please check the Secrets panel.'
      });
    }

    // Clean base64 string if it contains data URI header
    const cleanBase64 = pdfBase64 ? pdfBase64.replace(/^data:application\/pdf;base64,/, '').trim() : '';

    const targetCount = Math.min(Math.max(Number(quantity) || 10, 5), 100);

    const parts: any[] = [];

    if (cleanBase64) {
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: cleanBase64,
        },
      });
    }

    const promptText = `
You are a distinguished university professor and master assessment creator.
Your task is to generate EXACTLY ${targetCount} comprehensive, academically rigorous Multiple Choice Questions (MCQs) grounded exclusively in the provided PDF study material${pdfName ? ` ("${pdfName}")` : ''}.

Guidelines:
1. Question Distribution:
   - 30% Core Concept Recall & Definitions: Test fundamental axioms, laws, key terms, and core frameworks directly from the document.
   - 40% Conceptual & Analytical Reasoning: Test understanding of mechanisms, cause-and-effect relationships, and distinctions between similar principles.
   - 30% Application & Clinical/Practical Scenarios: Present realistic scenarios or problem statements that require synthesizing multiple concepts from the text.
2. Difficulty Target: ${difficulty.toUpperCase()}.
${focusTopics ? `3. Specific Focus Topics Requested: ${focusTopics}` : ''}
4. Distractor Quality:
   - Each question must have exactly 4 options labeled 'A', 'B', 'C', and 'D'.
   - The correct answer must be unambiguous and supported by the source text.
   - The three incorrect distractors must be plausible, sophisticated, and address common misconceptions or subtle errors—never joke or obviously bogus choices.
5. In-Depth Pedagogical Reasonings:
   - For every question, write a lucid explanation (2 to 4 sentences).
   - Detail WHY the correct option is factually accurate based on the text.
   - Explicitly clarify why the key distractors fail or where the student misconception lies.
6. Topic Tag:
   - Provide a concise 2-4 word topic or chapter tag for each question (e.g., "Enzyme Kinetics", "Consensus Algorithms").

Generate all ${targetCount} questions matching the specified JSON response schema.
`;

    if (pdfText) {
      parts.push({
        text: `Source Document Text Content:\n${pdfText}\n\n${promptText}`,
      });
    } else {
      parts.push({
        text: promptText,
      });
    }

    // First try gemini-3.1-flash-lite for fast, high-availability generation; fallback to gemini-3.8-flash
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an authoritative educational examiner generating rigorous multiple-choice assessments. You strictly output valid JSON adhering to the specified schema.',
          responseSchema: {
            type: Type.ARRAY,
            description: `Array of ${targetCount} MCQ question objects`,
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description: 'The complete question prompt or scenario.',
                },
                options: {
                  type: Type.ARRAY,
                  description: 'Exactly 4 distinct choices A, B, C, D',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: {
                        type: Type.STRING,
                        description: 'One of "A", "B", "C", or "D"',
                      },
                      text: {
                        type: Type.STRING,
                        description: 'The text for this option.',
                      },
                    },
                    required: ['id', 'text'],
                  },
                },
                correctAnswer: {
                  type: Type.STRING,
                  description: 'The correct option letter: "A", "B", "C", or "D"',
                },
                explanation: {
                  type: Type.STRING,
                  description: 'Detailed explanation and pedagogical reasoning citing why this answer is correct.',
                },
                topicTag: {
                  type: Type.STRING,
                  description: 'Short categorical topic tag.',
                },
                difficulty: {
                  type: Type.STRING,
                  description: '"easy", "medium", or "hard"',
                },
              },
              required: ['question', 'options', 'correctAnswer', 'explanation'],
            },
          },
        },
      });
    } catch (primaryErr: any) {
      console.warn('gemini-3.1-flash-lite error, attempting fallback to gemini-3.8-flash:', primaryErr.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
        },
      });
    }

    const rawJson = (response.text ?? '[]').trim();
    let questionsData = [];
    try {
      questionsData = JSON.parse(rawJson);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON response:', rawJson);
      return res.status(500).json({
        error: 'Failed to parse generated question data. Please try again.',
      });
    }

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      return res.status(500).json({
        error: 'No questions could be generated from the provided document. Ensure the PDF contains readable text or diagrams.',
      });
    }

    // Format and assign IDs & question numbers
    const formattedQuestions = questionsData.map((q: any, idx: number) => {
      // Normalize options to ensure A, B, C, D
      const options = (q.options || []).map((opt: any, optIdx: number) => {
        const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
        const validId = letters[optIdx] || opt.id || 'A';
        return {
          id: validId,
          text: String(opt.text || opt),
        };
      });

      // Ensure at least 4 options if model provided fewer
      while (options.length < 4) {
        const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
        options.push({
          id: letters[options.length],
          text: 'None of the above',
        });
      }

      const validAnswers: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
      const rawCorrect = String(q.correctAnswer || 'A').toUpperCase().trim();
      const correctAnswer = validAnswers.includes(rawCorrect as any)
        ? (rawCorrect as 'A' | 'B' | 'C' | 'D')
        : 'A';

      return {
        id: `gen_q_${Date.now()}_${idx + 1}`,
        questionNumber: idx + 1,
        question: q.question,
        options: options.slice(0, 4),
        correctAnswer,
        explanation: q.explanation || 'No detailed reasoning provided.',
        topicTag: q.topicTag || 'General Practice',
        difficulty: q.difficulty || difficulty || 'medium',
      };
    });

    return res.json({
      success: true,
      count: formattedQuestions.length,
      questions: formattedQuestions,
    });
  } catch (err: any) {
    console.error('Error in /api/generate-mcqs:', err);
    return res.status(500).json({
      error: err.message || 'An unexpected error occurred while generating MCQs with Gemini.',
    });
  }
});

// Global error handler ensuring all errors return JSON
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An error occurred processing the request.',
  });
});

// Vite Dev Server or Production Static Files
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QuestPDF Server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
