// Vercel Serverless Function for /api/generate-mcqs
// Supports both Vercel Node Serverless Functions and Edge/Web Request handlers

import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res?: any) {
  // Check if invoked as a standard Web Request (Edge or Web Fetch API)
  if (!res || typeof res.status !== 'function') {
    return handleWebRequest(req);
  }
  return handleNodeRequest(req, res);
}

async function handleNodeRequest(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error:
          'GEMINI_API_KEY is not set in your Vercel deployment. Please go to Vercel Project Settings > Environment Variables, add GEMINI_API_KEY, and redeploy.',
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { pdfBase64, pdfName, pdfText, quantity = 30, difficulty = 'balanced', focusTopics } = body;

    if (!pdfBase64 && !pdfText) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either a PDF document or text content.',
      });
    }

    const questions = await generateQuestionsWithGemini({
      apiKey,
      pdfBase64,
      pdfName,
      pdfText,
      quantity,
      difficulty,
      focusTopics,
    });

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (err: any) {
    console.error('Vercel generate-mcqs error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred while generating questions.',
    });
  }
}

async function handleWebRequest(request: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            'GEMINI_API_KEY is not set in your Vercel deployment. Please go to Vercel Project Settings > Environment Variables, add GEMINI_API_KEY, and redeploy.',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const body: any = await request.json().catch(() => ({}));
    const { pdfBase64, pdfName, pdfText, quantity = 30, difficulty = 'balanced', focusTopics } = body;

    const questions = await generateQuestionsWithGemini({
      apiKey,
      pdfBase64,
      pdfName,
      pdfText,
      quantity,
      difficulty,
      focusTopics,
    });

    return new Response(
      JSON.stringify({
        success: true,
        count: questions.length,
        questions,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'An error occurred while generating questions.',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function generateQuestionsWithGemini(params: {
  apiKey: string;
  pdfBase64?: string;
  pdfName?: string;
  pdfText?: string;
  quantity?: number;
  difficulty?: string;
  focusTopics?: string;
}): Promise<any[]> {
  const { apiKey, pdfBase64, pdfName, pdfText, quantity = 30, difficulty = 'balanced', focusTopics } = params;
  const targetCount = Math.min(Math.max(Number(quantity) || 10, 5), 100);

  const cleanBase64 = pdfBase64 ? pdfBase64.replace(/^data:application\/pdf;base64,/, '').trim() : '';

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
Your task is to generate EXACTLY ${targetCount} comprehensive, academically rigorous Multiple Choice Questions (MCQs) grounded exclusively in the provided study material${pdfName ? ` ("${pdfName}")` : ''}.

Guidelines:
1. Question Distribution:
   - 30% Core Concept Recall & Definitions: Test fundamental axioms, laws, and core frameworks.
   - 40% Conceptual & Analytical Reasoning: Test understanding of mechanisms and cause-and-effect relationships.
   - 30% Application & Clinical/Practical Scenarios: Present realistic scenarios synthesizing concepts.
2. Target Rigor: ${String(difficulty).toUpperCase()}.
${focusTopics ? `3. Specific Focus Topics: ${focusTopics}` : ''}
4. Distractor Quality:
   - Each question must have exactly 4 options labeled 'A', 'B', 'C', and 'D'.
   - The correct answer must be unambiguous and supported by the source text.
   - The three incorrect distractors must be plausible and address common misconceptions.
5. In-Depth Pedagogical Reasonings:
   - For every question, write a lucid explanation (2 to 4 sentences).
   - Detail WHY the correct option is factually accurate and why the key distractors fail.
6. Topic Tag:
   - Provide a concise 2-4 word topic or chapter tag for each question.

You must output a JSON array of question objects matching this schema:
[
  {
    "question": "Question prompt here?",
    "options": [
      { "id": "A", "text": "Option A text" },
      { "id": "B", "text": "Option B text" },
      { "id": "C", "text": "Option C text" },
      { "id": "D", "text": "Option D text" }
    ],
    "correctAnswer": "A",
    "explanation": "Detailed explanation here.",
    "topicTag": "Topic Name",
    "difficulty": "medium"
  }
]
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

  // Primary attempt: Use @google/genai SDK
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        systemInstruction:
          'You are an authoritative educational examiner generating rigorous multiple-choice assessments. You strictly output valid JSON adhering to the specified schema.',
        responseSchema: {
          type: Type.ARRAY,
          description: `Array of ${targetCount} MCQ question objects`,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ['id', 'text'],
                },
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              topicTag: { type: Type.STRING },
              difficulty: { type: Type.STRING },
            },
            required: ['question', 'options', 'correctAnswer', 'explanation'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      return normalizeQuestions(parsed, targetCount, difficulty);
    }
  } catch (sdkErr) {
    console.warn('SDK generation attempt failed, falling back to REST endpoint:', sdkErr);
  }

  // Secondary fallback: Direct Google Generative Language REST API
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  for (const model of models) {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
        let rawQuestions: any[] = [];
        try {
          rawQuestions = JSON.parse(candidateText.trim());
        } catch {
          const match = candidateText.match(/\[[\s\S]*\]/);
          if (match) rawQuestions = JSON.parse(match[0]);
        }
        if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
          return normalizeQuestions(rawQuestions, targetCount, difficulty);
        }
      }
    } catch (restErr) {
      console.warn(`REST attempt for ${model} failed:`, restErr);
    }
  }

  throw new Error('Could not synthesize questions from the document with the available models.');
}

function normalizeQuestions(raw: any[], targetCount: number, difficulty: string): any[] {
  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  return raw.slice(0, targetCount).map((q: any, idx: number) => {
    const options = (q.options || []).map((opt: any, optIdx: number) => ({
      id: letters[optIdx] || opt.id || 'A',
      text: String(opt.text || opt),
    }));

    while (options.length < 4) {
      options.push({
        id: letters[options.length],
        text: 'None of the above',
      });
    }

    const rawCorrect = String(q.correctAnswer || 'A').toUpperCase().trim();
    const correctAnswer = letters.includes(rawCorrect as any)
      ? (rawCorrect as 'A' | 'B' | 'C' | 'D')
      : 'A';

    return {
      id: `vercel_q_${Date.now()}_${idx + 1}`,
      questionNumber: idx + 1,
      question: q.question,
      options: options.slice(0, 4),
      correctAnswer,
      explanation: q.explanation || 'No detailed reasoning provided.',
      topicTag: q.topicTag || 'General Practice',
      difficulty: q.difficulty || difficulty || 'medium',
    };
  });
}
