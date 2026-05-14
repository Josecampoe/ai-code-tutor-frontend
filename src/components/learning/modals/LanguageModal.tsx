import { useState, useEffect } from 'react';

const LANGUAGES = [
  { name: 'Java',       color: '#534AB7' },
  { name: 'Python',     color: '#3B82F6' },
  { name: 'JavaScript', color: '#F59E0B' },
  { name: 'TypeScript', color: '#0F6E56' },
  { name: 'C++',        color: '#854F0B' },
  { name: 'Kotlin',     color: '#993556' },
];

interface Props {
  isOpen: boolean;
  onConfirm: (lang: string) => void;
  onClose: () => void;
}

export function LanguageModal({ isOpen, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState('Java');

  useEffect(() => {
    if (!isOpen) return;
    setSelected('Java');
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-[300px] bg-white rounded-xl p-5 shadow-xl" role="dialog" aria-modal="true">
        <div className="w-10 h-10 bg-[#EEEDFE] rounded-lg flex items-center justify-center mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
        </div>
        <h3 className="text-[14px] font-medium text-[#111827] mb-1">Choose your language</h3>
        <p className="text-[12px] text-[#4B5563] leading-[1.5] mb-3.5">
          Examples will be shown in the language you pick.
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {LANGUAGES.map(lang => {
            const isSelected = selected === lang.name;
            return (
              <button
                key={lang.name}
                onClick={() => setSelected(lang.name)}
                className={`flex flex-col items-center py-[7px] px-2 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-[#534AB7] bg-[#EEEDFE]' : 'border-[#E5E7EB] bg-[#F9FAFB] hover:bg-white'}`}
              >
                <div className="w-[6px] h-[6px] rounded-full mb-1" style={{ backgroundColor: lang.color }} />
                <span className={`text-[11px] font-medium ${isSelected ? 'text-[#3C3489]' : 'text-[#111827]'}`}>
                  {lang.name}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onConfirm(selected)}
          className="w-full mt-3.5 bg-[#534AB7] text-white rounded-lg py-2 text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          Start lesson →
        </button>
      </div>
    </div>
  );
}
