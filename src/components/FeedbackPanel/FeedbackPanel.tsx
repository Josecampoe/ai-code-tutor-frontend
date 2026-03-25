import { useState } from 'react';
import { ExplanationTab } from './ExplanationTab';
import { SuggestionsTab } from './SuggestionsTab';
import { useAppContext } from '../../context/AppContext';

type Tab = 'explanation' | 'suggestions';

export function FeedbackPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('explanation');
  const { state } = useAppContext();

  return (
    <aside className="flex flex-col w-[25%] min-w-[220px] h-full bg-[#1a1a2e] border-l border-[#2a2a3e]">
      {/* Summary bar */}
      {state.explanations.length > 0 && (
        <div className="px-4 py-2 border-b border-[#2a2a3e] bg-[#16162a]">
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{
            // summary comes from the last analysis — stored in explanations context
            'Code analyzed successfully.'
          }</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a3e] shrink-0">
        {(['explanation', 'suggestions'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors cursor-pointer ${
              activeTab === tab
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
            {tab === 'suggestions' && state.suggestions.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-[10px]">
                {state.suggestions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'explanation' ? <ExplanationTab /> : <SuggestionsTab />}
      </div>
    </aside>
  );
}
