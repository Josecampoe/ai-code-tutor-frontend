import type { Lesson, Level } from '../../../types/learning.types';
import { LevelTabs } from './LevelTabs';

interface Props {
  lesson: Lesson;
  selectedLanguage: string;
  selectedLevel: Level;
  completedLevels: Level[];
  isLanguageTopic: boolean;
  isBookmarked: boolean;
  isGeneratingLesson?: boolean;
  onLevelChange: (level: Level) => void;
  onBookmarkToggle: () => void;
  onPracticeClick: () => void;
  onLanguageChangeRequest: () => void;
}

export function LessonHero({ lesson, selectedLanguage, selectedLevel, completedLevels, isLanguageTopic, isBookmarked, isGeneratingLesson, onLevelChange, onBookmarkToggle, onPracticeClick, onLanguageChangeRequest }: Props) {
  return (
    <div className="border-b border-[#E5E7EB]">
      {/* Top bar */}
      <div className="h-12 bg-white flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="text-[#9CA3AF]">Learning</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="text-[#111827] truncate max-w-[200px]">{lesson.title}</span>
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
            Practice
          </button>
        </div>
      </div>

      {/* Hero content */}
      <div className="px-5 pt-4 pb-0">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {!isLanguageTopic && (
            <button
              onClick={onLanguageChangeRequest}
              className="flex items-center gap-1.5 bg-[#EEEDFE] text-[#3C3489] rounded-full px-3 py-1 text-[11px] font-medium hover:opacity-80 cursor-pointer transition-opacity"
            >
              Examples in: {selectedLanguage}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
                <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
              </svg>
            </button>
          )}
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
          onLevelChange={onLevelChange}
        />
      </div>
    </div>
  );
}
