import { useAppContext } from '../../context/AppContext';
import { Code2 } from 'lucide-react';

export function ExplanationTab() {
  const { state } = useAppContext();

  if (state.explanations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center text-gray-600 gap-2">
        <Code2 className="w-8 h-8 opacity-30" />
        <p className="text-sm">Write some code and click Analyze to see explanations.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {state.explanations.map((exp) => (
        <div
          key={exp.functionName}
          className="rounded-md border border-[#2a2a3e] bg-[#16162a] p-3 transition-all hover:border-indigo-500/40"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Code2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-sm font-medium text-indigo-300 truncate">{exp.functionName}</span>
            <span className="ml-auto text-xs text-gray-600 shrink-0">
              L{exp.lineStart}–{exp.lineEnd}
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">{exp.explanation}</p>
        </div>
      ))}
    </div>
  );
}
