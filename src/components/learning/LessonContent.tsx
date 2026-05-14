import { useState } from 'react';

interface LessonSection {
  type: 'explanation' | 'example' | 'tip' | 'exercise';
  title: string;
  content?: string;
  code?: string;
  prompt?: string;
  hints?: string[];
}

interface Props {
  sections: LessonSection[];
  currentIndex: number;
  revealedHints: Record<number, number>;
  onHintReveal: (sectionIndex: number) => void;
  onOpenInEditor: (prompt: string) => void;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-[#1E1E2E] rounded-lg p-3 mt-2">
      <button onClick={handleCopy} className="absolute top-2 right-2 p-1 rounded hover:bg-white/10 cursor-pointer">
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A6E3A1" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A6E3A1" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        )}
      </button>
      <pre className="font-mono text-[12px] text-[#A6E3A1] overflow-x-auto whitespace-pre leading-[1.7]">{code}</pre>
    </div>
  );
}

function SectionCard({ section, index, currentIndex, revealedHints, onHintReveal, onOpenInEditor }: {
  section: LessonSection; index: number; currentIndex: number;
  revealedHints: Record<number, number>; onHintReveal: (i: number) => void; onOpenInEditor: (p: string) => void;
}) {
  const isCurrent = index === currentIndex;
  const isLocked = index > currentIndex;
  const hints = section.hints || [];
  const revealed = revealedHints[index] || 0;

  const typePill: Record<string, string> = {
    explanation: 'bg-[#EEEDFE] text-[#3C3489]',
    example: 'bg-[#E1F5EE] text-[#085041]',
    tip: 'bg-[#FAEEDA] text-[#633806]',
    exercise: 'bg-[#E6F1FB] text-[#0C447C]',
  };
  const typeLabel: Record<string, string> = { explanation: 'Concept', example: 'Example', tip: 'Tip', exercise: 'Exercise' };

  return (
    <div className={`bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 mb-3 transition-opacity ${isCurrent ? 'border-l-[3px] border-l-[#534AB7]' : ''} ${isLocked ? 'opacity-40 pointer-events-none' : ''}`}>
      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-2 ${typePill[section.type]}`}>{typeLabel[section.type]}</span>
      <h4 className="text-[13px] font-medium text-[#111827] mb-1.5">{section.title}</h4>

      {section.type === 'explanation' && <p className="text-[12px] text-[#4B5563] leading-[1.7]">{section.content}</p>}

      {section.type === 'example' && (
        <>
          {section.content && <p className="text-[12px] text-[#4B5563] leading-[1.7]">{section.content}</p>}
          {section.code && <CodeBlock code={section.code} />}
        </>
      )}

      {section.type === 'tip' && (
        <div className="bg-[#FAEEDA] border-l-[3px] border-l-[#854F0B] rounded-r-lg p-3 flex items-start gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <p className="text-[12px] text-[#633806] leading-[1.7]">{section.content}</p>
        </div>
      )}

      {section.type === 'exercise' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-3.5">
          <p className="text-[12px] text-[#4B5563] mb-3">{section.prompt}</p>
          {revealed > 0 && hints.slice(0, revealed).map((h, i) => (
            <div key={i} className="bg-[#F9FAFB] rounded-lg px-3 py-2 mb-1.5 text-[11px] text-[#4B5563]">
              <span className="font-medium text-[#534AB7]">Hint {i + 1}:</span> {h}
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <button onClick={() => section.prompt && onOpenInEditor(section.prompt)} className="px-3 py-1.5 bg-[#534AB7] text-white rounded-lg text-[11px] font-medium hover:opacity-90 cursor-pointer">Open in editor</button>
            {revealed < hints.length && (
              <button onClick={() => onHintReveal(index)} className="px-3 py-1.5 border border-[#E5E7EB] text-[#4B5563] rounded-lg text-[11px] hover:bg-[#F8F9FA] cursor-pointer">
                Show hint ({hints.length - revealed} left)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function LessonContent({ sections, currentIndex, revealedHints, onHintReveal, onOpenInEditor }: Props) {
  if (sections.length === 0) {
    return <p className="text-[12px] text-[#9CA3AF] text-center py-8">No content available for this lesson.</p>;
  }
  return (
    <div>
      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-4">
        {sections.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i === currentIndex ? 'bg-[#534AB7]' : i < currentIndex ? 'bg-[#A5B4FC]' : 'bg-[#E5E7EB]'}`} />
        ))}
      </div>
      {/* Section cards */}
      {sections.map((section, i) => (
        <SectionCard key={i} section={section} index={i} currentIndex={currentIndex} revealedHints={revealedHints} onHintReveal={onHintReveal} onOpenInEditor={onOpenInEditor} />
      ))}
    </div>
  );
}
