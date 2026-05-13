import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/learning/Sidebar';
import { LessonHero } from '../components/learning/LessonHero';
import { StepProgress } from '../components/learning/StepProgress';
import { SectionCard } from '../components/learning/SectionCard';
import { BottomNav } from '../components/learning/BottomNav';
import { CompletionModal } from '../components/learning/CompletionModal';
import type { Category, Topic, Lesson } from '../types/learning.types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

function getToken() {
  return localStorage.getItem('codetutor_token') ?? '';
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    DATA_STRUCTURE: 'Data Structures',
    DESIGN_PATTERN: 'Design Patterns',
    ALGORITHM: 'Algorithms',
  };
  return names[category] ?? category;
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    DATA_STRUCTURE: 'binary-tree',
    DESIGN_PATTERN: 'puzzle',
    ALGORITHM: 'arrow-shuffle',
  };
  return icons[category] ?? 'code';
}

export function LearningPage() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Main state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('Java');
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  // Local state
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load categories and progress on mount
  useEffect(() => {
    // Load topics and group by category
    apiFetch<Array<{ id: number; name: string; category: string; description: string; difficulty: string }>>('/topics')
      .then(topics => {
        // Group topics by category string
        const categoryMap = new Map<string, Category>();
        topics.forEach(t => {
          if (!categoryMap.has(t.category)) {
            categoryMap.set(t.category, {
              id: t.category,
              name: formatCategoryName(t.category),
              icon: getCategoryIcon(t.category),
              topicCount: 0,
              topics: [],
            });
          }
          const cat = categoryMap.get(t.category)!;
          cat.topics.push({
            id: String(t.id),
            categoryId: t.category,
            name: t.name,
            description: t.description,
            level: t.difficulty.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
            orderIndex: cat.topics.length,
          });
          cat.topicCount = cat.topics.length;
        });
        const cats = Array.from(categoryMap.values());
        setCategories(cats);
        if (cats.length > 0) setOpenCategories([cats[0].id]);
      })
      .catch(() => setError('Failed to load topics'));

    apiFetch<string[]>('/progress')
      .then(setCompletedTopics)
      .catch(() => {});
  }, []);

  // Load lesson for a topic
  const loadLesson = useCallback(async (topic: Topic, lang: string, level: string) => {
    setIsLoadingLesson(true);
    setIsGeneratingLesson(false);
    setError(null);

    const timeout = setTimeout(() => setIsGeneratingLesson(true), 1500);

    try {
      const lesson = await apiFetch<Lesson>(
        `/lessons/topic/${topic.id}?language=${encodeURIComponent(lang)}&level=${encodeURIComponent(level)}`
      );
      setCurrentLesson(lesson);
    } catch {
      setError('Failed to load lesson. Please try again.');
    } finally {
      clearTimeout(timeout);
      setIsLoadingLesson(false);
      setIsGeneratingLesson(false);
    }
  }, []);

  // Handlers
  const handleTopicSelect = useCallback((topic: Topic) => {
    if (selectedTopic?.id === topic.id && currentLesson?.language === selectedLanguage && currentLesson?.level === selectedLevel) return;
    setSelectedTopic(topic);
    setCurrentSectionIndex(0);
    setRevealedHints({});
    setIsBookmarked(false);
    loadLesson(topic, selectedLanguage, selectedLevel);
  }, [selectedTopic, currentLesson, selectedLanguage, selectedLevel, loadLesson]);

  const handleLanguageChange = useCallback((lang: string) => {
    setSelectedLanguage(lang);
    if (selectedTopic) {
      setCurrentSectionIndex(0);
      setRevealedHints({});
      loadLesson(selectedTopic, lang, selectedLevel);
    }
  }, [selectedTopic, selectedLevel, loadLesson]);

  const handleLevelChange = useCallback((level: string) => {
    const lvl = level as 'beginner' | 'intermediate' | 'advanced';
    setSelectedLevel(lvl);
    if (selectedTopic) {
      setCurrentSectionIndex(0);
      setRevealedHints({});
      loadLesson(selectedTopic, selectedLanguage, lvl);
    }
  }, [selectedTopic, selectedLanguage, loadLesson]);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  }, []);

  const handlePrevious = () => {
    setCurrentSectionIndex(prev => Math.max(0, prev - 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (currentLesson) {
      setCurrentSectionIndex(prev => Math.min(currentLesson.sections.length - 1, prev + 1));
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = async () => {
    if (!currentLesson) return;
    try {
      await apiFetch(`/progress/${currentLesson.id}/complete`, { method: 'POST' });
    } catch { /* ignore */ }
    if (selectedTopic && !completedTopics.includes(selectedTopic.id)) {
      setCompletedTopics(prev => [...prev, selectedTopic.id]);
    }
    setIsCompletionModalOpen(true);
  };

  const handleBookmarkToggle = async () => {
    setIsBookmarked(prev => !prev);
    if (currentLesson) {
      try { await apiFetch(`/progress/${currentLesson.id}/bookmark`, { method: 'POST' }); } catch { /* ignore */ }
    }
  };

  const handleHintReveal = (sectionIndex: number, currentCount: number) => {
    setRevealedHints(prev => ({ ...prev, [sectionIndex]: currentCount + 1 }));
  };

  const handleOpenInEditor = (prompt: string, language: string) => {
    navigate(`/practice?exercisePrompt=${encodeURIComponent(prompt)}&language=${encodeURIComponent(language)}`);
  };

  const handlePracticeClick = () => {
    if (selectedTopic) {
      navigate(`/practice?topic=${encodeURIComponent(selectedTopic.name)}&language=${encodeURIComponent(selectedLanguage)}`);
    }
  };

  const handleNextLesson = () => {
    if (!selectedTopic) return;
    const cat = categories.find(c => c.topics.some(t => t.id === selectedTopic.id));
    if (!cat) return;
    const idx = cat.topics.findIndex(t => t.id === selectedTopic.id);
    if (idx < cat.topics.length - 1) {
      handleTopicSelect(cat.topics[idx + 1]);
    } else {
      const catIdx = categories.indexOf(cat);
      const nextCat = categories[catIdx + 1];
      if (nextCat && nextCat.topics.length > 0) {
        handleTopicSelect(nextCat.topics[0]);
      }
    }
  };

  const handleStartPythonBasics = () => {
    const allTopics = categories.flatMap(c => c.topics);
    const pythonTopic = allTopics.find(t => t.name.toLowerCase().includes('python'));
    if (pythonTopic) handleTopicSelect(pythonTopic);
    else if (allTopics.length > 0) handleTopicSelect(allTopics[0]);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Sidebar */}
      <Sidebar
        categories={categories}
        selectedTopic={selectedTopic}
        completedTopics={completedTopics}
        openCategories={openCategories}
        searchQuery={searchQuery}
        onTopicSelect={handleTopicSelect}
        onCategoryToggle={handleCategoryToggle}
        onSearchChange={setSearchQuery}
        onHomeClick={() => navigate('/')}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Lesson Hero */}
        {currentLesson && selectedTopic && (
          <LessonHero
            lesson={currentLesson}
            selectedLanguage={selectedLanguage}
            selectedLevel={selectedLevel}
            isBookmarked={isBookmarked}
            isGeneratingLesson={isGeneratingLesson}
            onLanguageChange={handleLanguageChange}
            onLevelChange={handleLevelChange}
            onBookmarkToggle={handleBookmarkToggle}
            onPracticeClick={handlePracticeClick}
          />
        )}

        {/* Error banner */}
        {error && (
          <div className="mx-5 mt-3 flex items-center gap-2 bg-[#FCEBEB] border border-[#F09595] rounded-lg px-3.5 py-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" className="shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-[12px] text-[#991B1B] flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-[#DC2626] hover:text-[#991B1B] cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {/* Empty state */}
          {!selectedTopic && !isLoadingLesson && (
            <div className="h-full flex flex-col items-center justify-center text-center px-5">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="1" className="mb-4">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              </svg>
              <p className="text-[15px] font-medium text-[#9CA3AF]">Choose a topic to start learning</p>
              <p className="text-[13px] text-[#9CA3AF] mt-1">Select a topic from the sidebar to load your first lesson.</p>
              <button
                onClick={handleStartPythonBasics}
                className="mt-4 px-4 py-2 border border-[#534AB7] text-[#534AB7] rounded-lg text-[13px] font-medium hover:bg-[#EEEDFE] transition-colors cursor-pointer"
              >
                Start with Python Basics
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoadingLesson && (
            <div className="p-5 space-y-3">
              <div className="h-32 bg-[#F9FAFB] rounded-xl animate-pulse" />
              <div className="h-32 bg-[#F9FAFB] rounded-xl animate-pulse" />
              <div className="h-32 bg-[#F9FAFB] rounded-xl animate-pulse" />
            </div>
          )}

          {/* Lesson content */}
          {currentLesson && !isLoadingLesson && (
            <div className="p-5">
              <StepProgress
                sections={currentLesson.sections}
                currentIndex={currentSectionIndex}
                onStepClick={(i) => { setCurrentSectionIndex(i); scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
              {currentLesson.sections.map((section, i) => (
                <SectionCard
                  key={i}
                  section={section}
                  index={i}
                  currentIndex={currentSectionIndex}
                  onHintReveal={handleHintReveal}
                  revealedHints={revealedHints}
                  onOpenInEditor={handleOpenInEditor}
                  language={selectedLanguage}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        {currentLesson && !isLoadingLesson && (
          <BottomNav
            currentIndex={currentSectionIndex}
            totalSections={currentLesson.sections.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onComplete={handleComplete}
          />
        )}
      </div>

      {/* Completion modal */}
      <CompletionModal
        topicName={selectedTopic?.name ?? ''}
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        onPractice={handlePracticeClick}
        onNextLesson={handleNextLesson}
      />
    </div>
  );
}
