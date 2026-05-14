import type { Topic } from '../../../types/learning.types';

interface Props {
  topic: Topic;
  isActive: boolean;
  isCompleted: boolean;
  isInProgress: boolean;
  onSelect: (topic: Topic) => void;
}

export function TopicItem({ topic, isActive, isCompleted, isInProgress, onSelect }: Props) {
  const dotColor = isCompleted ? 'bg-[#0F6E56]' : isInProgress ? 'bg-[#534AB7]' : 'bg-[#E5E7EB]';
  return (
    <button
      onClick={() => onSelect(topic)}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left cursor-pointer transition-colors ${
        isActive ? 'bg-[#EEEDFE] border-l-2 border-[#534AB7]' : 'hover:bg-white'
      }`}
    >
      <div className={`w-[6px] h-[6px] rounded-full shrink-0 ${dotColor}`} />
      <span className={`text-[12px] flex-1 truncate ${isActive ? 'text-[#534AB7] font-medium' : 'text-[#111827]'}`}>
        {topic.name}
      </span>
      {isCompleted && (
        <span className="text-[10px] bg-[#E1F5EE] text-[#085041] px-1.5 py-0.5 rounded-full shrink-0">Done</span>
      )}
      {!isCompleted && isInProgress && (
        <span className="text-[10px] bg-[#EEEDFE] text-[#3C3489] px-1.5 py-0.5 rounded-full shrink-0">In progress</span>
      )}
    </button>
  );
}
