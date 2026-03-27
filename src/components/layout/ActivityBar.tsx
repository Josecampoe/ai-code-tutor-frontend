import { Files, GraduationCap, Settings } from 'lucide-react';

export type ActivityView = 'files' | 'learn' | 'settings';

interface Props {
  active: ActivityView;
  onChange: (v: ActivityView) => void;
}

const items: { id: ActivityView; icon: React.ReactNode; title: string; activeColor: string }[] = [
  { id: 'files', icon: <Files className="w-5 h-5" />, title: 'Explorer', activeColor: 'text-[#60a5fa]' },
  { id: 'learn', icon: <GraduationCap className="w-5 h-5" />, title: 'Learn', activeColor: 'text-[#a78bfa]' },
  { id: 'settings', icon: <Settings className="w-5 h-5" />, title: 'Settings', activeColor: 'text-[#34d399]' },
];

export function ActivityBar({ active, onChange }: Props) {
  return (
    <div className="flex flex-col items-center w-12 bg-[#0d0d14] border-r border-[#ffffff08] py-3 gap-1 shrink-0">
      {items.map(item => (
        <button
          key={item.id}
          title={item.title}
          onClick={() => onChange(item.id)}
          className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer group
            ${active === item.id
              ? `${item.activeColor} bg-[#ffffff10]`
              : 'text-[#4b5563] hover:text-[#9ca3af] hover:bg-[#ffffff08]'}`}
        >
          {item.icon}
          {/* Indicador activo */}
          {active === item.id && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-current rounded-r-full" />
          )}
        </button>
      ))}
    </div>
  );
}
