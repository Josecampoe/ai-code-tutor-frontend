import { Files, GraduationCap, Settings } from 'lucide-react';

export type ActivityView = 'files' | 'learn' | 'settings';

interface Props {
  active: ActivityView;
  onChange: (v: ActivityView) => void;
}

const items: {
  id: ActivityView;
  icon: React.ReactNode;
  title: string;
  activeColor: string;
  glowColor: string;
  bgActive: string;
}[] = [
  {
    id: 'files',
    icon: <Files className="w-[22px] h-[22px]" />,
    title: 'Explorer',
    activeColor: 'text-[#60a5fa]',
    glowColor: 'shadow-[#60a5fa]/30',
    bgActive: 'bg-[#60a5fa]/10',
  },
  {
    id: 'learn',
    icon: <GraduationCap className="w-[22px] h-[22px]" />,
    title: 'Learn',
    activeColor: 'text-[#a78bfa]',
    glowColor: 'shadow-[#a78bfa]/30',
    bgActive: 'bg-[#a78bfa]/10',
  },
  {
    id: 'settings',
    icon: <Settings className="w-[22px] h-[22px]" />,
    title: 'Settings',
    activeColor: 'text-[#34d399]',
    glowColor: 'shadow-[#34d399]/30',
    bgActive: 'bg-[#34d399]/10',
  },
];

export function ActivityBar({ active, onChange }: Props) {
  return (
    <div className="flex flex-col items-center w-14 bg-[#080810] border-r border-[#ffffff06] py-4 gap-2 shrink-0">
      {/* Logo top */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0e639c] to-[#6f42c1] flex items-center justify-center mb-4 shadow-lg shadow-[#6f42c1]/30">
        <span className="text-white text-xs font-bold">CT</span>
      </div>

      {items.map(item => (
        <div key={item.id} className="relative group">
          <button
            onClick={() => onChange(item.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer
              ${active === item.id
                ? `${item.activeColor} ${item.bgActive} shadow-lg ${item.glowColor}`
                : 'text-[#374151] hover:text-[#9ca3af] hover:bg-[#ffffff06]'}`}
          >
            {item.icon}
            {/* Indicador activo */}
            {active === item.id && (
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-current rounded-r-full opacity-80" />
            )}
          </button>

          {/* Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#161622] border border-[#ffffff10] rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-xl z-50">
            {item.title}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#161622]" />
          </div>
        </div>
      ))}
    </div>
  );
}
