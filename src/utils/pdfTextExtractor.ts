import { MCQQuestion, OptionId } from '../types/quiz';

/**
 * Extracts plain text from a PDF ArrayBuffer directly in the browser
 * without relying on external server workers or heavy dependencies.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // Convert binary buffer to string chunks
  let binaryString = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, Array.from(chunk));
  }

  const extractedChunks: string[] = [];

  // Match text objects enclosed in (text) Tj or [(text)] TJ
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(binaryString)) !== null) {
    const clean = cleanPdfString(match[1]);
    if (clean) extractedChunks.push(clean);
  }

  // Match array text chunks [(text)(more text)] TJ
  const arrayTjRegex = /\[([^\]]+)\]\s*TJ/g;
  while ((match = arrayTjRegex.exec(binaryString)) !== null) {
    const inner = match[1];
    const itemRegex = /\(([^)]+)\)/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(inner)) !== null) {
      const clean = cleanPdfString(itemMatch[1]);
      if (clean) extractedChunks.push(clean);
    }
  }

  // Also extract plain stream texts if Tj was encoded
  if (extractedChunks.length < 10) {
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let streamMatch;
    while ((streamMatch = streamRegex.exec(binaryString)) !== null) {
      const streamContent = streamMatch[1];
      // Search for readable alphanumeric blocks
      const words = streamContent.match(/[A-Za-z0-9,.:;'"\-–—()]{3,}/g);
      if (words && words.length > 5) {
        extractedChunks.push(words.join(' '));
      }
    }
  }

  const combined = extractedChunks.join(' ').replace(/\s+/g, ' ').trim();
  return combined;
}

function cleanPdfString(raw: string): string {
  return raw
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .trim();
}

/**
 * Intelligent client-side question synthesizer from extracted PDF text
 * Used as a zero-downtime fallback when Cloudflare Pages / static hosting
 * has no backend running or when the network connection fails.
 */
export function synthesizeFallbackQuizFromText(
  text: string,
  docName: string,
  targetCount: number,
  difficulty: 'balanced' | 'intermediate' | 'advanced'
): MCQQuestion[] {
  // Split into sentences
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 35 && s.length <= 220);

  const keySentences = sentences.slice(0, Math.max(30, targetCount * 2));

  const questions: MCQQuestion[] = [];
  const cleanDocName = docName.replace(/\.pdf$/i, '');

  for (let i = 0; i < targetCount; i++) {
    const sentenceIndex = i % (keySentences.length || 1);
    const sourceSentence = keySentences[sentenceIndex] || `Key concepts regarding ${cleanDocName} are fundamental to understanding the topic.`;

    // Extract significant terms
    const words = sourceSentence.split(/\s+/).filter((w) => w.length > 4 && !/^(about|which|their|there|these|where|could|would|should|other)/i.test(w));
    const focalWord = words[0] || 'principle';

    const questionTypes = [
      `Based on the provided ${cleanDocName} material, which statement accurately characterizes the role of ${focalWord.toLowerCase()}?`,
      `According to the curriculum text, what is the primary significance of: "${sourceSentence.slice(0, 75)}..."?`,
      `In the context of ${cleanDocName}, which of the following is true regarding ${focalWord.toLowerCase()}?`,
      `How does the author explain the mechanism governing ${focalWord.toLowerCase()} in the document?`,
    ];

    const questionText = questionTypes[i % questionTypes.length];

    // Generate balanced options
    const correctOptionText = sourceSentence.replace(/[.?!]$/, '');
    const distractors = [
      `It operates independently of the underlying ${focalWord.toLowerCase()} constraints without affecting outcomes.`,
      `It is solely an auxiliary factor that has been superseded by newer experimental classifications.`,
      `It causes a complete negation of the primary processes described in the chapter.`,
      `It functions in reverse order to standard theoretical models under all documented conditions.`,
    ];

    const optionsList = [
      { id: 'A' as OptionId, text: correctOptionText },
      { id: 'B' as OptionId, text: distractors[0] },
      { id: 'C' as OptionId, text: distractors[1] },
      { id: 'D' as OptionId, text: distractors[2] },
    ];

    // Rotate correct answer position
    const targetLetter: OptionId = (['A', 'B', 'C', 'D'][i % 4]) as OptionId;
    const correctIndex = ['A', 'B', 'C', 'D'].indexOf(targetLetter);
    const temp = optionsList[0];
    optionsList[0] = optionsList[correctIndex];
    optionsList[correctIndex] = temp;
    // Re-assign IDs
    const finalOptions = optionsList.map((opt, idx) => ({
      id: (['A', 'B', 'C', 'D'][idx]) as OptionId,
      text: opt.text,
    }));

    questions.push({
      id: `client_q_${Date.now()}_${i + 1}`,
      questionNumber: i + 1,
      question: questionText,
      options: finalOptions,
      correctAnswer: targetLetter,
      explanation: `The source material directly states: "${sourceSentence}". The other choices represent common misconceptions that contradict the explicit principles stated in the text.`,
      topicTag: cleanDocName.slice(0, 24),
      difficulty: difficulty === 'advanced' ? 'hard' : difficulty === 'intermediate' ? 'medium' : 'easy',
    });
  }

  return questions;
}
