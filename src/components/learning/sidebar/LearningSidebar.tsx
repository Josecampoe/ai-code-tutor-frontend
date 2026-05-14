import type { Category, Topic } from '../../../types/learning.types';
import { CategoryItem } from './CategoryItem';
import { SidebarFooter } from './SidebarFooter';

interface Props {
  categories: Category[];
  selectedTopicId: string | null;
  completedTopics: string[];
  inProgressTopics: string[];
  openCategories: string[];
  searchQuery: string;
  isLoadingTopics: boolean;
  topicsError: boolean;
  onTopicSelect: (topic: Topic) => void;
  onCategoryToggle: (id: string) => void;
  onSearchChange: (q: string) => void;
  onRetry: () => void;
}

export function LearningSidebar({ categories, selectedTopicId, completedTopics, inProgressTopics, openCategories, searchQuery, isLoadingTopics, topicsError, onTopicSelect, onCategoryToggle, onSearchChange, onRetry }: Props) {
  const q = searchQuery.toLowerCase().trim();

  const visibleCategories: Category[] = q
    ? categories
        .map(c => ({ ...c, topics: c.topics.filter(t => t.name.toLowerCase().includes(q)) }))
        .filter(c => c.topics.length > 0)
    : categories;

  const total = categories.reduce((s, c) => s + c.topics.length, 0);

  return (
    <div className="w-[260px] h-full flex flex-col bg-[#F9FAFB] border-r border-[#E5E7EB] shrink-0 overflow-hidden">
      <div className="p-4 border-b border-[#E5E7EB]">
        <h2 className="text-[13px] font-medium text-[#111827] mb-2">Courses</h2>
        <input
          type="text"
          placeholder="Search topics..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          disabled={isLoadingTopics || topicsError}
          className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-[#E5E7EB] rounded-lg outline-none focus:border-[#534AB7] disabled:opacity-50"
        />
        {q && visibleCategories.length === 0 && !isLoadingTopics && (
          <p className="text-[11px] text-[#9CA3AF] mt-2">No results found</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoadingTopics && (
          <div className="flex flex-col gap-2 p-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 bg-[#E5E7EB] rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!isLoadingTopics && topicsError && (
          <div className="flex flex-col items-center justify-center h-full py-8 px-3 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" className="mb-3">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-[12px] text-[#4B5563] mb-1">Can't load topics</p>
            <p className="text-[11px] text-[#9CA3AF] mb-3">The server may be waking up. Try again in a moment.</p>
            <button
              onClick={onRetry}
              className="px-3 py-1.5 bg-[#534AB7] text-white rounded-lg text-[11px] font-medium hover:opacity-90 cursor-pointer transition-opacity"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoadingTopics && !topicsError && visibleCategories.map(cat => (
          <CategoryItem
            key={cat.id}
            category={cat}
            isOpen={q ? true : openCategories.includes(cat.id)}
            selectedTopicId={selectedTopicId}
            completedTopics={completedTopics}
            inProgressTopics={inProgressTopics}
            onToggle={onCategoryToggle}
            onTopicSelect={onTopicSelect}
          />
        ))}
      </div>

      <SidebarFooter completed={completedTopics.length} total={total} />
    </div>
  );
}
