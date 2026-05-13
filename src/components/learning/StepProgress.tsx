import type { LessonSection } from '../../types/learning.types';

interface Props {
  sections: LessonSection[];
  currentIndex: number;
  onStepClick: (index: number) => void;
}

const TYPE_LABEL: Record<string, string> = {
  explanation: 'Concept',
  example: 'Example',
  tip: 'Tip',
  exercise: 'Exercise',
};

export function StepProgress({ sections, currentIndex, onStepClick }: Props) {
  return (
    <div className="flex items-start w-full mb-5 px-5">
      {sections.map((section, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const label = TYPE_LABEL[section.type] ?? 'Step';

        return (
          <div key={i} className="flex items-start flex-1">
            {/* Node */}
            <div className="flex flex-col items-center cursor-pointer" onClick={() => onStepClick(i)}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium border-2 transition-colors ${
                isDone
                  ? 'bg-[#E1F5EE] border-[#0F6E56]'
                  : isCurrent
                    ? 'bg-[#534AB7] border-[#534AB7] text-white'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#9CA3AF]'
              }`}>
                {isDone ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[10px] mt-1 max-w-[60px] text-center leading-tight ${
                isCurrent ? 'text-[#534AB7] font-medium' : 'text-[#9CA3AF]'
              }`}>
                {label}
              </span>
            </div>

            {/* Line between nodes */}
            {i < sections.length - 1 && (
              <div className={`flex-1 h-[1.5px] mt-[14px] mx-1 ${
                i < currentIndex ? 'bg-[#0F6E56]' : 'bg-[#E5E7EB]'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
