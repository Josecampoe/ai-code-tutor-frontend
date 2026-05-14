import type { Category, Topic } from '../../../types/learning.types';
import { TopicItem } from './TopicItem';

interface IconProps { color: string; }

function LanguagesIcon({ color }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  );
}

function DataStructuresIcon({ color }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>
      <line x1="12" y1="6" x2="6" y2="16"/><line x1="12" y1="6" x2="18" y2="16"/>
    </svg>
  );
}

function DesignPatternsIcon({ color }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
}

function OopIcon({ color }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  );
}

function AlgorithmsIcon({ color }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
      <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
    </svg>
  );
}

const CATEGORY_ICONS: Record<string, { bg: string; color: string; Icon: React.ComponentType<IconProps> }> = {
  Languages:        { bg: '#EEEDFE', color: '#534AB7', Icon: LanguagesIcon },
  'Data Structures':{ bg: '#E1F5EE', color: '#0F6E56', Icon: DataStructuresIcon },
  'Design Patterns':{ bg: '#FAEEDA', color: '#854F0B', Icon: DesignPatternsIcon },
  OOP:              { bg: '#E6F1FB', color: '#0C447C', Icon: OopIcon },
  Algorithms:       { bg: '#EAF3DE', color: '#3B6D11', Icon: AlgorithmsIcon },
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
  const style = CATEGORY_ICONS[category.name];

  return (
    <div className="mb-1">
      <button
        onClick={() => onToggle(category.id)}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] font-medium text-[#111827] hover:bg-white rounded-lg cursor-pointer transition-colors"
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: style?.bg ?? '#F3F4F6' }}
        >
          {style && <style.Icon color={style.color} />}
        </div>
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
