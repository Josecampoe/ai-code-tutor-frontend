import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { getTopicsByCategory, getErrorMessage } from '../../services/api';
import type { LearnTopic, LearnCategory } from '../../types';

const SECTIONS: { category: LearnCategory; label: string; emoji: string }[] = [
  { category: 'DATA_STRUCTURE', label: 'Data Structures', emoji: '📦' },
  { category: 'DESIGN_PATTERN', label: 'Design Patterns', emoji: '🔷' },
  { category: 'ALGORITHM', label: 'Algorithms', emoji: '⚡' },
];

interface Props {
  onSelectTopic: (topic: LearnTopic) => void;
  activeTopicId: number | null;
}

export function LearnSidebar({ onSelectTopic, activeTopicId }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [topics, setTopics] = useState<Record<string, LearnTopic[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleSection = async (category: LearnCategory) => {
    const isOpen = open[category];
    setOpen(prev => ({ ...prev, [category]: !isOpen }));
    if (!isOpen && !topics[category]) {
      setLoading(prev => ({ ...prev, [category]: true }));
      try {
        const data = await getTopicsByCategory(category);
        setTopics(prev => ({ ...prev, [category]: data }));
      } catch (err) {
        setErrors(prev => ({ ...prev, [category]: getErrorMessage(err) }));
      } finally {
        setLoading(prev => ({ ...prev, [category]: false }));
      }
    }
  };

  return (
    <div className="flex flex-col h-full text-[#cccccc]">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-[#bbbbbb]">Learn</div>
      <div className="flex-1 overflow-y-auto">
        {SECTIONS.map(({ category, label, emoji }) => (
          <div key={category}>
            <button
              onClick={() => toggleSection(category)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[#2a2d2e] transition-colors cursor-pointer">
              {open[category]
                ? <ChevronDown className="w-3.5 h-3.5 text-[#858585]" />
                : <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />}
              <span>{emoji} {label}</span>
            </button>

            {open[category] && (
              <div className="pl-6">
                {loading[category] && <p className="text-xs text-[#858585] px-3 py-1">Loading...</p>}
                {errors[category] && <p className="text-xs text-[#f48771] px-3 py-1">{errors[category]}</p>}
                {(topics[category] ?? []).map(topic => (
                  <button key={topic.id} onClick={() => onSelectTopic(topic)}
                    className={`w-full text-left px-3 py-1.5 text-sm transition-colors cursor-pointer
                      ${activeTopicId === topic.id ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-[#cccccc]'}`}>
                    {topic.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
