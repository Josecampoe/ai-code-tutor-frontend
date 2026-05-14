import type { Category, Topic } from '../../../types/learning.types';
import { TopicItem } from './TopicItem';

const CATEGORY_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  Languages: {
    bg: '#EEEDFE', color: '#534AB7',
    icon: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  },
  'Data Structures': {
    bg: '#E1F5EE', color: '#0F6E56',
    icon: '<line x1="12" y1="3" x2="12" y2="8"/><line x1="12" y1="8" x2="6" y2="16"/><line x1="12" y1="8" x2="18" y2="16"/><circle cx="12" cy="3" r="1.5" fill="currentColor"/><circle cx="6" cy="17" r="2" fill="currentColor"/><circle cx="18" cy="17" r="2" fill="currentColor"/>',
  },
  'Design Patterns': {
    bg: '#FAEEDA', color: '#854F0B',
    icon: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
  },
  OOP: {
    bg: '#E6F1FB', color: '#0C447C',
    icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
  },
  Algorithms: {
    bg: '#EAF3DE', color: '#3B6D11',
    icon: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>',
  },
};

interface Props {
  category: Category;
  isOpen: boolean;
  selectedTopicId: string | null;
  completedTopics: string[];
  inProgressTopics: string[];
  onToggle: (id: string) => void;
  onTopicSelect: (topic: Topic) => void;
}

export function CategoryItem({ category, isOpen, selectedTopicId, completedTopics, inProgressTopics, onToggle, onTopicSelect }: Props) {
  const style = CATEGORY_STYLE[category.name];

  return (
    <div className="mb-1">
      <button
        onClick={() => onToggle(category.id)}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] font-medium text-[#111827] hover:bg-white rounded-lg cursor-pointer transition-colors"
      >
        {style ? (
          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: style.bg }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={style.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: style.icon }} />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-md bg-[#F3F4F6] shrink-0" />
        )}
        <span className="flex-1 text-left">{category.name}</span>
        <span className="text-[11px] text-[#9CA3AF]">{category.topics.length}</span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div className="ml-2 mt-0.5">
          {category.topics.map(topic => (
            <TopicItem
              key={topic.id}
              topic={topic}
              isActive={selectedTopicId === topic.id}
              isCompleted={completedTopics.includes(topic.id)}
              isInProgress={inProgressTopics.includes(topic.id)}
              onSelect={onTopicSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
