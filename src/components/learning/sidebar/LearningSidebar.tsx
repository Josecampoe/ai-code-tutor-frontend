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
  onTopicSelect: (topic: Topic) => void;
  onCategoryToggle: (id: string) => void;
  onSearchChange: (q: string) => void;
}

export function LearningSidebar({ categories, selectedTopicId, completedTopics, inProgressTopics, openCategories, searchQuery, onTopicSelect, onCategoryToggle, onSearchChange }: Props) {
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
          className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-[#E5E7EB] rounded-lg outline-none focus:border-[#534AB7]"
        />
        {q && visibleCategories.length === 0 && (
          <p className="text-[11px] text-[#9CA3AF] mt-2">No results found</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {visibleCategories.map(cat => (
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
