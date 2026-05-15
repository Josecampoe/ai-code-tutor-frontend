import type { Lesson, Level } from '../../../types/learning.types';
import { LevelTabs } from './LevelTabs';

const LEVEL_PILL: Record<string, { bg: string; text: string }> = {
  beginner:     { bg: 'bg-[#E1F5EE]', text: 'text-[#085041]' },
  intermediate: { bg: 'bg-[#FAEEDA]', text: 'text-[#633806]' },
  advanced:     { bg: 'bg-[#FEE2E2]', text: 'text-[#9B1C1C]' },
};

interface Props {
  lesson: Lesson;
  topicName: string;
  selectedLanguage: string;
  selectedLevel: Level;
  completedLevels: Level[];
  completedLessons: number[];
  isBookmarked: boolean;
  isGeneratingLesson?: boolean;
  onLevelChange: (level: Level) => void;
  onBookmarkToggle: () => void;
  onPracticeClick: () => void;
}

export function LessonHero({ lesson, topicName, selectedLanguage, selectedLevel, completedLevels, completedLessons, isBookmarked, isGeneratingLesson, onLevelChange, onBookmarkToggle, onPracticeClick }: Props) {
  const levelPill = LEVEL_PILL[selectedLevel] ?? LEVEL_PILL.beginner;

  return (
    <div className="border-b border-[#E5E7EB]">
      <div className="h-12 bg-white flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="text-[#9CA3AF]">Languages</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="text-[#111827] font-medium truncate max-w-[200px]">{topicName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBookmarkToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border transition-colors cursor-pointer ${isBookmarked ? 'border-[#534AB7] text-[#534AB7]' : 'border-[#E5E7EB] text-[#4B5563] hover:bg-[#F8F9FA]'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? '#534AB7' : 'none'} stroke={isBookmarked ? '#534AB7' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            {isBookmarked ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={onPracticeClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#534AB7] text-white rounded-lg text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Practice in editor
          </button>
        </div>
      </div>

      <div className="px-5 pt-4 pb-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] bg-[#EEEDFE] text-[#3C3489] px-2.5 py-1 rounded-full font-medium">
            {selectedLanguage}
          </span>
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium capitalize ${levelPill.bg} ${levelPill.text}`}>
            {selectedLevel}
          </span>
          <span className="text-[11px] text-[#9CA3AF] bg-[#F9FAFB] px-2 py-1 rounded-full flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {lesson.estimatedMinutes} min
          </span>
        </div>

        <h1 className="text-[17px] font-medium text-[#111827]">{lesson.title}</h1>
        <p className="text-[13px] text-[#4B5563] leading-[1.6] mt-1 mb-3">{lesson.summary}</p>

        {isGeneratingLesson && (
          <div className="flex items-center gap-2 bg-[#EEEDFE] rounded-lg px-[14px] py-[10px] mb-3">
            <svg className="w-4 h-4 text-[#534AB7] animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
            </svg>
            <span className="text-[12px] text-[#3C3489]">Generating with AI...</span>
          </div>
        )}

        <LevelTabs
          selectedLevel={selectedLevel}
          completedLevels={completedLevels}
          completedLessons={completedLessons}
          currentLessonNumber={lesson.lessonNumber}
          onLevelChange={onLevelChange}
        />
      </div>
    </div>
  );
}
