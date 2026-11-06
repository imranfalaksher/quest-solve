// Cloudflare Pages Function for /api/generate-mcqs
// This file is automatically executed by Cloudflare Pages when deployed!

interface CloudflareContext {
  request: Request;
  env: {
    GEMINI_API_KEY?: string;
    [key: string]: any;
  };
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestPost(context: CloudflareContext): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const env = context.env || {};
    const apiKey = env.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            'GEMINI_API_KEY is not set in your Cloudflare deployment. Please go to Cloudflare Dashboard > Workers & Pages > Your Project > Settings > Environment variables, add GEMINI_API_KEY, and trigger a new deployment.',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const body: any = await context.request.json().catch(() => ({}));
    const { pdfBase64, pdfName, pdfText, quantity = 30, difficulty = 'balanced', focusTopics } = body;

    if (!pdfBase64 && !pdfText) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Please provide either a PDF document or text content.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const targetCount = Math.min(Math.max(Number(quantity) || 10, 5), 100);

    // Clean base64 string
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
      { "id": "A", "text": "Option A" },
      { "id": "B", "text": "Option B" },
      { "id": "C", "text": "Option C" },
      { "id": "D", "text": "Option D" }
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

    // Call Gemini REST API via native fetch
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let geminiResponseData: any = null;
    let lastError: any = null;

    for (const model of modelsToTry) {
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
          geminiResponseData = await res.json();
          break;
        } else {
          const errText = await res.text();
          lastError = errText;
          console.warn(`Model ${model} returned error:`, errText.slice(0, 150));
        }
      } catch (err: any) {
        lastError = err.message || err;
      }
    }

    if (!geminiResponseData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Gemini API call failed: ${String(lastError || 'Unknown error')}`,
        }),
        { status: 502, headers: corsHeaders }
      );
    }

    const candidateText =
      geminiResponseData?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

    let rawQuestions: any[] = [];
    try {
      rawQuestions = JSON.parse(candidateText.trim());
    } catch {
      // Try to find JSON array in candidate text
      const match = candidateText.match(/\[[\s\S]*\]/);
      if (match) {
        rawQuestions = JSON.parse(match[0]);
      }
    }

    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No valid questions could be synthesized from this document.',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Normalize output format
    const formattedQuestions = rawQuestions.map((q: any, idx: number) => {
      const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
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
        id: `cf_q_${Date.now()}_${idx + 1}`,
        questionNumber: idx + 1,
        question: q.question,
        options: options.slice(0, 4),
        correctAnswer,
        explanation: q.explanation || 'No detailed reasoning provided.',
        topicTag: q.topicTag || 'General Practice',
        difficulty: q.difficulty || difficulty || 'medium',
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        count: formattedQuestions.length,
        questions: formattedQuestions,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'An unexpected error occurred in Cloudflare Pages Function.',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
