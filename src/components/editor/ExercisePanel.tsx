import { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { generateExercise, evaluateSolution, getHint, getErrorMessage } from '../../services/api';
import type { LearnTopic, Language, Exercise, ExerciseEvaluation } from '../../types';
import {
  RefreshCw, Send, CheckCircle, XCircle,
  MessageCircle, Lightbulb, Code2, Trophy
} from 'lucide-react';

interface Props {
  topic: LearnTopic;
  language: Language;
  userId: number;
  onAskHelp: (statement: string, code: string) => void;
}

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
};

const DIFFICULTY_STYLES: Record<string, string> = {
  BEGINNER: 'bg-green-500/15 text-green-400 border-green-500/30',
  INTERMEDIATE: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  ADVANCED: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
};

export function ExercisePanel({ topic, language, userId, onAskHelp }: Props) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [studentCode, setStudentCode] = useState('');
  const [evaluation, setEvaluation] = useState<ExerciseEvaluation | null>(null);
  const [hint, setHint] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHint, setShowHint] = useState(false);

  // Reset when topic or language changes
  useEffect(() => {
    setExercise(null);
    setStudentCode('');
    setEvaluation(null);
    setHint('');
    setShowHint(false);
    setErrorMessage('');
  }, [language, topic.id]);

  const handleGenerateExercise = async () => {
    setIsGenerating(true);
    setErrorMessage('');
    setEvaluation(null);
    setHint('');
    setShowHint(false);
    try {
      const generatedExercise = await generateExercise({ topicId: topic.id, language, userId });
      setExercise(generatedExercise);
      setStudentCode(generatedExercise.starterCode ?? '');
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!exercise) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const result = await evaluateSolution({
        exerciseId: exercise.id,
        userCode: studentCode,
        language,
        userId,
      });
      setEvaluation(result);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestHint = async () => {
    if (!exercise) return;
    setIsLoadingHint(true);
    try {
      const hintText = await getHint(exercise.id);
      setHint(hintText);
      setShowHint(true);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleAskAiForHelp = () => {
    if (!exercise) return;
    onAskHelp(exercise.statement, studentCode);
  };

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!exercise) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d0d14] p-8 gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#a78bfa]/20 to-[#0e639c]/20 border border-[#ffffff08] flex items-center justify-center">
          <Code2 className="w-9 h-9 text-[#a78bfa]" />
        </div>

        <div className="text-center max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-base font-semibold text-white">{topic.name}</h2>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${DIFFICULTY_STYLES[topic.difficulty] ?? ''}`}>
              {DIFFICULTY_LABELS[topic.difficulty] ?? topic.difficulty}
            </span>
          </div>
          <p className="text-xs text-[#6b7280] leading-relaxed">{topic.description}</p>
        </div>

        <button
          onClick={handleGenerateExercise}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 text-sm font-medium bg-gradient-to-r from-[#6f42c1] to-[#0e639c] hover:opacity-90 text-white rounded-xl cursor-pointer transition-all shadow-lg shadow-[#6f42c1]/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generando ejercicio...' : 'Generar ejercicio'}
        </button>
      </div>
    );
  }

  // ── Exercise loaded ──────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d14]">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#080810] border-b border-[#ffffff06] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-white truncate">{topic.name}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono shrink-0 ${DIFFICULTY_STYLES[topic.difficulty] ?? ''}`}>
            {DIFFICULTY_LABELS[topic.difficulty] ?? topic.difficulty}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#a78bfa]/30 bg-[#a78bfa]/10 text-[#a78bfa] font-mono shrink-0 capitalize">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAskAiForHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#161622] border border-[#ffffff10] text-[#a78bfa] hover:bg-[#a78bfa]/10 rounded-lg cursor-pointer transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Pedir ayuda
          </button>

          <button
            onClick={handleGenerateExercise}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#161622] border border-[#ffffff10] text-[#cccccc] hover:bg-[#2a2d2e] rounded-lg cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generando...' : 'Nuevo'}
          </button>

          <button
            onClick={handleSubmitSolution}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-[#388a34] hover:bg-[#4a9e46] text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50 font-medium"
          >
            <Send className="w-3 h-3" />
            {isSubmitting ? 'Evaluando...' : 'Entregar'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-xs text-red-400 shrink-0">
          {errorMessage}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Exercise statement */}
        <div className="px-4 py-3 bg-[#161622] border-b border-[#ffffff06] shrink-0 max-h-44 overflow-y-auto">
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-2">📋 Ejercicio</p>
          <p className="text-sm text-[#e5e7eb] leading-relaxed whitespace-pre-wrap">{exercise.statement}</p>
        </div>

        {/* Hint callout */}
        {showHint && hint && (
          <div className="px-4 py-3 bg-[#2d2a1e] border-b border-[#ff9800]/30 shrink-0">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-[#ff9800] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-[#ff9800] uppercase tracking-wider mb-1">Pista</p>
                <p className="text-xs text-[#fcd34d] leading-relaxed">{hint}</p>
              </div>
            </div>
          </div>
        )}

        {/* Evaluation feedback */}
        {evaluation && (
          <div className={`px-4 py-3 border-b shrink-0 ${evaluation.correct ? 'bg-[#1e3a1e] border-green-500/30' : 'bg-[#3a1e1e] border-red-500/30'}`}>
            <div className="flex items-start gap-3">
              {evaluation.correct
                ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                : <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-sm font-semibold ${evaluation.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {evaluation.correct ? '¡Correcto!' : 'Intenta de nuevo'}
                  </span>
                  {evaluation.correct && (
                    <span className="flex items-center gap-1 text-xs text-[#4ec9b0]">
                      <Trophy className="w-3.5 h-3.5" /> +1 completado
                    </span>
                  )}
                </div>

                {/* Score bar */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-[#6b7280] shrink-0">Puntaje</span>
                  <div className="flex-1 h-1.5 bg-[#3c3c3c] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${evaluation.score >= 70 ? 'bg-green-400' : evaluation.score >= 40 ? 'bg-orange-400' : 'bg-red-400'}`}
                      style={{ width: `${evaluation.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#9ca3af] shrink-0 font-mono">{evaluation.score}/100</span>
                </div>

                <p className="text-xs text-[#d1d5db] leading-relaxed">{evaluation.feedback}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hint button row */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0d0d14] border-b border-[#ffffff06] shrink-0">
          <button
            onClick={handleRequestHint}
            disabled={isLoadingHint}
            className="flex items-center gap-1.5 text-xs text-[#ff9800] hover:text-[#fcd34d] transition-colors cursor-pointer disabled:opacity-50"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {isLoadingHint ? 'Cargando pista...' : showHint ? 'Nueva pista' : 'Ver pista'}
          </button>
          <span className="text-[#3c3c3c] text-xs">|</span>
          <span className="text-[10px] text-[#555]">Tu solución</span>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            language={MONACO_LANGUAGE_MAP[language] ?? 'javascript'}
            value={studentCode}
            theme="vs-dark"
            onChange={value => setStudentCode(value ?? '')}
            options={{
              fontSize: 14,
              fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12 },
              lineNumbers: 'on',
              renderLineHighlight: 'line',
            }}
          />
        </div>
      </div>
    </div>
  );
}
