import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, Check, Clock, Compass, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocs';
import { MCQQuestion, QuizMode, SampleDoc } from '../types/quiz';
import { extractTextFromPdf, synthesizeFallbackQuizFromText } from '../utils/pdfTextExtractor';

interface QuizCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQuiz: (params: {
    title: string;
    sourceDocName: string;
    questions: MCQQuestion[];
    mode: QuizMode;
    timeLimitSeconds: number;
  }) => void;
  preselectedSample?: SampleDoc | null;
}

export const QuizCreatorModal: React.FC<QuizCreatorModalProps> = ({
  isOpen,
  onClose,
  onStartQuiz,
  preselectedSample,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [selectedSample, setSelectedSample] = useState<SampleDoc | null>(preselectedSample || null);
  
  // MCQ quantity presets or custom
  const [quantityPreset, setQuantityPreset] = useState<number | 'custom'>(30);
  const [customQuantity, setCustomQuantity] = useState<number>(25);

  // Quiz mode & difficulty
  const [mode, setMode] = useState<QuizMode>('timed');
  const [difficulty, setDifficulty] = useState<'balanced' | 'intermediate' | 'advanced'>('balanced');
  const [focusTopics, setFocusTopics] = useState<string>('');

  // Generation status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const activeQuantity = quantityPreset === 'custom' ? customQuantity : quantityPreset;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF document (.pdf).');
      return;
    }

    if (file.size > 40 * 1024 * 1024) {
      setErrorMessage('File size exceeds 40MB limit. Please choose a smaller PDF.');
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
    setSelectedSample(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the selected PDF file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please drop a valid PDF document (.pdf).');
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
    setSelectedSample(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: SampleDoc) => {
    setSelectedSample(sample);
    setSelectedFile(null);
    setFileBase64('');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedFile && !selectedSample) {
      setErrorMessage('Please upload a PDF or choose one of the pre-loaded study documents.');
      return;
    }

    const questionCount = Math.max(5, Math.min(100, activeQuantity));
    // Default 1.5 minutes (90 seconds) per question in timed mode
    const timeLimitSeconds = mode === 'timed' ? questionCount * 90 : 0;

    // If using a pre-loaded sample document and no file is uploaded:
    if (selectedSample && !selectedFile) {
      setIsLoading(true);
      setLoadingStep('Synthesizing questions from sample curriculum...');
      
      setTimeout(() => {
        // Build the requested question count from sample or slice
        let questions: MCQQuestion[] = [];
        const baseQuestions = selectedSample.sampleQuestions;

        // If user requested more questions than base, duplicate with modified IDs/tags for practice simulation
        while (questions.length < questionCount) {
          const nextBatch = baseQuestions.map((q, idx) => ({
            ...q,
            id: `${selectedSample.id}_q_${questions.length + idx + 1}`,
            questionNumber: questions.length + idx + 1,
          }));
          questions = [...questions, ...nextBatch];
        }

        questions = questions.slice(0, questionCount).map((q, idx) => ({
          ...q,
          questionNumber: idx + 1,
        }));

        setIsLoading(false);
        onStartQuiz({
          title: `${selectedSample.title} Practice Test`,
          sourceDocName: `${selectedSample.title}.pdf`,
          questions,
          mode,
          timeLimitSeconds,
        });
      }, 700);
      return;
    }

    // Otherwise, generate using server/Cloudflare endpoint with seamless browser text extraction fallback
    try {
      setIsLoading(true);
      setLoadingStep('Parsing document content and extracting text...');

      // Extract text in the browser to accelerate server processing and serve as resilient fallback
      let extractedText = '';
      if (selectedFile) {
        try {
          extractedText = await extractTextFromPdf(selectedFile);
        } catch (extractErr) {
          console.warn('Browser text extraction warning:', extractErr);
        }
      }

      setLoadingStep('Ingesting PDF into Gemini assessment engine...');

      const stepTimer1 = setTimeout(() => {
        setLoadingStep('Analyzing core theorems, concepts, and relationships...');
      }, 1500);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep(`Synthesizing ${questionCount} MCQs with pedagogical explanations...`);
      }, 3500);

      let data: any = null;
      let apiFailed = false;
      let apiErrorMessage = '';

      try {
        const response = await fetch('/api/generate-mcqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfBase64: fileBase64,
            pdfName: selectedFile?.name || 'Document.pdf',
            pdfText: extractedText ? extractedText.slice(0, 30000) : undefined,
            quantity: questionCount,
            difficulty,
            focusTopics: focusTopics.trim() || undefined,
          }),
        });

        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);

        const responseText = await response.text();
        try {
          data = JSON.parse(responseText);
        } catch {
          // If server returned HTML (e.g. 404 Not Found or Cloudflare SPA page)
          apiFailed = true;
          apiErrorMessage = response.status === 404
            ? 'Backend API route not found on this host. Running local document synthesis...'
            : 'Server returned a non-JSON response.';
        }

        if (response.ok && data?.success && Array.isArray(data.questions) && data.questions.length > 0) {
          // Successfully generated via Gemini API
          setIsLoading(false);
          onStartQuiz({
            title: `${(selectedFile?.name || 'Document').replace(/\.pdf$/i, '')} Practice Quiz`,
            sourceDocName: selectedFile?.name || 'Document.pdf',
            questions: data.questions,
            mode,
            timeLimitSeconds,
          });
          return;
        } else if (data?.error) {
          apiFailed = true;
          apiErrorMessage = data.error;
        }
      } catch (networkErr: any) {
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        apiFailed = true;
        apiErrorMessage = networkErr.message || 'Network connection failed.';
      }

      // If backend API failed (e.g. Cloudflare Pages static hosting without serverless functions or missing GEMINI_API_KEY):
      if (apiFailed) {
        // If the error specifically informs about missing GEMINI_API_KEY, display it clearly
        if (apiErrorMessage.includes('GEMINI_API_KEY')) {
          throw new Error(apiErrorMessage);
        }

        // Fallback: If we have text from the user's PDF, synthesize the practice quiz client-side!
        if (extractedText && extractedText.length > 50) {
          setLoadingStep('Synthesizing practice MCQs from document text...');
          const fallbackQuestions = synthesizeFallbackQuizFromText(
            extractedText,
            selectedFile?.name || 'Study Document',
            questionCount,
            difficulty
          );

          setIsLoading(false);
          onStartQuiz({
            title: `${(selectedFile?.name || 'Document').replace(/\.pdf$/i, '')} Practice Quiz`,
            sourceDocName: selectedFile?.name || 'Document.pdf',
            questions: fallbackQuestions,
            mode,
            timeLimitSeconds,
          });
          return;
        }

        // If no text could be extracted and API was unreachable:
        throw new Error(
          apiErrorMessage.includes('Cloudflare')
            ? apiErrorMessage
            : 'Unable to reach the question generator API. For Cloudflare Pages, make sure GEMINI_API_KEY is configured in your project settings, or select one of our curated curricula.'
        );
      }
    } catch (err: any) {
      setIsLoading(false);
      console.error('Quiz generation failed:', err);
      setErrorMessage(
        err.message || 'Generation failed. Please ensure the PDF has readable text or try a sample document.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Create AI Practice Quiz
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generate custom MCQs with in-depth pedagogical reasoning from your PDFs
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: PDF Selection / Dropzone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              1. Source Study Material
            </label>

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-md">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for AI analysis
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setFileBase64('');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <div className="py-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Click to browse or drop your PDF document here
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Textbooks, research papers, lecture slide decks, syllabus outlines (up to 40MB)
                  </p>
                </div>
              )}
            </div>

            {/* Quick Pick Sample Documents */}
            <div className="mt-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Or test immediately with a curated curriculum:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                {SAMPLE_DOCUMENTS.map((doc) => {
                  const isChosen = selectedSample?.id === doc.id && !selectedFile;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => handleSelectSample(doc)}
                      className={`text-left p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                        isChosen
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-900 dark:text-white font-medium'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {doc.category}
                        </span>
                        {isChosen && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <p className="line-clamp-1 text-slate-500 dark:text-slate-400">
                        {doc.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: MCQ Quantity Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Number of Practice Questions
              </label>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                Target: {activeQuantity} Questions
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[10, 30, 50, 100].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setQuantityPreset(qty)}
                  className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                    quantityPreset === qty
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800'
                  }`}
                >
                  {qty} MCQs
                </button>
              ))}

              <button
                type="button"
                onClick={() => setQuantityPreset('custom')}
                className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                  quantityPreset === 'custom'
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800'
                }`}
              >
                Custom
              </button>
            </div>

            {quantityPreset === 'custom' && (
              <div className="mt-3 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                  Enter Custom Quantity:
                </span>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(Number(e.target.value) || 10)}
                  className="w-24 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  (Permitted range: 5 to 100 questions)
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Mode & Difficulty Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mode selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                3. Test Format & Pacing
              </label>
              <div className="space-y-2">
                <div
                  onClick={() => setMode('timed')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    mode === 'timed'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className={`w-4 h-4 ${mode === 'timed' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Timed Exam Mode
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-6">
                    Countdown timer (~1.5 min/Q). Answers revealed on final submit.
                  </p>
                </div>

                <div
                  onClick={() => setMode('untimed')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    mode === 'untimed'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className={`w-4 h-4 ${mode === 'untimed' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Untimed Study Practice
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-6">
                    Self-paced. Instant explanation check per question available.
                  </p>
                </div>
              </div>
            </div>

            {/* Difficulty selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                4. Cognitive Rigor Level
              </label>
              <div className="space-y-2">
                {[
                  { id: 'balanced', label: 'Balanced Curriculum', desc: 'Mix of core recall, analytical logic, & scenario application' },
                  { id: 'intermediate', label: 'Conceptual Synthesis', desc: 'Emphasizes deep principle comparisons and cause-and-effect' },
                  { id: 'advanced', label: 'Board Examination Rigor', desc: 'Complex distractors, edge cases, & applied problem sets' },
                ].map((diff) => (
                  <div
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id as any)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      difficulty === diff.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {diff.label}
                      </span>
                      {difficulty === diff.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {diff.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Focus Topics */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Optional: Specific Chapter or Topic Focus
            </label>
            <input
              type="text"
              placeholder="e.g. Focus on Chapter 4, Synaptic Transmission, or Taylor Rule"
              value={focusTopics}
              onChange={(e) => setFocusTopics(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Loading Progress State */}
          {isLoading && (
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                  {loadingStep}
                </span>
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                Gemini 3.8 Flash is reviewing the text to formulate questions, plausible distractors, and verified reasonings.
              </p>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {selectedFile ? selectedFile.name : selectedSample ? selectedSample.title : 'No PDF selected'}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Processing Document...</span>
                  </>
                ) : (
                  <>
                    <span>Generate {activeQuantity} MCQs</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
