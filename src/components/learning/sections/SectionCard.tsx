import type { LessonSection } from '../../../types/learning.types';
import { ExplanationSection } from './ExplanationSection';
import { ExampleSection } from './ExampleSection';
import { TipSection } from './TipSection';
import { ExerciseSection } from './ExerciseSection';

const TAG: Record<string, { bg: string; text: string; label: string }> = {
  explanation: { bg: 'bg-[#EEEDFE]', text: 'text-[#3C3489]', label: 'Concept' },
  example:     { bg: 'bg-[#E1F5EE]', text: 'text-[#085041]', label: 'Example' },
  tip:         { bg: 'bg-[#FAEEDA]', text: 'text-[#633806]', label: 'Tip' },
  exercise:    { bg: 'bg-[#E6F1FB]', text: 'text-[#0C447C]', label: 'Exercise' },
};

interface Props {
  section: LessonSection;
  index: number;
  currentIndex: number;
  revealedHints: Record<number, number>;
  language: string;
  onHintReveal: (i: number) => void;
  onOpenInEditor: (prompt: string) => void;
}

export function SectionCard({ section, index, currentIndex, revealedHints, language: _language, onHintReveal, onOpenInEditor }: Props) {
  const isCurrent = index === currentIndex;
  const isLocked = index > currentIndex;
  const tag = TAG[section.type] ?? TAG.explanation;

  return (
    <div className={`bg-white border border-[#E5E7EB] rounded-xl p-4 mb-3 shadow-sm transition-all ${isCurrent ? 'border-l-[3px] border-l-[#534AB7]' : ''} ${isLocked ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="mb-2">
        <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full ${tag.bg} ${tag.text}`}>
          {tag.label}
        </span>
      </div>
      <h3 className="text-[13px] font-medium text-[#111827] mb-2">{section.title}</h3>

      {section.type === 'explanation' && <ExplanationSection content={section.content} />}
      {section.type === 'example' && <ExampleSection content={section.content} code={section.code} />}
      {section.type === 'tip' && <TipSection content={section.content} />}
      {section.type === 'exercise' && (
        <ExerciseSection
          prompt={section.prompt}
          hints={section.hints}
          hintsRevealed={revealedHints[index] ?? 0}
          onHintReveal={() => onHintReveal(index)}
          onOpenInEditor={onOpenInEditor}
        />
      )}
    </div>
  );
}
