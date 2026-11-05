# QuestPDF: AI-Powered PDF MCQ Generator & Performance Dashboard

An intelligent study platform that ingests lecture slides, research papers, and textbook PDFs to generate rigorous, balanced multiple-choice practice exams with instant reasoning explanations and a comprehensive historical performance tracking dashboard.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product choices have been confirmed based on your clarifying answers and design guidelines:

- **Confirmed: Pacing & Test Mode**: Hybrid system providing both a **Timed Exam Mode** (with configurable countdown timer, question-flagging, jump grid, and timed auto-submission) and an **Untimed Study Mode** (immediate answer reveal with instant pedagogical reasonings and retry opportunities).
- **Confirmed: Question Style & Depth**: A curated mix of factual concept recall (30%), analytical reasoning (40%), and applied scenario problems (30%) directly extracted from source PDF concepts, with distractors designed to test genuine comprehension.
- **Confirmed: Post-Quiz Review & Analytics**: Comprehensive scorecards displaying percentage, time-per-question analysis, filterable question lists (All, Incorrect Only, Correct Only, Bookmarked), and deep contextual explanations citing the specific PDF rationale.
- **Confirmed: PDF Ingestion Flexibility**: Native PDF upload (drag & drop or file picker) processed securely via server-side Gemini 3.8 Flash multimodal reasoning, alongside 3 pre-loaded academic sample PDFs (e.g., *Cognitive Neuroscience*, *Computer Systems & Networks*, *Macroeconomics*) for instant 1-click testing.

---

### 1. Overview & Core Concept

- **What It Does**: Users upload one or more study PDFs (or pick curated sample documents), specify their desired question volume (presets for 10, 30, 50, 100 questions or a custom count), and configure their preferred quiz mode. The AI generates a structured MCQ exam with 4 options per question and thorough pedagogical rationales. After taking the exam, users inspect their diagnostic breakdown and review each question with full answer explanations. Past quiz attempts are permanently cataloged in an interactive performance analytics dashboard.
- **Target Audience / Persona**: Students preparing for board or university exams, professionals studying for technical certifications, and educators looking to generate high-quality formative assessments from course literature.
- **Key Value**: Replaces hours of manual flashcard creation with instant, reliable assessment generation directly grounded in the student's own curriculum materials.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Dashboard & Hub**: View historical performance statistics (Total Quizzes, Cumulative Questions Practiced, Average Accuracy %, Study Streak), visual score progression trends, recent test logs with direct "Review Answers" and "Retake Quiz" actions, and a prominent "Generate New Quiz" primary CTA.
2. **PDF Configuration & Generation**:
   - Drag & drop PDF files or select from curated demo documents.
   - Choose MCQ volume via quick selectors (**10**, **30**, **50**, **100**) or enter a custom amount (e.g., 25, 75).
   - Select exam pacing: **Timed Test** (with suggested time limit, e.g. 1.5 mins/question) or **Self-Paced Practice**.
   - Optional difficulty fine-tuning (Balanced, Intermediate, Advanced Board-Style).
   - Smooth loading visual showing real-time PDF processing stages (parsing document, structuring questions, validating distractors).
3. **Active Quiz Workspace**:
   - Clean distraction-free testing environment with a top utility bar: question progress index (`Question 14 of 50`), time elapsed / remaining countdown (in timed mode), and "Flag for Review" button.
   - Question navigator drawer / grid allowing instant jumping to any question, color-coded by answered/unanswered/flagged status.
   - Option cards with clear keyboard and touch selection states (`A`, `B`, `C`, `D`).
   - In Untimed Practice mode: optional "Check Answer Now" button revealing instant feedback and reasoning.
4. **Diagnostic Results & Review**:
   - Hero score banner showing final score, percentage grade, time spent, and performance tier (e.g. Mastered, Proficient, Needs Review).
   - Interactive segmented review filter: `All Questions (50)` · `Incorrect (12)` · `Correct (38)` · `Flagged (5)`.
   - Each review item displays the user's selected option, the correct answer, and an highlighted pedagogical "Reasoning & Explanation" breakdown referencing the source material.
   - Direct actions: "Retake Quiz", "Save to History", or "Download / Print Study Summary".

#### Visual Identity & Theme
- **Aesthetic Direction**: Modern academic SaaS dashboard — authoritative, clean, and legible with zero visual slop. High clarity with ample white space, refined borders, and zero gaudy gradients.
- **Color Palette & Mood**:
  - Dominant Neutral Canvas (60%): Crisp off-white (`#F8FAFC`) in light mode; deep obsidian slate (`#0B0F17`) in dark mode.
  - Structural Surfaces (30%): Pure white (`#FFFFFF`) or dark slate (`#111827`) cards with subtle hairline borders (`border-slate-200 dark:border-slate-800`).
  - Focal Accents (10%): Royal Indigo (`#4F46E5` / `#6366F1`) for primary actions; Emerald (`#059669`) for correct answers; Rose (`#E11D48`) for incorrect answers; Amber (`#D97706`) for flagged review.
- **Typography & Scale**:
  - Display & Headings: `Outfit` / `Plus Jakarta Sans` for clean, professional headers (SemiBold 600, balanced wrapping).
  - Body & Options: `Plus Jakarta Sans` for fatigue-free reading across long option texts.
  - Metrics & Numbers: Tabular figures (`tabular-nums font-mono`) for timers, percentage stats, and question counters.
- **Zero-Pill Discipline**: Metadata displayed as unboxed clean text separated by subtle typographic dots (`·`) instead of stacked capsule badges. No code comment headers (`//`), no decorative fake status dots.
- **Dual-Theme Support**: Flawless light and dark mode switching via Tailwind v4 `@custom-variant dark (&:where(.dark, .dark *))` with optical contrast compensation.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Multimodal PDF Handling via Server Proxy**:
  - *Chosen Approach*: Support direct upload of PDF files, transmitted to an Express backend server endpoint (`/api/generate-mcqs`). The server sends the PDF binary inline to Gemini 3.8 Flash (`gemini-3.8-flash`) with a strict structured JSON schema (`responseSchema`).
  - *Why*: Gemini 3.8 Flash natively supports `application/pdf` inline parts up to tens of megabytes, allowing it to read tables, figures, text, and headings without lossy third-party extraction or complex OCR dependencies.
  - *Alternatives Considered*: Client-side text scraping via pdfjs-dist. Scraped plain text loses document structure, diagrams, and formulas. Gemini's native PDF input preserves full context and semantic structure.
- **Decision 2: Hybrid Timed vs. Untimed State Engine**:
  - *Chosen Approach*: Unified quiz state machine that supports two distinct running modes: **Timed Exam** (strict countdown, hides answers until submission, auto-submits on timeout) and **Self-Paced Practice** (immediate answer reveal toggle per question, no countdown pressure).
  - *Why*: Direct response to user clarification. Caters to both high-stakes exam simulation and relaxed homework revision.
- **Decision 3: Local Storage Persistence with Seeded Performance History**:
  - *Chosen Approach*: Store historical quiz sessions in browser `localStorage`, with automated fallback seeding of 3 realistic prior quiz sessions so the dashboard immediately shows performance graphs and historical tables on first visit.
  - *Why*: Instant zero-auth persistence that works seamlessly in the AI Studio preview environment without requiring external database provisioning.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Interface (React 19)                       │
│                                                                        │
│   ┌────────────────┐   ┌────────────────┐   ┌──────────────────────┐   │
│   │   Dashboard    │   │  Quiz Creator  │   │   Active Exam Room   │   │
│   │  Performance   │   │  PDF Upload &  │   │  Timed / Untimed     │   │
│   │  Stats & Logs  │   │ Preset Config  │   │  Question Navigator  │   │
│   └───────┬────────┘   └───────┬────────┘   └──────────┬───────────┘   │
│           │                    │                       │               │
│           └────────────────────┼───────────────────────┘               │
│                                │                                       │
│                     ┌──────────▼──────────┐                            │
│                     │   Results Review    │                            │
│                     │  Scorecard & Filter │                            │
│                     │ Detailed Reasoning  │                            │
│                     └──────────┬──────────┘                            │
└────────────────────────────────┼───────────────────────────────────────┘
                                 │
     ┌───────────────────────────┴───────────────────────────┐
     │                                                       │
┌────▼──────────────────────────┐         ┌──────────────────▼──────────┐
│   Client Storage & State      │         │     Server API (Express)    │
│  - Quiz History (localStorage)│         │     POST /api/generate-mcqs │
│  - Active Session State       │         │                             │
│  - Bookmarks & Filters        │         │   ┌─────────────────────┐   │
│  - Dark / Light Theme         │         │   │  Google GenAI SDK   │   │
└───────────────────────────────┘         │   │  gemini-3.8-flash   │   │
                                          │   │  responseSchema:    │   │
                                          │   │  Type.ARRAY[MCQ]    │   │
                                          │   └──────────┬──────────┘   │
                                          └──────────────┼──────────────┘
                                                         │
                                          ┌──────────────▼──────────────┐
                                          │   Gemini 3.8 Flash Engine   │
                                          │   - Multimodal PDF ingest   │
                                          │   - Balanced Question Gen   │
                                          │   - Distractor & Rationale  │
                                          └─────────────────────────────┘
```

#### Data Model & TypeScript Contracts

```typescript
export interface MCQOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface MCQQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: MCQOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  topicTag?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizAttempt {
  id: string;
  title: string;
  sourceDocName: string;
  date: string; // ISO string
  totalQuestions: number;
  score: number;
  percentage: number;
  timeSpentSeconds: number;
  mode: 'timed' | 'untimed';
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  questions: MCQQuestion[];
  bookmarkedQuestionIds: string[];
}
```

#### Interactive Component & State Mapping
- `QuizCreatorModal / View`: Handles drag-and-drop PDF dropzone, file validation, question count stepper + buttons (10, 30, 50, 100, custom), mode selector, and preloaded sample document pills. Triggers generation with status progress indicators.
- `ActiveExamView`: Manages timer countdown ticker, current active question pointer, answers map, bookmark toggle, and question jump grid modal. Includes confirmation modal before final submission.
- `QuizResultsView`: Displays overall score circle, pass/fail status, average time per question, and tabs to filter questions (All / Incorrect / Correct / Bookmarked) with expandable explanations.
- `PerformanceDashboard`: Summarizes aggregate metrics (Total Quizzes, Questions Answered, Average Score, High Score), accuracy trend chart, and a comprehensive sortable test history table with 1-click retest and review options.
- `ThemeToggle`: Seamless dark/light toggle syncing with HTML root element and local preferences.
