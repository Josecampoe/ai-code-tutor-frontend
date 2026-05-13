interface Props {
  currentIndex: number;
  totalSections: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export function BottomNav({ currentIndex, totalSections, onPrevious, onNext, onComplete }: Props) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSections - 1;

  return (
    <div className="h-[52px] bg-white border-t border-[#E5E7EB] px-5 flex items-center justify-between shrink-0">
      {/* Previous */}
      <button
        onClick={onPrevious}
        disabled={isFirst}
        className={`flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-[12px] transition-colors cursor-pointer ${
          isFirst ? 'opacity-40 cursor-not-allowed text-[#9CA3AF]' : 'text-[#4B5563] hover:bg-[#F8F9FA]'
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Previous
      </button>

      {/* Center */}
      <span className="text-[12px] text-[#9CA3AF]">Section {currentIndex + 1} of {totalSections}</span>

      {/* Next / Complete */}
      {!isLast ? (
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#534AB7] text-white rounded-lg text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          Next
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      ) : (
        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F6E56] text-white rounded-lg text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Complete lesson
        </button>
      )}
    </div>
  );
}
