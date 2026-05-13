import type { Category, Topic } from '../../types/learning.types';

interface Props {
  categories: Category[];
  selectedTopic: Topic | null;
  completedTopics: string[];
  openCategories: string[];
  searchQuery: string;
  onTopicSelect: (topic: Topic) => void;
  onCategoryToggle: (categoryId: string) => void;
  onSearchChange: (query: string) => void;
  onHomeClick: () => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; icon: string; iconColor: string }> = {
  Languages:        { bg: 'bg-[#EEEDFE]', icon: 'M16 18l6-6-6-6M8 6l-6 6 6 6', iconColor: '#534AB7' },
  'Data Structures': { bg: 'bg-[#E1F5EE]', icon: 'M12 3v18M3 12h18M7 7l10 10M17 7L7 17', iconColor: '#0F6E56' },
  'Design Patterns': { bg: 'bg-[#FAEEDA]', icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z', iconColor: '#854F0B' },
  OOP:              { bg: 'bg-[#E6F1FB]', icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z', iconColor: '#0C447C' },
  Algorithms:       { bg: 'bg-[#EAF3DE]', icon: 'M4 4l7 7M20 4l-7 7M4 20l7-7M20 20l-7-7', iconColor: '#3B6D11' },
};

function getStyle(name: string) {
  return CATEGORY_STYLES[name] ?? { bg: 'bg-[#F0F1F3]', icon: 'M12 2v20M2 12h20', iconColor: '#9CA3AF' };
}

export function Sidebar({ categories, selectedTopic, completedTopics, openCategories, searchQuery, onTopicSelect, onCategoryToggle, onSearchChange, onHomeClick }: Props) {
  const query = searchQuery.toLowerCase();

  const filteredCategories = categories.map(cat => {
    const matchingTopics = cat.topics.filter(t => t.name.toLowerCase().includes(query));
    return { ...cat, topics: matchingTopics };
  }).filter(cat => query === '' ? true : cat.topics.length > 0);

  const totalTopics = categories.reduce((sum, c) => sum + c.topics.length, 0);
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0;

  return (
    <div className="w-[260px] h-full flex flex-col bg-[#F9FAFB] border-r border-[#E5E7EB] shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-center gap-2 mb-3 cursor-pointer" onClick={onHomeClick}>
          <div className="w-7 h-7 bg-[#534AB7] rounded-[6px] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </div>
          <span className="text-[13px] font-medium text-[#111827]">AICodeTutor</span>
        </div>
        <h2 className="text-[13px] font-medium text-[#111827] mb-3">Courses</h2>
        <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-lg px-[10px] py-[7px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search topics..."
            className="flex-1 text-[12px] text-[#111827] placeholder-[#9CA3AF] outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCategories.length === 0 && (
          <p className="text-[12px] text-[#9CA3AF] text-center py-6">No results</p>
        )}

        {filteredCategories.map(cat => {
          const style = getStyle(cat.name);
          const isOpen = openCategories.includes(cat.id) || query !== '';

          return (
            <div key={cat.id} className="mb-1">
              {/* Category header */}
              <button
                onClick={() => onCategoryToggle(cat.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <div className={`w-6 h-6 ${style.bg} rounded-[6px] flex items-center justify-center shrink-0`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={style.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={style.icon} />
                  </svg>
                </div>
                <span className="text-[12px] font-medium text-[#111827] flex-1 text-left">{cat.name}</span>
                <span className="text-[11px] text-[#9CA3AF] mr-1">{cat.topics.length}</span>
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"
                  className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Topics */}
              {isOpen && (
                <div className="ml-4 mt-0.5">
                  {cat.topics.map(topic => {
                    const isCompleted = completedTopics.includes(topic.id);
                    const isActive = selectedTopic?.id === topic.id;
                    const dotColor = isCompleted ? 'bg-[#0F6E56]' : isActive ? 'bg-[#534AB7]' : 'bg-[#E5E7EB]';

                    return (
                      <button
                        key={topic.id}
                        onClick={() => onTopicSelect(topic)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left cursor-pointer transition-colors ${
                          isActive ? 'bg-[#EEEDFE] border-l-2 border-[#534AB7]' : 'hover:bg-white'
                        }`}
                      >
                        <div className={`w-[6px] h-[6px] rounded-full shrink-0 ${dotColor}`} />
                        <span className={`text-[12px] flex-1 truncate ${isActive ? 'text-[#534AB7] font-medium' : 'text-[#111827]'}`}>
                          {topic.name}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] bg-[#E1F5EE] text-[#085041] px-1.5 py-0.5 rounded-full">Done</span>
                        )}
                        {isActive && !isCompleted && (
                          <span className="text-[10px] bg-[#EEEDFE] text-[#3C3489] px-1.5 py-0.5 rounded-full">In progress</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#E5E7EB] shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-[#9CA3AF]">Overall progress</span>
          <span className="text-[11px] text-[#534AB7] font-medium">{completedTopics.length} / {totalTopics} topics</span>
        </div>
        <div className="w-full h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div className="h-full bg-[#534AB7] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </div>
  );
}
