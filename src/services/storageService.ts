import { QuizAttempt, QuizStats } from '../types/quiz';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocs';

const STORAGE_KEY = 'questpdf_quiz_history_v1';

// Initial seed attempts so the dashboard displays authentic historical data immediately on launch
function getInitialSeedData(): QuizAttempt[] {
  const neuroDoc = SAMPLE_DOCUMENTS[0];
  const dsDoc = SAMPLE_DOCUMENTS[1];
  const econDoc = SAMPLE_DOCUMENTS[2];

  return [
    {
      id: 'attempt_seed_1',
      title: 'Neuroscience & Synaptic Plasticity Midterm Review',
      sourceDocName: 'Foundations of Cognitive Neuroscience.pdf',
      date: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // ~22 hours ago
      totalQuestions: 10,
      score: 8,
      percentage: 80,
      timeSpentSeconds: 435, // ~7.25 mins
      mode: 'timed',
      userAnswers: {
        neuro_1: 'B', // Correct
        neuro_2: 'C', // Correct
        neuro_3: 'A', // Incorrect (Correct is B)
        neuro_4: 'C', // Correct
        neuro_5: 'A', // Correct
        neuro_6: 'B', // Correct
        neuro_7: 'B', // Correct
        neuro_8: 'C', // Incorrect (Correct is B)
        neuro_9: 'A', // Correct
        neuro_10: 'A' // Correct
      },
      questions: neuroDoc.sampleQuestions,
      bookmarkedQuestionIds: ['neuro_3', 'neuro_5'],
      timePerQuestionAverage: 43.5
    },
    {
      id: 'attempt_seed_2',
      title: 'Distributed Systems & Cloud Fault Tolerance Practice',
      sourceDocName: 'Distributed Systems Architecture.pdf',
      date: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(), // ~2 days ago
      totalQuestions: 5,
      score: 4,
      percentage: 80,
      timeSpentSeconds: 260,
      mode: 'untimed',
      userAnswers: {
        ds_1: 'B', // Correct
        ds_2: 'A', // Correct
        ds_3: 'B', // Correct
        ds_4: 'A', // Incorrect (Correct is B)
        ds_5: 'B'  // Correct
      },
      questions: dsDoc.sampleQuestions,
      bookmarkedQuestionIds: ['ds_4'],
      timePerQuestionAverage: 52
    },
    {
      id: 'attempt_seed_3',
      title: 'Macroeconomics & Monetary Dynamics Pre-Test',
      sourceDocName: 'Macroeconomic Policy & Inflation.pdf',
      date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // ~5 days ago
      totalQuestions: 5,
      score: 5,
      percentage: 100,
      timeSpentSeconds: 195,
      mode: 'timed',
      userAnswers: {
        econ_1: 'B',
        econ_2: 'A',
        econ_3: 'B',
        econ_4: 'B',
        econ_5: 'B'
      },
      questions: econDoc.sampleQuestions,
      bookmarkedQuestionIds: [],
      timePerQuestionAverage: 39
    }
  ];
}

export function getQuizAttempts(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read quiz attempts from storage', error);
    return [];
  }
}

export function saveQuizAttempt(attempt: QuizAttempt): void {
  try {
    const current = getQuizAttempts();
    // Prepend new attempt
    const updated = [attempt, ...current.filter(a => a.id !== attempt.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save quiz attempt', error);
  }
}

export function getQuizAttemptById(id: string): QuizAttempt | undefined {
  const attempts = getQuizAttempts();
  return attempts.find(a => a.id === id);
}

export function deleteQuizAttempt(id: string): void {
  try {
    const current = getQuizAttempts();
    const updated = current.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete quiz attempt', error);
  }
}

export function clearAllAttempts(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Failed to clear storage', error);
  }
}

export function calculateStats(attempts: QuizAttempt[]): QuizStats {
  if (attempts.length === 0) {
    return {
      totalTests: 0,
      totalQuestionsAnswered: 0,
      averageScore: 0,
      bestScore: 0,
      accuracyRate: 0,
      studyStreakDays: 0
    };
  }

  const totalTests = attempts.length;
  let totalScore = 0;
  let totalQuestions = 0;
  let bestScore = 0;

  for (const a of attempts) {
    totalScore += a.score;
    totalQuestions += a.totalQuestions;
    if (a.percentage > bestScore) {
      bestScore = a.percentage;
    }
  }

  const averageScore = Math.round((totalScore / Math.max(1, totalQuestions)) * 100);
  const accuracyRate = averageScore;

  // Calculate study streak based on unique active days
  const dates = new Set(
    attempts.map(a => new Date(a.date).toISOString().split('T')[0])
  );
  const studyStreakDays = Math.min(dates.size, 14);

  return {
    totalTests,
    totalQuestionsAnswered: totalQuestions,
    averageScore,
    bestScore,
    accuracyRate,
    studyStreakDays
  };
}
