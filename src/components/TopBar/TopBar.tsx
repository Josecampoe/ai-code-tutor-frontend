import { GraduationCap } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../shared/Button';
import type { Language } from '../../types';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

export function TopBar() {
  const { state, setLanguage, newProject } = useAppContext();

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-[#16162a] border-b border-[#2a2a3e] shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <GraduationCap className="w-6 h-6 text-indigo-400" />
        <span className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          CodeTutor
        </span>
      </div>

      {/* Center: project name */}
      <span className="text-sm text-gray-400 truncate max-w-xs">
        {state.currentProject?.name ?? 'No project open'}
      </span>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <select
          value={state.language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-[#2a2a3e] border border-[#3a3a5c] text-gray-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          aria-label="Select programming language"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>

        <Button variant="secondary" size="sm" onClick={newProject}>
          New Project
        </Button>
      </div>
    </header>
  );
}
