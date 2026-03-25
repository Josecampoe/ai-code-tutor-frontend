import { useAppContext } from '../../context/AppContext';
import { Lightbulb, X } from 'lucide-react';

export function SuggestionsTab() {
  const { state, dismissSuggestion } = useAppContext();

  if (state.suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center text-gray-600 gap-2">
        <Lightbulb className="w-8 h-8 opacity-30" />
        <p className="text-sm">Suggestions will appear after code analysis.</p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {state.suggestions.map((suggestion, index) => (
        <li
          key={index}
          className="flex items-start gap-3 p-3 rounded-md border border-[#2a2a3e] bg-[#16162a] group"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold shrink-0 mt-0.5">
            {index + 1}
          </span>
          <p className="text-xs text-gray-300 leading-relaxed flex-1">{suggestion}</p>
          <button
            onClick={() => dismissSuggestion(index)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-300 shrink-0 mt-0.5 cursor-pointer"
            aria-label="Dismiss suggestion"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </li>
      ))}
    </ol>
  );
}
