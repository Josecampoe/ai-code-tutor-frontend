import { useEffect, useState } from 'react';
import { Plus, FileCode } from 'lucide-react';
import { getProjectsByUser, createProject, getErrorMessage } from '../../services/api';
import type { Project, Language } from '../../types';

const LANG_ICON: Record<string, string> = {
  javascript: '🟨', typescript: '🔷', python: '🐍', java: '☕', cpp: '⚙️',
};

interface Props {
  userId: number;
  activeProjectId: number | null;
  onSelectProject: (p: Project) => void;
}

export function FilesSidebar({ userId, activeProjectId, onSelectProject }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', programmingLanguage: 'javascript' as Language });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProjectsByUser(userId).then(setProjects).catch(() => {});
  }, [userId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const p = await createProject({ ...form, userId });
      setProjects(prev => [p, ...prev]);
      setShowModal(false);
      setForm({ name: '', description: '', programmingLanguage: 'javascript' });
      onSelectProject(p);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-[#cccccc]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-widest text-[#bbbbbb]">
        <span>Explorer</span>
        <button onClick={() => setShowModal(true)} title="New Project"
          className="hover:text-white cursor-pointer"><Plus className="w-4 h-4" /></button>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 && (
          <p className="text-xs text-[#858585] px-4 py-3">No projects yet.</p>
        )}
        {projects.map(p => (
          <button key={p.id} onClick={() => onSelectProject(p)}
            className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm text-left transition-colors cursor-pointer
              ${activeProjectId === p.id ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e]'}`}>
            <span className="text-base">{LANG_ICON[p.programmingLanguage] ?? <FileCode className="w-4 h-4" />}</span>
            <span className="truncate">{p.name}</span>
          </button>
        ))}
      </div>

      {/* New project modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form onSubmit={handleCreate}
            className="bg-[#252526] border border-[#3c3c3c] rounded p-6 w-full max-w-sm flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-white">New Project</h2>
            {error && <p className="text-xs text-[#f48771]">{error}</p>}
            <input required placeholder="Project name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-[#3c3c3c] border border-[#555] rounded px-3 py-2 text-sm text-[#cccccc] focus:outline-none focus:border-[#569cd6]" />
            <textarea placeholder="Description" value={form.description} rows={2}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="bg-[#3c3c3c] border border-[#555] rounded px-3 py-2 text-sm text-[#cccccc] resize-none focus:outline-none focus:border-[#569cd6]" />
            <select value={form.programmingLanguage}
              onChange={e => setForm({ ...form, programmingLanguage: e.target.value as Language })}
              className="bg-[#3c3c3c] border border-[#555] rounded px-3 py-2 text-sm text-[#cccccc] focus:outline-none focus:border-[#569cd6] cursor-pointer">
              {(['javascript', 'typescript', 'python', 'java'] as Language[]).map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-xs text-[#cccccc] hover:text-white cursor-pointer">Cancel</button>
              <button type="submit" disabled={creating}
                className="px-3 py-1.5 text-xs bg-[#0e639c] hover:bg-[#1177bb] text-white rounded disabled:opacity-50 cursor-pointer">
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
