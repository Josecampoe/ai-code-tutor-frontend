interface TopicItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  level?: string;
  orderIndex?: number;
}

interface CategoryItem {
  id: string;
  name: string;
  topics: TopicItem[];
}

interface Props {
  categories: CategoryItem[];
  selectedTopicId: string | null;
  completedTopics: string[];
  openCategories: string[];
  searchQuery: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTopicSelect: (topic: any) => void;
  onCategoryToggle: (id: string) => void;
  onSearchChange: (q: string) => void;
  onHomeClick: () => void;
}

export function LearningSidebar({ categories, selectedTopicId, completedTopics, openCategories, searchQuery, onTopicSelect, onCategoryToggle, onSearchChange, onHomeClick }: Props) {
  const filtered = categories.map(c => ({
    ...c,
    topics: c.topics.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())),
  })).filter(c => c.topics.length > 0);

  const totalTopics = categories.reduce((s, c) => s + c.topics.length, 0);
  const pct = totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0;

  return (
    <div className="w-[260px] h-full flex flex-col bg-[#F9FAFB] border-r border-[#E5E7EB] shrink-0 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-3 cursor-pointer" onClick={onHomeClick}>
          <div className="w-7 h-7 bg-[#534AB7] rounded-[6px] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </div>
          <span className="text-[13px] font-medium text-[#111827]">AICodeTutor</span>
        </div>
        <h2 className="text-[13px] font-medium text-[#111827] mb-2">Courses</h2>
        <input
          type="text"
          placeholder="Search topics..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-[#E5E7EB] rounded-lg outline-none focus:border-[#534AB7]"
        />
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.map(cat => (
          <div key={cat.id} className="mb-1">
            <button onClick={() => onCategoryToggle(cat.id)} className="w-full flex items-center justify-between px-2 py-1.5 text-[12px] font-medium text-[#111827] hover:bg-white rounded-lg cursor-pointer">
              <span>{cat.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#9CA3AF]">{cat.topics.length}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className={`transition-transform duration-200 ${openCategories.includes(cat.id) ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </button>
            {openCategories.includes(cat.id) && (
              <div className="ml-2 mt-0.5">
                {cat.topics.map(topic => {
                  const isActive = selectedTopicId === topic.id;
                  const isDone = completedTopics.includes(topic.id);
                  return (
                    <button key={topic.id} onClick={() => onTopicSelect(topic)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left cursor-pointer transition-colors ${isActive ? 'bg-[#EEEDFE] border-l-2 border-[#534AB7]' : 'hover:bg-white'}`}>
                      <div className={`w-[6px] h-[6px] rounded-full shrink-0 ${isDone ? 'bg-[#0F6E56]' : isActive ? 'bg-[#534AB7]' : 'bg-[#E5E7EB]'}`} />
                      <span className={`text-[12px] flex-1 truncate ${isActive ? 'text-[#534AB7] font-medium' : 'text-[#111827]'}`}>{topic.name}</span>
                      {isDone && <span className="text-[10px] bg-[#E1F5EE] text-[#085041] px-1.5 py-0.5 rounded-full">Done</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-[#9CA3AF]">Progress</span>
          <span className="text-[11px] text-[#534AB7] font-medium">{completedTopics.length}/{totalTopics}</span>
        </div>
        <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div className="h-full bg-[#534AB7] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
