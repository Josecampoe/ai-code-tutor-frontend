import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { createProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/shared/Button';
import type { Language, Project } from '../types';

interface Props {
  onBack: () => void;
  onCreated: (project: Project) => void;
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
];

export function CreateProjectPage({ onBack, onCreated }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', description: '', programmingLanguage: 'javascript' as Language });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      const project = await createProject({ ...form, userId: user.id });
      onCreated(project);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create project';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e2e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <h2 className="text-xl font-semibold text-gray-100 mb-6">New Project</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6">
          {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">{error}</p>}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400">Project Name</label>
            <input
              type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="My awesome project"
              className="bg-[#16162a] border border-[#2a2a3e] rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What are you building?"
              rows={3}
              className="bg-[#16162a] border border-[#2a2a3e] rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400">Language</label>
            <select
              value={form.programmingLanguage}
              onChange={(e) => setForm({ ...form, programmingLanguage: e.target.value as Language })}
              className="bg-[#16162a] border border-[#2a2a3e] rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <Button type="submit" loading={loading} className="w-full justify-center mt-1">
            Create Project
          </Button>
        </form>
      </div>
    </div>
  );
}
