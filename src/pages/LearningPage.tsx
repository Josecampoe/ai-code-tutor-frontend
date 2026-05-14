import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCachedLesson, setCachedLesson } from '../utils/lessonCache';

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

const LANGUAGE_OPTIONS = ['Java', 'Python', 'JavaScript', 'TypeScript', 'C++', 'Kotlin'];

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
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [pendingTopic, setPendingTopic] = useState<TopicItem | null>(null);

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
    const cached = getCachedLesson(topic.id, lang, level);
    if (cached) {
      setCurrentLesson(cached as LessonData);
      setCurrentSectionIndex(0);
      setRevealedHints({});
      setIsBookmarked(false);
      return;
    }

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
      setCachedLesson(topic.id, lang, level, lesson);
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
    if (topic.categoryId === 'LANGUAGE') {
      const lang = topic.name.replace(/\s+Basics$/i, '').replace(/\s+Advanced$/i, '').replace(/\s+Intermediate$/i, '').trim();
      setSelectedLanguage(lang);
      setSelectedTopic(topic);
      loadLesson(topic, lang, selectedLevel);
    } else {
      setPendingTopic(topic);
      setIsLanguageModalOpen(true);
    }
  }, [selectedLevel, loadLesson]);

  const handleLanguageModalConfirm = useCallback(() => {
    setIsLanguageModalOpen(false);
    if (pendingTopic) {
      setSelectedTopic(pendingTopic);
      loadLesson(pendingTopic, selectedLanguage, selectedLevel);
      setPendingTopic(null);
    }
  }, [pendingTopic, selectedLanguage, selectedLevel, loadLesson]);

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLanguageModalOpen) {
        setIsLanguageModalOpen(false);
        setPendingTopic(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isLanguageModalOpen]);

  const filteredCategories = categories.map(cat => ({
    ...cat,
    topics: cat.topics.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.topics.length > 0);

  const totalTopics = categories.reduce((sum, c) => sum + c.topics.length, 0);
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0;

  const sections: LessonSection[] = currentLesson ? parseSections(currentLesson) : [];

  const isLanguageTopic = selectedTopic?.categoryId === 'LANGUAGE';


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
            {selectedTopic && !isLanguageTopic && (
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-[#374151] px-2 py-1 bg-[#F3F4F6] rounded-full">
                  Examples in: {selectedLanguage}
                </span>
                <button
                  onClick={() => {
                    setPendingTopic(selectedTopic);
                    setIsLanguageModalOpen(true);
                  }}
                  className="p-1 rounded hover:bg-[#F3F4F6] cursor-pointer"
                  title="Change language"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10" />
                    <polyline points="23 20 23 14 17 14" />
                    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                  </svg>
                </button>
              </div>
            )}
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