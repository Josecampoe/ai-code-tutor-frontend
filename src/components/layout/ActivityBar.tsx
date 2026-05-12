import { Files, Settings } from 'lucide-react';

export type ActivityView = 'files' | 'settings';

interface Props {
  active: ActivityView;
  onChange: (v: ActivityView) => void;
}

const items: {
  id: ActivityView;
  icon: React.ReactNode;
  title: string;
}[] = [
  {
    id: 'files',
    icon: <Files className="w-[20px] h-[20px]" />,
    title: 'Explorer',
  },
  {
    id: 'settings',
    icon: <Settings className="w-[20px] h-[20px]" />,
    title: 'Settings',
  },
];

export function ActivityBar({ active, onChange }: Props) {
  return (
    <div className="flex flex-col items-center w-14 bg-[#F0F1F3] border-r border-[#E5E7EB] py-3 gap-1 shrink-0">
      {/* Logo top */}
      <div className="w-8 h-8 rounded-lg bg-[#534AB7] flex items-center justify-center mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      </div>

      {items.map(item => (
        <div key={item.id} className="relative group">
          <button
            onClick={() => onChange(item.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer
              ${active === item.id
                ? 'text-[#534AB7] bg-[#EEEDFE]'
                : 'text-[#9CA3AF] hover:text-[#4B5563] hover:bg-white'}`}
          >
            {item.icon}
            {active === item.id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#534AB7] rounded-r-full" />
            )}
          </button>

          {/* Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#111827] rounded-lg text-[11px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-xl z-50">
            {item.title}
          </div>
        </div>
      ))}
    </div>
  );
}
