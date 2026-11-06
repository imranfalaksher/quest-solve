import { MCQQuestion, OptionId } from '../types/quiz';

/**
 * Validates whether extracted text is genuine, legible human language
 * rather than compressed binary stream noise.
 */
export function isValidHumanText(str: string): boolean {
  if (!str || str.trim().length < 50) return false;

  // Must contain readable words with alphabetic characters
  const words = str.match(/\b[A-Za-z]{3,}\b/g) || [];
  if (words.length < 12) return false;

  // Clean text is mostly standard letters, numbers, spaces, and punctuation
  const cleanCharacters = str.replace(/[^a-zA-Z0-9\s.,?!'"\-:;()]/g, '');
  const cleanRatio = cleanCharacters.length / Math.max(1, str.length);
  if (cleanRatio < 0.82) return false;

  // Check for presence of common educational and academic connecting words
  const commonWordsRegex = /\b(the|and|is|in|to|of|that|with|for|as|on|by|from|this|are|or|an|be|at|which|can|have|not|it|we|study|research|system|structure|process|concept|theory|principle|analysis|function|network)\b/i;
  return commonWordsRegex.test(str);
}

/**
 * Extracts plain text from uncompressed PDF Text operators
 * without capturing compressed binary streams.
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

  // Match text objects enclosed in (text) Tj
  const tjRegex = /\(([^)]{2,})\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(binaryString)) !== null) {
    const clean = cleanPdfString(match[1]);
    if (clean && clean.length > 2) extractedChunks.push(clean);
  }

  // Match array text chunks [(text)(more text)] TJ
  const arrayTjRegex = /\[([^\]]+)\]\s*TJ/g;
  while ((match = arrayTjRegex.exec(binaryString)) !== null) {
    const inner = match[1];
    const itemRegex = /\(([^)]{2,})\)/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(inner)) !== null) {
      const clean = cleanPdfString(itemMatch[1]);
      if (clean && clean.length > 2) extractedChunks.push(clean);
    }
  }

  const combined = extractedChunks.join(' ').replace(/\s+/g, ' ').trim();

  // Validate that the extracted text is actual human English and not binary noise
  if (!isValidHumanText(combined)) {
    return '';
  }

  return combined;
}

function cleanPdfString(raw: string): string {
  return raw
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/[^a-zA-Z0-9\s.,?!'"\-:;()]/g, ' ')
    .trim();
}

/**
 * Intelligent client-side question synthesizer from VERIFIED, clean PDF text
 */
export function synthesizeFallbackQuizFromText(
  text: string,
  docName: string,
  targetCount: number,
  difficulty: 'balanced' | 'intermediate' | 'advanced'
): MCQQuestion[] {
  if (!isValidHumanText(text)) {
    return [];
  }

  // Split into clean English sentences
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => {
      // Must be a complete sentence with readable words
      const words = s.match(/\b[A-Za-z]{3,}\b/g) || [];
      return s.length >= 40 && s.length <= 200 && words.length >= 6;
    });

  if (sentences.length === 0) {
    return [];
  }

  const keySentences = sentences.slice(0, Math.max(30, targetCount * 2));
  const questions: MCQQuestion[] = [];
  const cleanDocName = docName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

  for (let i = 0; i < targetCount; i++) {
    const sentenceIndex = i % keySentences.length;
    const sourceSentence = keySentences[sentenceIndex];

    // Extract significant terms
    const words = sourceSentence
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z]/g, ''))
      .filter((w) => w.length > 4 && !/^(about|which|their|there|these|where|could|would|should|other|these|those)/i.test(w));
    
    const focalWord = words[0] || 'core concept';

    const questionTypes = [
      `Based on the provided ${cleanDocName} curriculum, which statement accurately characterizes ${focalWord.toLowerCase()}?`,
      `According to the document text, what is the primary role of ${focalWord.toLowerCase()}?`,
      `In the context of ${cleanDocName}, which of the following is correct regarding ${focalWord.toLowerCase()}?`,
      `How does the text describe the operational principle governing ${focalWord.toLowerCase()}?`,
    ];

    const questionText = questionTypes[i % questionTypes.length];
    const correctOptionText = sourceSentence.replace(/[.?!]$/, '');
    
    const distractors = [
      `It operates independently of the underlying ${focalWord.toLowerCase()} constraints without influencing the primary outcome.`,
      `It functions as an auxiliary parameter that is subordinate to unrelated secondary processes.`,
      `It causes a complete cessation of the fundamental mechanisms described in the curriculum.`,
      `It behaves in reverse order to standard theoretical models under all documented conditions.`,
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
      explanation: `The source material directly states: "${sourceSentence}." The other choices represent distractors that contradict the principles outlined in the text.`,
      topicTag: cleanDocName.slice(0, 24),
      difficulty: difficulty === 'advanced' ? 'hard' : difficulty === 'intermediate' ? 'medium' : 'easy',
    });
  }

  return questions;
}
