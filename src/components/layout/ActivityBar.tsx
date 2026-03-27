import { Files, GraduationCap, Settings } from 'lucide-react';

export type ActivityView = 'files' | 'learn' | 'settings';

interface Props {
  active: ActivityView;
  onChange: (v: ActivityView) => void;
}

const items: { id: ActivityView; icon: React.ReactNode; title: string }[] = [
  { id: 'files', icon: <Files className="w-6 h-6" />, title: 'Explorer' },
  { id: 'learn', icon: <GraduationCap className="w-6 h-6" />, title: 'Learn' },
  { id: 'settings', icon: <Settings className="w-6 h-6" />, title: 'Settings' },
];

export function ActivityBar({ active, onChange }: Props) {
  return (
    <div className="flex flex-col items-center w-12 bg-[#333333] border-r border-[#252526] py-2 gap-1 shrink-0">
      {items.map(item => (
        <button
          key={item.id}
          title={item.title}
          onClick={() => onChange(item.id)}
          className={`w-12 h-12 flex items-center justify-center transition-colors cursor-pointer
            ${active === item.id
              ? 'text-white border-l-2 border-white'
              : 'text-[#858585] hover:text-[#cccccc] border-l-2 border-transparent'}`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
