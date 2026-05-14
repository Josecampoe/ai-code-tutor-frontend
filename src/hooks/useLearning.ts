import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category, Topic, Lesson, Level } from '../types/learning.types';
import { parseSections } from '../types/learning.types';
import { getCachedLesson, setCachedLesson } from '../utils/lessonCache';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';
const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];

const CATEGORY_NAMES: Record<string, string> = {
  LANGUAGE: 'Languages', DATA_STRUCTURE: 'Data Structures',
  DESIGN_PATTERN: 'Design Patterns', OOP: 'OOP', ALGORITHM: 'Algorithms',
};

function loadLevels(topicId: string): Level[] {
  try { return JSON.parse(localStorage.getItem(`completed_levels_${topicId}`) ?? '[]'); } catch { return []; }
}
function saveLevels(topicId: string, levels: Level[]): void {
  try { localStorage.setItem(`completed_levels_${topicId}`, JSON.stringify(levels)); } catch {}
}

export function useLearning() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('Java');
  const [selectedLevel, setSelectedLevel] = useState<Level>('beginner');
  const [completedLevels, setCompletedLevels] = useState<Record<string, Level[]>>({});
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [pendingTopic, setPendingTopic] = useState<Topic | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const token = () => localStorage.getItem('codetutor_token');

  useEffect(() => {
    fetch(`${API_BASE}/topics`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then((data: Array<{ id: number; name: string; category: string; description: string; difficulty: string }>) => {
        const map = new Map<string, Category>();
        data.forEach((t, i) => {
          if (!map.has(t.category)) map.set(t.category, { id: t.category, name: CATEGORY_NAMES[t.category] ?? t.category, icon: '', topicCount: 0, topics: [] });
          const cat = map.get(t.category)!;
          cat.topics.push({ id: String(t.id), categoryId: t.category, name: t.name, description: t.description, level: 'beginner', orderIndex: i });
          cat.topicCount = cat.topics.length;
        });
        const cats = Array.from(map.values());
        setCategories(cats);
        if (cats.length > 0) setOpenCategories([cats[0].id]);
      })
      .catch(() => {});
  }, []);

  const loadLesson = useCallback(async (topic: Topic, lang: string, level: Level) => {
    const cached = getCachedLesson(topic.id, lang, level);
    if (cached) { setCurrentLesson(cached); setCurrentSectionIndex(0); setRevealedHints({}); setIsBookmarked(false); return; }
    setIsLoadingLesson(true);
    const t = setTimeout(() => setIsGeneratingLesson(true), 1500);
    try {
      const res = await fetch(`${API_BASE}/lessons/topic/${topic.id}?language=${encodeURIComponent(lang)}&level=${encodeURIComponent(level)}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error();
      const lesson: Lesson = await res.json();
      setCachedLesson(topic.id, lang, level, lesson);
      setCurrentLesson(lesson); setCurrentSectionIndex(0); setRevealedHints({}); setIsBookmarked(false);
    } catch { setCurrentLesson(null); }
    finally { clearTimeout(t); setIsLoadingLesson(false); setIsGeneratingLesson(false); }
  }, []);

  const selectTopic = useCallback((topic: Topic, lang: string) => {
    const done = loadLevels(topic.id);
    setCompletedLevels(prev => ({ ...prev, [topic.id]: done }));
    const level = LEVELS.find(l => !done.includes(l)) ?? 'advanced';
    setSelectedLevel(level);
    setSelectedTopic(topic);
    loadLesson(topic, lang, level);
  }, [loadLesson]);

  const handleTopicSelect = useCallback((topic: Topic) => {
    if (topic.categoryId === 'LANGUAGE') {
      const lang = topic.name.replace(/\s+(Basics|Advanced|Intermediate)$/i, '').trim();
      setSelectedLanguage(lang);
      selectTopic(topic, lang);
    } else {
      setPendingTopic(topic);
      setIsLanguageModalOpen(true);
    }
  }, [selectTopic]);

  const handleLanguageModalConfirm = useCallback((lang: string) => {
    setSelectedLanguage(lang);
    setIsLanguageModalOpen(false);
    if (pendingTopic) { selectTopic(pendingTopic, lang); setPendingTopic(null); }
  }, [pendingTopic, selectTopic]);

  const handleLanguageModalCancel = useCallback(() => { setIsLanguageModalOpen(false); setPendingTopic(null); }, []);

  const handleCategoryToggle = useCallback((id: string) => {
    setOpenCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentSectionIndex(p => Math.max(0, p - 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNext = useCallback(() => {
    if (!currentLesson) return;
    const max = parseSections(currentLesson).length - 1;
    setCurrentSectionIndex(p => Math.min(max, p + 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentLesson]);

  const handleComplete = useCallback(async () => {
    if (!currentLesson || !selectedTopic) return;
    try { await fetch(`${API_BASE}/progress/${currentLesson.id}/complete`, { method: 'POST', headers: { Authorization: `Bearer ${token()}` } }); } catch {}
    const prev = completedLevels[selectedTopic.id] ?? [];
    const next = prev.includes(selectedLevel) ? prev : [...prev, selectedLevel];
    saveLevels(selectedTopic.id, next);
    setCompletedLevels(p => ({ ...p, [selectedTopic.id]: next }));
    const idx = LEVELS.indexOf(selectedLevel);
    if (idx < LEVELS.length - 1) {
      const nextLevel = LEVELS[idx + 1];
      setToast(`Level complete! Now: ${nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)}`);
      setTimeout(() => setToast(null), 3000);
      setSelectedLevel(nextLevel);
      loadLesson(selectedTopic, selectedLanguage, nextLevel);
    } else {
      setIsCompletionModalOpen(true);
    }
  }, [currentLesson, selectedTopic, selectedLevel, selectedLanguage, completedLevels, loadLesson]);

  const handleLevelChange = useCallback((level: Level) => {
    if (!selectedTopic) return;
    const done = completedLevels[selectedTopic.id] ?? [];
    const cur = LEVELS.findIndex(l => !done.includes(l));
    const effective = cur === -1 ? LEVELS.length - 1 : cur;
    if (LEVELS.indexOf(level) > effective) return;
    setSelectedLevel(level);
    loadLesson(selectedTopic, selectedLanguage, level);
  }, [selectedTopic, selectedLanguage, completedLevels, loadLesson]);

  const handleNextLesson = useCallback(() => {
    setIsCompletionModalOpen(false);
    if (!selectedTopic) return;
    const cat = categories.find(c => c.topics.some(t => t.id === selectedTopic.id));
    if (!cat) return;
    const idx = cat.topics.findIndex(t => t.id === selectedTopic.id);
    for (let i = idx + 1; i < cat.topics.length; i++) {
      if ((loadLevels(cat.topics[i].id)).length < 3) { handleTopicSelect(cat.topics[i]); return; }
    }
    const ci = categories.indexOf(cat);
    for (let c = ci + 1; c < categories.length; c++) {
      if (categories[c].topics.length > 0) { handleTopicSelect(categories[c].topics[0]); return; }
    }
  }, [selectedTopic, categories, handleTopicSelect]);

  const sections = currentLesson ? parseSections(currentLesson) : [];
  const completedTopics = Object.entries(completedLevels).filter(([, l]) => l.length >= 3).map(([id]) => id);
  const inProgressTopics = Object.entries(completedLevels).filter(([, l]) => l.length > 0 && l.length < 3).map(([id]) => id);

  return {
    categories, selectedTopic, currentLesson, currentSectionIndex, selectedLanguage,
    selectedLevel, completedLevels, completedTopics, inProgressTopics, openCategories,
    isLoadingLesson, isGeneratingLesson, isCompletionModalOpen, isBookmarked,
    revealedHints, searchQuery, isLanguageModalOpen, pendingTopic, toast, sections, scrollRef,
    handleTopicSelect, handleLanguageModalConfirm, handleLanguageModalCancel, handleCategoryToggle,
    handlePrevious, handleNext, handleComplete, handleNextLesson, handleLevelChange,
    handleBookmarkToggle: () => setIsBookmarked(p => !p),
    handleHintReveal: (i: number) => setRevealedHints(p => ({ ...p, [i]: (p[i] ?? 0) + 1 })),
    handleOpenInEditor: (prompt: string) => navigate(`/practice?exercisePrompt=${encodeURIComponent(prompt)}&language=${encodeURIComponent(selectedLanguage)}`),
    handleSearchChange: (q: string) => setSearchQuery(q),
    handleStepClick: (i: number) => setCurrentSectionIndex(i),
    setIsCompletionModalOpen,
  };
}
