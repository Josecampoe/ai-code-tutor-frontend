import { useState } from 'react';
import { ChevronRight, ChevronDown, BookOpen, Layers, Zap, Trophy } from 'lucide-react';
import { getTopicsByCategory, getProgress, getErrorMessage } from '../../services/api';
import type { LearnTopic, LearnCategory, Language, UserProgress } from '../../types';

const SECTIONS: { category: LearnCategory; label: string; icon: React.ReactNode }[] = [
  { category: 'DATA_STRUCTURE', label: 'Estructuras de Datos', icon: <Layers className="w-3.5 h-3.5" /> },
  { category: 'DESIGN_PATTERN', label: 'Patrones de Diseño', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { category: 'ALGORITHM', label: 'Algoritmos', icon: <Zap className="w-3.5 h-3.5" /> },
];

const LANGUAGES: { value: Language; label: string; activeStyle: string }[] = [
  { value: 'javascript', label: 'JS', activeStyle: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'typescript', label: 'TS', activeStyle: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'python', label: 'PY', activeStyle: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'java', label: 'JV', activeStyle: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
];

const DIFFICULTY_DOT: Record<string, string> = {
  BEGINNER: 'bg-green-400',
  INTERMEDIATE: 'bg-orange-400',
  ADVANCED: 'bg-red-400',
};

interface Props {
  userId: number;
  onSelectTopic: (topic: LearnTopic, language: Language) => void;
  activeTopicId: number | null;
  selectedLang: Language;
  onLangChange: (lang: Language) => void;
}

export function LearnSidebar({ userId, onSelectTopic, activeTopicId, selectedLang, onLangChange }: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [topicsByCategory, setTopicsByCategory] = useState<Record<string, LearnTopic[]>>({});
  const [loadingCategories, setLoadingCategories] = useState<Record<string, boolean>>({});
  const [categoryErrors, setCategoryErrors] = useState<Record<string, string>>({});
  const [progressList, setProgressList] = useState<UserProgress[]>([]);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);

  const loadStudentProgress = async () => {
    if (hasLoadedProgress) return;
    try {
      const progressData = await getProgress(userId);
      setProgressList(progressData);
      setHasLoadedProgress(true);
    } catch {
      // Progress is optional — silently ignore
    }
  };

  const toggleSection = async (category: LearnCategory) => {
    const isSectionOpen = openSections[category];
    setOpenSections(previous => ({ ...previous, [category]: !isSectionOpen }));

    if (!isSectionOpen && !topicsByCategory[category]) {
      setLoadingCategories(previous => ({ ...previous, [category]: true }));
      try {
        const fetchedTopics = await getTopicsByCategory(category);
        setTopicsByCategory(previous => ({ ...previous, [category]: fetchedTopics }));
        await loadStudentProgress();
      } catch (err) {
        setCategoryErrors(previous => ({ ...previous, [category]: getErrorMessage(err) }));
      } finally {
        setLoadingCategories(previous => ({ ...previous, [category]: false }));
      }
    }
  };

  const getTopicProgress = (topicId: number) =>
    progressList.find(progressItem => progressItem.topicId === topicId);

  return (
    <div className="flex flex-col h-full text-[#cccccc] overflow-hidden">

      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#1e1e1e] shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-2.5">Aprende</p>

        {/* Language selector */}
        <div className="flex gap-1">
          {LANGUAGES.map(lang => (
            <button
              key={lang.value}
              onClick={() => onLangChange(lang.value)}
              className={`flex-1 py-1 text-[10px] font-mono rounded border transition-all cursor-pointer
                ${selectedLang === lang.value
                  ? lang.activeStyle
                  : 'bg-transparent text-[#555] border-[#3c3c3c] hover:text-[#858585] hover:border-[#555]'
                }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty legend */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-[#1e1e1e] shrink-0">
        {[['BEGINNER', 'Básico'], ['INTERMEDIATE', 'Medio'], ['ADVANCED', 'Avanzado']].map(([level, label]) => (
          <div key={level} className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_DOT[level]}`} />
            <span className="text-[9px] text-[#555]">{label}</span>
          </div>
        ))}
      </div>

      {/* Topic sections */}
      <div className="flex-1 overflow-y-auto">
        {SECTIONS.map(({ category, label, icon }) => (
          <div key={category}>

            {/* Section header */}
            <button
              onClick={() => toggleSection(category)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#2a2d2e] transition-colors cursor-pointer"
            >
              {openSections[category]
                ? <ChevronDown className="w-3 h-3 text-[#858585] shrink-0" />
                : <ChevronRight className="w-3 h-3 text-[#858585] shrink-0" />}
              <span className="text-[#858585]">{icon}</span>
              <span className="font-medium text-[#cccccc]">{label}</span>
              {loadingCategories[category] && (
                <span className="ml-auto text-[10px] text-[#555] animate-pulse">cargando...</span>
              )}
            </button>

            {/* Topic list */}
            {openSections[category] && (
              <div className="pl-2 pb-1">
                {categoryErrors[category] && (
                  <p className="text-xs text-[#f48771] px-3 py-1">{categoryErrors[category]}</p>
                )}

                {(topicsByCategory[category] ?? []).map(topic => {
                  const topicProgress = getTopicProgress(topic.id);
                  const isActive = activeTopicId === topic.id;

                  return (
                    <button
                      key={topic.id}
                      onClick={() => onSelectTopic(topic, selectedLang)}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer rounded-sm
                        ${isActive ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-[#cccccc]'}`}
                    >
                      <div className="flex items-center gap-2">
                        {/* Difficulty dot */}
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${DIFFICULTY_DOT[topic.difficulty] ?? 'bg-[#555]'}`} />

                        <span className="truncate flex-1">{topic.name}</span>

                        {/* Completed count */}
                        {topicProgress && topicProgress.completedExercises > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-[#4ec9b0] shrink-0">
                            <Trophy className="w-2.5 h-2.5" />
                            {topicProgress.completedExercises}
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      {topicProgress && topicProgress.totalExercises > 0 && (
                        <div className="mt-1.5 h-0.5 bg-[#3c3c3c] rounded-full overflow-hidden ml-3.5">
                          <div
                            className="h-full bg-[#4ec9b0] transition-all duration-500"
                            style={{
                              width: `${Math.round((topicProgress.completedExercises / topicProgress.totalExercises) * 100)}%`
                            }}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
