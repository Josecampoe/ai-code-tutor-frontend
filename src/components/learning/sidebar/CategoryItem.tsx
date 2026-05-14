import type { Category, Topic } from '../../../types/learning.types';
import { TopicItem } from './TopicItem';

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
  return (
    <div className="mb-1">
      <button
        onClick={() => onToggle(category.id)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-[12px] font-medium text-[#111827] hover:bg-white rounded-lg cursor-pointer"
      >
        <span>{category.name}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#9CA3AF]">{category.topics.length}</span>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
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
