import type { Lesson } from '../../types/learning.types';

interface Props {
  lesson: Lesson;
  selectedLanguage: string;
  selectedLevel: 'beginner' | 'intermediate' | 'advanced';
  isBookmarked: boolean;
  isGeneratingLesson?: boolean;
  onLanguageChange: (lang: string) => void;
  onLevelChange: (level: string) => void;
  onBookmarkToggle: () => void;
  onPracticeClick: () => void;
}

const LEVEL_STYLE: Record<string, string> = {
  beginner: 'bg-[#E1F5EE] text-[#085041]',
  intermediate: 'bg-[#FAEEDA] text-[#633806]',
  advanced: 'bg-[#FEF2F2] text-[#991B1B]',
};

export function LessonHero({ lesson, selectedLanguage, selectedLevel, isBookmarked, isGeneratingLesson, onLanguageChange, onLevelChange, onBookmarkToggle, onPracticeClick }: Props) {
  return (
    <div>
      {/* Top bar */}
      <div className="h-12 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-5 shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="text-[#9CA3AF]">Learning</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span className="text-[#111827]">{lesson.title}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBookmarkToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border transition-colors cursor-pointer ${
              isBookmarked ? 'border-[#534AB7] text-[#534AB7]' : 'border-[#E5E7EB] text-[#4B5563] hover:bg-[#F8F9FA]'
            }`}
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

      {/* Hero content */}
      <div className="px-5 pt-5">
        {/* Meta row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium bg-[#EEEDFE] text-[#3C3489] px-2 py-0.5 rounded-full">{selectedLanguage}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${LEVEL_STYLE[selectedLevel]}`}>{selectedLevel}</span>
            <span className="text-[11px] text-[#9CA3AF] bg-[#F9FAFB] px-2 py-0.5 rounded-full flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {lesson.estimatedMinutes} min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedLanguage}
              onChange={e => onLanguageChange(e.target.value)}
              className="border border-[#E5E7EB] rounded-lg px-2 py-1 text-[12px] text-[#111827] outline-none focus:border-[#534AB7] bg-white cursor-pointer"
            >
              <option value="Java">Java</option>
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
            </select>
            <select
              value={selectedLevel}
              onChange={e => onLevelChange(e.target.value)}
              className="border border-[#E5E7EB] rounded-lg px-2 py-1 text-[12px] text-[#111827] outline-none focus:border-[#534AB7] bg-white cursor-pointer"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Title & summary */}
        <h1 className="text-[18px] font-medium text-[#111827] mt-3">{lesson.title}</h1>
        <p className="text-[13px] text-[#4B5563] leading-[1.6] mt-1.5">{lesson.summary}</p>

        {/* AI generating banner */}
        {isGeneratingLesson && (
          <div className="flex items-center gap-2 bg-[#EEEDFE] rounded-lg px-[14px] py-[10px] mt-3">
            <svg className="w-4 h-4 text-[#534AB7] animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
            </svg>
            <span className="text-[12px] text-[#3C3489]">Generating your lesson with AI... this may take a few seconds</span>
          </div>
        )}
      </div>
    </div>
  );
}
