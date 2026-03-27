import { useState } from 'react';
import { ChevronRight, ChevronLeft, Cpu, BookOpen } from 'lucide-react';
import { analyzeCode, generateGuide, getErrorMessage } from '../../services/api';
import type { EditorData } from '../../types';

interface Props { editorData: EditorData | null; code: string; }

type Tab = 'analyze' | 'guide';

export function AIPanel({ editorData, code }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<Tab>('analyze');
  const [analyzing, setAnalyzing] = useState(false);
  const [guiding, setGuiding] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ explanation: string; suggestions: string } | null>(null);
  const [guideResult, setGuideResult] = useState('');
  const [guideInput, setGuideInput] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!editorData || !code.trim()) return;
    setAnalyzing(true); setError('');
    try {
      const res = await analyzeCode({ code, language: editorData.language, projectId: editorData.projectId });
      setAnalysisResult({ explanation: res.explanation, suggestions: res.suggestions });
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setAnalyzing(false); }
  };

  const handleGuide = async () => {
    if (!guideInput.trim()) return;
    setGuiding(true); setError('');
    try { setGuideResult(await generateGuide(guideInput)); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setGuiding(false); }
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center w-8 bg-[#252526] border-l border-[#1e1e1e] py-2">
        <button onClick={() => setCollapsed(false)} className="text-[#858585] hover:text-white cursor-pointer">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-72 bg-[#252526] border-l border-[#1e1e1e] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e] shrink-0">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#bbbbbb]">AI Tutor</span>
        <button onClick={() => setCollapsed(true)} className="text-[#858585] hover:text-white cursor-pointer">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e1e1e] shrink-0">
        {([['analyze', 'Analyze', <Cpu className="w-3.5 h-3.5" />], ['guide', 'Guide', <BookOpen className="w-3.5 h-3.5" />]] as const).map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id as Tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors cursor-pointer
              ${tab === id ? 'text-white border-b-2 border-[#007acc]' : 'text-[#858585] hover:text-[#cccccc]'}`}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {error && <p className="text-xs text-[#f48771]">{error}</p>}

        {tab === 'analyze' && (
          <>
            <button onClick={handleAnalyze} disabled={analyzing || !editorData}
              className="w-full py-2 text-xs bg-[#0e639c] hover:bg-[#1177bb] text-white rounded disabled:opacity-50 cursor-pointer">
              {analyzing ? 'Analyzing...' : 'Analyze Code'}
            </button>
            {analysisResult && (
              <>
                <div className="bg-[#1e1e1e] rounded p-3">
                  <p className="text-xs text-[#569cd6] mb-1 font-semibold">Explanation</p>
                  <p className="text-xs text-[#cccccc] leading-relaxed whitespace-pre-wrap">{analysisResult.explanation}</p>
                </div>
                {analysisResult.suggestions && (
                  <div className="bg-[#1e1e1e] rounded p-3">
                    <p className="text-xs text-[#4ec9b0] mb-1 font-semibold">Suggestions</p>
                    <p className="text-xs text-[#cccccc] leading-relaxed whitespace-pre-wrap">{analysisResult.suggestions}</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tab === 'guide' && (
          <>
            <textarea value={guideInput} onChange={e => setGuideInput(e.target.value)}
              placeholder="Describe your project..." rows={3}
              className="bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 text-xs text-[#cccccc] resize-none focus:outline-none focus:border-[#569cd6]" />
            <button onClick={handleGuide} disabled={guiding || !guideInput.trim()}
              className="w-full py-2 text-xs bg-[#0e639c] hover:bg-[#1177bb] text-white rounded disabled:opacity-50 cursor-pointer">
              {guiding ? 'Generating...' : 'Generate Guide'}
            </button>
            {guideResult && (
              <div className="bg-[#1e1e1e] rounded p-3">
                <p className="text-xs text-[#cccccc] leading-relaxed whitespace-pre-wrap">{guideResult}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
