export type OptionId = 'A' | 'B' | 'C' | 'D';

export interface MCQOption {
  id: OptionId;
  text: string;
}

export interface MCQQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: MCQOption[];
  correctAnswer: OptionId;
  explanation: string;
  topicTag?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export type QuizMode = 'timed' | 'untimed';

export interface QuizAttempt {
  id: string;
  title: string;
  sourceDocName: string;
  date: string; // ISO date string
  totalQuestions: number;
  score: number;
  percentage: number;
  timeSpentSeconds: number;
  mode: QuizMode;
  userAnswers: Record<string, OptionId>; // questionId -> chosen OptionId
  questions: MCQQuestion[];
  bookmarkedQuestionIds: string[];
  timePerQuestionAverage?: number;
}

export interface QuizStats {
  totalTests: number;
  totalQuestionsAnswered: number;
  averageScore: number;
  bestScore: number;
  accuracyRate: number;
  studyStreakDays: number;
}

export interface SampleDoc {
  id: string;
  title: string;
  category: string;
  summary: string;
  estimatedPages: number;
  sampleQuestions: MCQQuestion[];
}
