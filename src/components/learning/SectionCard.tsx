import { useState } from 'react';
import type { LessonSection } from '../../types/learning.types';

interface Props {
  section: LessonSection;
  index: number;
  currentIndex: number;
  onHintReveal: (sectionIndex: number, hintIndex: number) => void;
  revealedHints: Record<number, number>;
  onOpenInEditor: (prompt: string, language: string) => void;
  language: string;
}

const TYPE_CONFIG: Record<string, { bg: string; text: string; label: string; iconPath: string }> = {
  explanation: { bg: 'bg-[#EEEDFE]', text: 'text-[#3C3489]', label: 'Explanation', iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  example: { bg: 'bg-[#E1F5EE]', text: 'text-[#085041]', label: 'Example', iconPath: 'M16 18l6-6-6-6M8 6l-6 6 6 6' },
  tip: { bg: 'bg-[#FAEEDA]', text: 'text-[#633806]', label: 'Tip', iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  exercise: { bg: 'bg-[#E6F1FB]', text: 'text-[#0C447C]', label: 'Exercise', iconPath: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
};

export function SectionCard({ section, index, currentIndex, onHintReveal, revealedHints, onOpenInEditor, language }: Props) {
  const [copied, setCopied] = useState(false);

  const isCurrent = index === currentIndex;
  const isLocked = index > currentIndex;
  const config = TYPE_CONFIG[section.type] ?? TYPE_CONFIG.explanation;

  const hintsTotal = section.hints?.length ?? 0;
  const hintsRevealed = revealedHints[index] ?? 0;
  const hintsLeft = hintsTotal - hintsRevealed;

  const handleCopy = () => {
    if (section.code) {
      navigator.clipboard.writeText(section.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 mb-3 transition-opacity ${
        isCurrent ? 'border-l-[3px] border-l-[#534AB7]' : ''
      } ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Type tag */}
      <div className="mb-2">
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={config.iconPath} />
          </svg>
          {config.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[13px] font-medium text-[#111827] mb-1.5">{section.title}</h3>

      {/* Content by type */}
      {section.type === 'explanation' && (
        <p className="text-[12px] text-[#4B5563] leading-[1.7]">{section.content}</p>
      )}

      {section.type === 'example' && (
        <>
          {section.content && <p className="text-[12px] text-[#4B5563] leading-[1.7] mb-3">{section.content}</p>}
          {section.code && (
            <div className="relative">
              <pre className="bg-[#1E1E2E] rounded-lg p-3 text-[12px] text-[#A6E3A1] font-mono leading-[1.7] overflow-x-auto whitespace-pre">
                {section.code}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 text-white/60 hover:text-white cursor-pointer transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {section.type === 'tip' && (
        <div className="bg-[#FAEEDA] border-l-[3px] border-l-[#854F0B] rounded-r-lg p-3 flex items-start gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p className="text-[12px] text-[#633806] leading-[1.7]">{section.content}</p>
        </div>
      )}

      {section.type === 'exercise' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-3.5">
          {/* Challenge */}
          <p className="text-[12px] text-[#4B5563] mb-3">{section.prompt}</p>

          {/* Revealed hints */}
          {hintsRevealed > 0 && (
            <div className="mb-3">
              <p className="text-[11px] text-[#9CA3AF] mb-2">{hintsRevealed} / {hintsTotal} hints revealed</p>
              <div className="flex flex-col gap-1.5">
                {section.hints?.slice(0, hintsRevealed).map((hint, hi) => (
                  <div key={hi} className="bg-[#F9FAFB] rounded-lg px-[10px] py-2 flex items-start gap-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span className="text-[11px] text-[#4B5563]">{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onOpenInEditor(section.prompt ?? '', language)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#534AB7] text-white rounded-lg text-[11px] font-medium hover:opacity-90 cursor-pointer transition-opacity"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              Open in editor
            </button>
            <button
              onClick={() => onHintReveal(index, hintsRevealed)}
              disabled={hintsLeft === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] text-[#4B5563] rounded-lg text-[11px] hover:bg-[#F8F9FA] cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              {hintsLeft > 0 ? `Show hint (${hintsLeft} left)` : 'All hints shown'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
