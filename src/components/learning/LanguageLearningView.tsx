import { useState, useEffect, useRef, useCallback } from 'react';
import { SectionCard } from './SectionCard';
import { BottomNav } from './BottomNav';
import type { Topic, Lesson, LessonSection } from '../../types/learning.types';

interface Props {
  topic: Topic;
  selectedLevel: string;
  onPracticeClick: () => void;
  completedLessons: number[];
}

const TRACK_LESSONS = [
  { number: 1, title: 'Introduction' },
  { number: 2, title: 'Variables & Types' },
  { number: 3, title: 'Operators' },
  { number: 4, title: 'Control Flow' },
  { number: 5, title: 'Loops' },
  { number: 6, title: 'Functions' },
  { number: 7, title: 'Arrays' },
  { number: 8, title: 'Strings' },
  { number: 9, title: 'OOP Basics' },
  { number: 10, title: 'Mini Project' },
];

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

function getToken() { return localStorage.getItem('codetutor_token') ?? ''; }

async function fetchLesson(topicId: string, language: string, level: string, trackLesson: number): Promise<Lesson | null> {
  try {
    const res = await fetch(
      `${API_BASE}/lessons/topic/${topicId}?language=${encodeURIComponent(language)}&level=${encodeURIComponent(level)}&trackLesson=${trackLesson}`,
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export function LanguageLearningView({ topic, selectedLevel, onPracticeClick, completedLessons }: Props) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sections, setSections] = useState<LessonSection[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<number, number>>({});
  const [localCompleted, setLocalCompleted] = useState<number[]>(completedLessons);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Determine the language name from topic
  const languageName = topic.name.replace(' Basics', '').trim();

  // Find current active lesson (first non-completed)
  useEffect(() => {
    const firstIncomplete = TRACK_LESSONS.findIndex(l => !localCompleted.includes(l.number));
    if (firstIncomplete >= 0) setCurrentTrackIndex(firstIncomplete);
  }, []);

  // Load lesson when track index changes
  const loadCurrentLesson = useCallback(async () => {
    setIsLoading(true);
    setCurrentSectionIndex(0);
    setRevealedHints({});
    const trackLesson = TRACK_LESSONS[currentTrackIndex];
    const lesson = await fetchLesson(topic.id, languageName, selectedLevel, trackLesson.number);
    if (lesson) {
      let parsed: LessonSection[] = [];
      try {
        const json = JSON.parse(lesson.contentJson ?? '{}');
        parsed = json.sections ?? [];
      } catch { parsed = []; }
      setCurrentLesson(lesson);
      setSections(parsed);
    } else {
      setCurrentLesson(null);
      setSections([]);
    }
    setIsLoading(false);
  }, [currentTrackIndex, topic.id, languageName, selectedLevel]);

  useEffect(() => { loadCurrentLesson(); }, [loadCurrentLesson]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const handleTrackClick = (index: number) => {
    const lessonNum = TRACK_LESSONS[index].number;
    const isCompleted = localCompleted.includes(lessonNum);
    const isCurrent = index === currentTrackIndex;
    if (isCompleted || isCurrent) {
      setCurrentTrackIndex(index);
    }
  };

  const handlePrevious = () => {
    setCurrentSectionIndex(prev => Math.max(0, prev - 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (currentLesson) {
      setCurrentSectionIndex(prev => Math.min(sections.length - 1, prev + 1));
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = () => {
    const lessonNum = TRACK_LESSONS[currentTrackIndex].number;
    if (!localCompleted.includes(lessonNum)) {
      setLocalCompleted(prev => [...prev, lessonNum]);
    }

    // Check if entire track is done
    const allDone = TRACK_LESSONS.every(l => localCompleted.includes(l.number) || l.number === lessonNum);
    if (allDone) {
      setToast(`Congratulations! You completed the entire ${languageName} track!`);
    } else {
      // Move to next lesson
      const nextIndex = currentTrackIndex + 1;
      if (nextIndex < TRACK_LESSONS.length) {
        setToast(`Lesson complete! Next: ${TRACK_LESSONS[nextIndex].title}`);
        setCurrentTrackIndex(nextIndex);
      }
    }
  };

  const handleHintReveal = (sectionIndex: number, currentCount: number) => {
    setRevealedHints(prev => ({ ...prev, [sectionIndex]: currentCount + 1 }));
  };

  const handleOpenInEditor = () => { onPracticeClick(); };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-[#111827] text-white text-[12px] px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="h-12 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-medium text-[#111827]">{languageName}</h2>
          <span className="text-[11px] bg-[#EEEDFE] text-[#3C3489] px-2 py-0.5 rounded-full font-medium">{selectedLevel}</span>
          <span className="text-[11px] text-[#9CA3AF]">{localCompleted.length}/{TRACK_LESSONS.length} lessons</span>
        </div>
        <button
          onClick={onPracticeClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#534AB7] text-white rounded-lg text-[12px] font-medium hover:opacity-90 cursor-pointer transition-opacity"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Practice in editor
        </button>
      </div>

      {/* Progress Track */}
      <div className="bg-white border-b border-[#E5E7EB] px-5 py-3 shrink-0">
        <div ref={trackRef} className="flex gap-2 overflow-x-auto pb-1">
          {TRACK_LESSONS.map((lesson, i) => {
            const isCompleted = localCompleted.includes(lesson.number);
            const isCurrent = i === currentTrackIndex;
            const isLocked = !isCompleted && !isCurrent;

            return (
              <button
                key={lesson.number}
                onClick={() => handleTrackClick(i)}
                className={`w-[120px] h-[80px] rounded-xl border-2 flex flex-col items-center justify-center shrink-0 transition-all cursor-pointer ${
                  isCompleted ? 'bg-[#E1F5EE] border-[#9FE1CB]' :
                  isCurrent ? 'bg-[#EEEDFE] border-[#AFA9EC]' :
                  'bg-[#F9FAFB] border-[#E5E7EB] opacity-60'
                } ${isLocked ? 'cursor-not-allowed' : ''}`}
              >
                {isCompleted && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2.5" className="absolute top-1 right-1">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {isLocked && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="mb-1">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                )}
                <span className={`text-[10px] font-medium ${isCurrent ? 'text-[#534AB7]' : isCompleted ? 'text-[#0F6E56]' : 'text-[#9CA3AF]'}`}>
                  Lesson {lesson.number}
                </span>
                <span className={`text-[11px] mt-0.5 text-center px-1 leading-tight ${isCurrent ? 'text-[#3C3489]' : isCompleted ? 'text-[#085041]' : 'text-[#9CA3AF]'}`}>
                  {lesson.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lesson content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
        {isLoading && (
          <div className="space-y-3">
            <div className="h-32 bg-[#F9FAFB] rounded-xl animate-pulse" />
            <div className="h-32 bg-[#F9FAFB] rounded-xl animate-pulse" />
            <div className="h-32 bg-[#F9FAFB] rounded-xl animate-pulse" />
          </div>
        )}

        {!isLoading && currentLesson && sections.length > 0 && (
          <>
            <h3 className="text-[16px] font-medium text-[#111827] mb-1">{TRACK_LESSONS[currentTrackIndex].title}</h3>
            <p className="text-[12px] text-[#9CA3AF] mb-4">Lesson {currentTrackIndex + 1} of {TRACK_LESSONS.length}</p>
            {sections.map((section, i) => (
              <SectionCard
                key={i}
                section={section}
                index={i}
                currentIndex={currentSectionIndex}
                onHintReveal={handleHintReveal}
                revealedHints={revealedHints}
                onOpenInEditor={handleOpenInEditor}
                language={languageName}
              />
            ))}
          </>
        )}

        {!isLoading && (!currentLesson || sections.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="1" className="mb-3">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-[13px] text-[#9CA3AF]">Generating lesson content...</p>
            <p className="text-[11px] text-[#9CA3AF] mt-1">This may take a few seconds the first time.</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      {currentLesson && sections.length > 0 && !isLoading && (
        <BottomNav
          currentIndex={currentSectionIndex}
          totalSections={sections.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
