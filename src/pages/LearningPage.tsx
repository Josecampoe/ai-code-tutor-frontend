import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

interface TopicItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  level: string;
  orderIndex: number;
}

interface CategoryItem {
  id: string;
  name: string;
  topics: TopicItem[];
}

interface LessonSection {
  type: 'explanation' | 'example' | 'tip' | 'exercise';
  title: string;
  content?: string;
  code?: string;
  prompt?: string;
  hints?: string[];
}

interface LessonData {
  id: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  contentJson: string;
  language: string;
  level: string;
}

export function LearningPage() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicItem | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonData | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('Java');
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const getToken = () => localStorage.getItem('codetutor_token');

  const categoryNameMap: Record<string, string> = {
    LANGUAGE: 'Languages',
    DATA_STRUCTURE: 'Data Structures',
    DESIGN_PATTERN: 'Design Patterns',
    OOP: 'OOP',
    ALGORITHM: 'Algorithms',
  };

  useEffect(() => {
    const token = getToken();
    const headers: HeadersInit = { Authorization: `Bearer ${token}` };

    fetch(`${API_BASE}/topics`, { headers })
      .then(res => res.json())
      .then((topics: Array<{ id: number; name: string; category: string; description: string; difficulty: string }>) => {
        const grouped = new Map<string, CategoryItem>();
        topics.forEach((t, index) => {
          if (!grouped.has(t.category)) {
            grouped.set(t.category, {
              id: t.category,
              name: categoryNameMap[t.category] || t.category,
              topics: [],
            });
          }
          const cat = grouped.get(t.category)!;
          cat.topics.push({
            id: String(t.id),
            categoryId: t.category,
            name: t.name,
            description: t.description,
            level: t.difficulty.toLowerCase(),
            orderIndex: index,
          });
        });
        const cats = Array.from(grouped.values());
        setCategories(cats);
        if (cats.length > 0) setOpenCategories([cats[0].id]);
      })
      .catch(() => {});

    fetch(`${API_BASE}/progress`, { headers })
      .then(res => res.json())
      .then((data: string[]) => setCompletedTopics(data))
      .catch(() => {});
  }, []);

  const parseSections = (lesson: LessonData): LessonSection[] => {
    try {
      const parsed = JSON.parse(lesson.contentJson);
      return parsed.sections || [];
    } catch {
      return [];
    }
  };

  const loadLesson = useCallback(async (topic: TopicItem, lang: string, level: string) => {
    setIsLoadingLesson(true);
    setIsGeneratingLesson(false);
    const timeout = setTimeout(() => setIsGeneratingLesson(true), 2000);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/lessons/topic/${topic.id}?language=${encodeURIComponent(lang)}&level=${encodeURIComponent(level)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed');
      const lesson: LessonData = await res.json();
      setCurrentLesson(lesson);
      setCurrentSectionIndex(0);
      setRevealedHints({});
      setIsBookmarked(false);
    } catch {
      setCurrentLesson(null);
    } finally {
      clearTimeout(timeout);
      setIsLoadingLesson(false);
      setIsGeneratingLesson(false);
    }
  }, []);

  const handleTopicSelect = useCallback((topic: TopicItem) => {
    setSelectedTopic(topic);
    loadLesson(topic, selectedLanguage, selectedLevel);
  }, [selectedLanguage, selectedLevel, loadLesson]);

  const handleCategoryToggle = (categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handlePrevious = () => {
    setCurrentSectionIndex(prev => Math.max(0, prev - 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (!currentLesson) return;
    const sections = parseSections(currentLesson);
    setCurrentSectionIndex(prev => Math.min(sections.length - 1, prev + 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplete = async () => {
    if (!currentLesson || !selectedTopic) return;
    try {
      const token = getToken();
      await fetch(`${API_BASE}/progress/${currentLesson.id}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* silent */ }
    if (!completedTopics.includes(selectedTopic.id)) {
      setCompletedTopics(prev => [...prev, selectedTopic.id]);
    }
    setIsCompletionModalOpen(true);
  };

  const handleNextLesson = () => {
    setIsCompletionModalOpen(false);
    if (!selectedTopic) return;
    const cat = categories.find(c => c.topics.some(t => t.id === selectedTopic.id));
    if (!cat) return;
    const idx = cat.topics.findIndex(t => t.id === selectedTopic.id);
    if (idx < cat.topics.length - 1) {
      handleTopicSelect(cat.topics[idx + 1]);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleHintReveal = (sectionIndex: number) => {
    setRevealedHints(prev => ({
      ...prev,
      [sectionIndex]: (prev[sectionIndex] || 0) + 1,
    }));
  };

  const handleOpenInEditor = (prompt: string) => {
    navigate(`/practice?exercisePrompt=${encodeURIComponent(prompt)}&language=${encodeURIComponent(selectedLanguage)}`);
  };

  const filteredCategories = categories.map(cat => ({
    ...cat,
    topics: cat.topics.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.topics.length > 0);

  const totalTopics = categories.reduce((sum, c) => sum + c.topics.length, 0);
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0;

  const sections: LessonSection[] = currentLesson ? parseSections(currentLesson) : [];

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Left sidebar */}
      <div className="w-[260px] h-full flex flex-col bg-[#F9FAFB] border-r border-[#E5E7EB] shrink-0 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E7EB]">
          <h2 className="text-[13px] font-medium text-[#111827] mb-2">Courses</h2>
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-[#E5E7EB] rounded-md outline-none focus:border-[#534AB7] transition-colors"
          />
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredCategories.map(cat => (
            <div key={cat.id} className="mb-1">
              <button
                onClick={() => handleCategoryToggle(cat.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[12px] font-medium text-[#374151] hover:bg-[#F3F4F6] rounded cursor-pointer"
              >
                <span>{cat.name}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform ${openCategories.includes(cat.id) ? 'rotate-90' : ''}`}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              {openCategories.includes(cat.id) && (
                <div className="ml-2 mt-0.5">
                  {cat.topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicSelect(topic)}
                      className={`w-full text-left px-2 py-1.5 text-[12px] rounded cursor-pointer transition-colors flex items-center gap-1.5 ${
                        selectedTopic?.id === topic.id
                          ? 'bg-[#EEEDFE] text-[#534AB7] font-medium'
                          : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      {completedTopics.includes(topic.id) && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" className="shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span className="truncate">{topic.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[#6B7280]">Progress</span>
            <span className="text-[11px] text-[#6B7280]">{progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#534AB7] rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-12 bg-white border-b border-[#E5E7EB] px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {selectedTopic ? (
              <span className="text-[13px] font-medium text-[#111827]">{selectedTopic.name}</span>
            ) : (
              <span className="text-[13px] text-[#9CA3AF]">Select a topic to begin</span>
            )}
            {isGeneratingLesson && (
              <span className="text-[11px] text-[#534AB7] animate-pulse">Generating lesson...</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedLanguage}
              onChange={e => {
                setSelectedLanguage(e.target.value);
                if (selectedTopic) loadLesson(selectedTopic, e.target.value, selectedLevel);
              }}
              className="text-[12px] px-2 py-1 border border-[#E5E7EB] rounded bg-white cursor-pointer"
            >
              <option value="Java">Java</option>
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="C++">C++</option>
            </select>
            <select
              value={selectedLevel}
              onChange={e => {
                setSelectedLevel(e.target.value);
                if (selectedTopic) loadLesson(selectedTopic, selectedLanguage, e.target.value);
              }}
              className="text-[12px] px-2 py-1 border border-[#E5E7EB] rounded bg-white cursor-pointer"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <button
              onClick={() => setIsBookmarked(prev => !prev)}
              className="p-1.5 rounded hover:bg-[#F3F4F6] cursor-pointer"
              title="Bookmark"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? '#534AB7' : 'none'} stroke={isBookmarked ? '#534AB7' : '#6B7280'} strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
          {/* Empty state */}
          {!selectedTopic && !isLoadingLesson && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" className="mb-3">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
              <p className="text-[14px] font-medium text-[#6B7280]">Choose a topic to start learning</p>
              <p className="text-[12px] text-[#9CA3AF] mt-1">Select from the sidebar to load a lesson</p>
            </div>
          )}

          {/* Loading state */}
          {isLoadingLesson && (
            <div className="space-y-4">
              <div className="h-24 bg-[#F3F4F6] rounded-lg animate-pulse" />
              <div className="h-32 bg-[#F3F4F6] rounded-lg animate-pulse" />
              <div className="h-20 bg-[#F3F4F6] rounded-lg animate-pulse" />
            </div>
          )}

          {/* Lesson content */}
          {currentLesson && !isLoadingLesson && (
            <div className="space-y-4">
              {/* Lesson header */}
              <div className="mb-4">
                <h1 className="text-[18px] font-semibold text-[#111827]">{currentLesson.title}</h1>
                <p className="text-[13px] text-[#6B7280] mt-1">{currentLesson.summary}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-[#9CA3AF]">{currentLesson.estimatedMinutes} min</span>
                  <span className="text-[11px] text-[#9CA3AF]">{currentLesson.language}</span>
                  <span className="text-[11px] px-1.5 py-0.5 bg-[#F3F4F6] rounded text-[#6B7280] capitalize">{currentLesson.level}</span>
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-1 mb-4">
                {sections.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSectionIndex(i)}
                    className={`h-1.5 flex-1 rounded-full cursor-pointer transition-colors ${
                      i === currentSectionIndex ? 'bg-[#534AB7]' : i < currentSectionIndex ? 'bg-[#A5B4FC]' : 'bg-[#E5E7EB]'
                    }`}
                  />
                ))}
              </div>

              {/* Current section */}
              {sections[currentSectionIndex] && (
                <SectionRenderer
                  section={sections[currentSectionIndex]}
                  sectionIndex={currentSectionIndex}
                  revealedHints={revealedHints}
                  onCopyCode={handleCopyCode}
                  onHintReveal={handleHintReveal}
                  onOpenInEditor={handleOpenInEditor}
                />
              )}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        {currentLesson && !isLoadingLesson && (
          <div className="h-[52px] bg-white border-t border-[#E5E7EB] px-5 flex items-center justify-between shrink-0">
            <button
              onClick={handlePrevious}
              disabled={currentSectionIndex === 0}
              className="px-3 py-1.5 text-[12px] font-medium text-[#374151] border border-[#E5E7EB] rounded-md hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span className="text-[11px] text-[#9CA3AF]">
              {currentSectionIndex + 1} / {sections.length}
            </span>
            {currentSectionIndex < sections.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-3 py-1.5 text-[12px] font-medium text-white bg-[#534AB7] rounded-md hover:bg-[#4338CA] cursor-pointer"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-3 py-1.5 text-[12px] font-medium text-white bg-[#10B981] rounded-md hover:bg-[#059669] cursor-pointer"
              >
                Complete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Completion modal */}
      {isCompletionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCompletionModalOpen(false)} />
          <div className="relative w-[360px] bg-white rounded-xl p-6 shadow-xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#D1FAE5] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-[16px] font-semibold text-[#111827] mb-1">Lesson Complete!</h3>
            <p className="text-[13px] text-[#6B7280] mb-4">Great work finishing this lesson.</p>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAEEDA] rounded-full mb-5">
              <span className="text-[12px] font-medium text-[#854F0B]">+25 XP</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsCompletionModalOpen(false)}
                className="flex-1 px-3 py-2 text-[12px] font-medium border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleNextLesson}
                className="flex-1 px-3 py-2 text-[12px] font-medium text-white bg-[#534AB7] rounded-lg hover:bg-[#4338CA] cursor-pointer"
              >
                Next Lesson
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionRenderer({
  section,
  sectionIndex,
  revealedHints,
  onCopyCode,
  onHintReveal,
  onOpenInEditor,
}: {
  section: LessonSection;
  sectionIndex: number;
  revealedHints: Record<number, number>;
  onCopyCode: (code: string) => void;
  onHintReveal: (sectionIndex: number) => void;
  onOpenInEditor: (prompt: string) => void;
}) {
  if (section.type === 'explanation') {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
        <h3 className="text-[14px] font-medium text-[#111827] mb-2">{section.title}</h3>
        <p className="text-[13px] text-[#374151] leading-relaxed whitespace-pre-wrap">{section.content}</p>
      </div>
    );
  }

  if (section.type === 'example') {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
        <h3 className="text-[14px] font-medium text-[#111827] mb-2">{section.title}</h3>
        {section.content && (
          <p className="text-[13px] text-[#374151] leading-relaxed mb-3">{section.content}</p>
        )}
        {section.code && (
          <div className="relative bg-[#1E1E2E] rounded-lg p-3">
            <button
              onClick={() => onCopyCode(section.code!)}
              className="absolute top-2 right-2 p-1 rounded hover:bg-white/10 cursor-pointer"
              title="Copy code"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A6E3A1" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </button>
            <pre className="font-mono text-[12px] text-[#A6E3A1] overflow-x-auto whitespace-pre">{section.code}</pre>
          </div>
        )}
      </div>
    );
  }

  if (section.type === 'tip') {
    return (
      <div className="bg-[#FAEEDA] border-l-[3px] border-l-[#854F0B] rounded-r-lg p-3">
        <h3 className="text-[13px] font-medium text-[#854F0B] mb-1">{section.title}</h3>
        <p className="text-[12px] text-[#78350F] leading-relaxed">{section.content}</p>
      </div>
    );
  }

  if (section.type === 'exercise') {
    const hintsRevealed = revealedHints[sectionIndex] || 0;
    const hints = section.hints || [];
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
        <h3 className="text-[14px] font-medium text-[#111827] mb-2">{section.title}</h3>
        {section.prompt && (
          <p className="text-[13px] text-[#374151] leading-relaxed mb-3">{section.prompt}</p>
        )}
        {hints.slice(0, hintsRevealed).map((hint, i) => (
          <div key={i} className="mb-2 px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-[12px] text-[#374151]">
            <span className="font-medium text-[#6B7280]">Hint {i + 1}:</span> {hint}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => section.prompt && onOpenInEditor(section.prompt)}
            className="px-3 py-1.5 text-[12px] font-medium text-white bg-[#534AB7] rounded-md hover:bg-[#4338CA] cursor-pointer"
          >
            Open in editor
          </button>
          {hintsRevealed < hints.length && (
            <button
              onClick={() => onHintReveal(sectionIndex)}
              className="px-3 py-1.5 text-[12px] font-medium text-[#534AB7] border border-[#534AB7] rounded-md hover:bg-[#EEEDFE] cursor-pointer"
            >
              Show hint
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
