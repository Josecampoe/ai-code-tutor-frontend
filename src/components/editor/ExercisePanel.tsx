import { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { generateExercise, getHint, evaluateSolution, getErrorMessage } from '../../services/api';
import type { LearnTopic, Language, Exercise, ExerciseEvaluation } from '../../types';
import { Lightbulb, Send, RefreshCw, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Props { topic: LearnTopic; language: Language; userId: number; }

type Status = 'idle' | 'generating' | 'ready' | 'submitting' | 'correct' | 'incorrect';

export function ExercisePanel({ topic, language, userId }: Props) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [code, setCode] = useState('');
  const [hint, setHint] = useState('');
  const [hintVisible, setHintVisible] = useState(false);
  const [evaluation, setEvaluation] = useState<ExerciseEvaluation | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [statementOpen, setStatementOpen] = useState(true);

  const handleGenerate = async () => {
    setStatus('generating');
    setError('');
    setHint('');
    setHintVisible(false);
    setEvaluation(null);
    try {
      const ex = await generateExercise({ topicId: topic.id, language, userId });
      setExercise(ex);
      setCode(ex.starterCode);
      setStatus('ready');
      setStatementOpen(true);
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('idle');
    }
  };

  const handleHint = async () => {
    if (!exercise) return;
    try {
      const h = await getHint(exercise.id);
      setHint(h);
      setHintVisible(true);
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const handleSubmit = async () => {
    if (!exercise) return;
    setStatus('submitting');
    setError('');
    try {
      const result = await evaluateSolution({ exerciseId: exercise.id, userCode: code, language, userId });
      setEvaluation(result);
      setStatus(result.correct ? 'correct' : 'incorrect');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('ready');
    }
  };

  const handleReset = () => {
    if (exercise) setCode(exercise.starterCode);
    setEvaluation(null);
    setStatus('ready');
    setHintVisible(false);
  };

  const MONACO_LANG: Record<string, string> = {
    javascript: 'javascript', typescript: 'typescript',
    python: 'python', java: 'java', cpp: 'cpp',
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#252526] border-b border-[#1e1e1e] shrink-0 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-semibold text-[#cccccc] truncate">{topic.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-[#3c3c3c] bg-[#2d2d2d] text-[#858585] font-mono shrink-0">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {exercise && (
            <>
              <button onClick={handleReset} title="Reset code"
                className="p-1.5 text-[#858585] hover:text-[#cccccc] cursor-pointer transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleHint} disabled={hintVisible}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#2d2d2d] border border-[#3c3c3c] text-[#dcdcaa] hover:border-[#dcdcaa]/50 disabled:opacity-40 rounded cursor-pointer transition-colors">
                <Lightbulb className="w-3 h-3" /> Hint
              </button>
              <button onClick={handleSubmit} disabled={status === 'submitting'}
                className="flex items-center gap-1.5 px-3 py-1 text-xs bg-[#388a34] hover:bg-[#4a9e46] text-white rounded disabled:opacity-50 cursor-pointer transition-colors">
                <Send className="w-3 h-3" />
                {status === 'submitting' ? 'Evaluating...' : 'Submit'}
              </button>
            </>
          )}
          <button onClick={handleGenerate} disabled={status === 'generating'}
            className="flex items-center gap-1.5 px-3 py-1 text-xs bg-[#0e639c] hover:bg-[#1177bb] text-white rounded disabled:opacity-50 cursor-pointer transition-colors">
            <RefreshCw className={`w-3 h-3 ${status === 'generating' ? 'animate-spin' : ''}`} />
            {status === 'generating' ? 'Generating...' : exercise ? 'New Exercise' : 'Generate Exercise'}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 bg-[#5a1d1d] border-b border-[#f48771]/30 text-xs text-[#f48771] shrink-0">
          {error}
        </div>
      )}

      {!exercise ? (
        <div className="flex-1 flex flex-col items-center justify-center text-[#555] gap-4">
          <div className="text-center">
            <p className="text-4xl mb-3">{'{ }'}</p>
            <p className="text-sm text-[#858585]">{topic.name}</p>
            <p className="text-xs mt-1 text-[#555]">Click "Generate Exercise" to start</p>
          </div>
          <button onClick={handleGenerate}
            className="px-4 py-2 text-sm bg-[#0e639c] hover:bg-[#1177bb] text-white rounded cursor-pointer transition-colors">
            Generate Exercise
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enunciado colapsable */}
          <div className="shrink-0 border-b border-[#1e1e1e]">
            <button onClick={() => setStatementOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2 bg-[#252526] text-xs text-[#858585] hover:text-[#cccccc] cursor-pointer">
              <span className="font-semibold uppercase tracking-wider">Exercise</span>
              {statementOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {statementOpen && (
              <div className="px-4 py-3 bg-[#1e1e1e] text-sm text-[#cccccc] leading-relaxed max-h-36 overflow-y-auto">
                {exercise.statement}
              </div>
            )}
          </div>

          {/* Hint */}
          {hintVisible && hint && (
            <div className="px-4 py-2 bg-[#1e3a1e] border-b border-[#1e1e1e] text-xs text-[#4ec9b0] shrink-0 flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{hint}</span>
            </div>
          )}

          {/* Resultado de evaluación */}
          {evaluation && (
            <div className={`px-4 py-3 border-b border-[#1e1e1e] shrink-0 flex items-start gap-3
              ${evaluation.correct ? 'bg-[#1e3a1e]' : 'bg-[#3a1e1e]'}`}>
              {evaluation.correct
                ? <CheckCircle className="w-4 h-4 text-[#4ec9b0] shrink-0 mt-0.5" />
                : <XCircle className="w-4 h-4 text-[#f48771] shrink-0 mt-0.5" />}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold ${evaluation.correct ? 'text-[#4ec9b0]' : 'text-[#f48771]'}`}>
                    {evaluation.correct ? 'Correct!' : 'Not quite'}
                  </span>
                  <span className="text-[10px] text-[#858585]">Score: {evaluation.score}/100</span>
                </div>
                <p className="text-xs text-[#cccccc] leading-relaxed">{evaluation.feedback}</p>
              </div>
            </div>
          )}

          {/* Editor Monaco */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language={MONACO_LANG[language] ?? 'javascript'}
              value={code}
              theme="vs-dark"
              onChange={v => setCode(v ?? '')}
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
      )}
    </div>
  );
}
