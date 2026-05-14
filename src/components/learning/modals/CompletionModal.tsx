import { useEffect, useRef } from 'react';

interface Props {
  topicName: string;
  isOpen: boolean;
  onClose: () => void;
  onPractice: () => void;
  onNextLesson: () => void;
}

export function CompletionModal({ topicName, isOpen, onClose, onPractice, onNextLesson }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-[360px] bg-white rounded-xl p-7 shadow-xl text-center outline-none"
        role="dialog"
        aria-modal="true"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#111827] cursor-pointer transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="w-12 h-12 bg-[#E1F5EE] rounded-full flex items-center justify-center mx-auto mb-3.5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h2 className="text-[15px] font-medium text-[#111827]">Topic completed!</h2>
        <p className="text-[13px] text-[#4B5563] mt-1.5">You mastered {topicName}</p>

        <div className="mt-3.5 mb-4 inline-block bg-[#EEEDFE] text-[#3C3489] text-[12px] font-medium px-3.5 py-1 rounded-full">
          +50 XP
        </div>

        <div className="w-full h-px bg-[#E5E7EB] my-4" />

        <div className="flex flex-col gap-2">
          <button
            onClick={() => { onPractice(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#534AB7] text-white rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            Practice in editor
          </button>
          <button
            onClick={() => { onNextLesson(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#E5E7EB] text-[#4B5563] rounded-lg text-[13px] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
          >
            Next lesson
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
