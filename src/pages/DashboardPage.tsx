import { useEffect, useState } from 'react';
import { GraduationCap, Plus, Code2, LogOut, Calendar } from 'lucide-react';
import { getProjectsByUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import type { Project } from '../types';

interface Props {
  onCreateProject: () => void;
  onOpenProject: (project: Project) => void;
}

const LANG_COLORS: Record<string, string> = {
  javascript: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  typescript: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  python: 'text-green-400 bg-green-400/10 border-green-400/20',
  java: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
};

export function DashboardPage({ onCreateProject, onOpenProject }: Props) {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    getProjectsByUser(user.id)
      .then(setProjects)
      .catch(() => setError('Failed to load projects.'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-[#1e1e2e] text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#16162a] border-b border-[#2a2a3e]">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-400" />
          <span className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            CodeTutor
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Hi, <span className="text-gray-200">{user?.username}</span></span>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-100">My Projects</h2>
            <p className="text-sm text-gray-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <Button onClick={onCreateProject}>
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        )}

        {error && (
          <p className="text-sm text-red-400 text-center py-10">{error}</p>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <Code2 className="w-12 h-12 text-gray-700" />
            <p className="text-gray-500">No projects yet. Create your first one.</p>
            <Button onClick={onCreateProject}><Plus className="w-4 h-4" /> New Project</Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onOpenProject(project)}
              className="text-left bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5 hover:border-indigo-500/50 hover:bg-[#1e1e38] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-medium text-gray-200 group-hover:text-indigo-300 transition-colors truncate">
                  {project.name}
                </h3>
                <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${LANG_COLORS[project.programmingLanguage] ?? 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                  {project.programmingLanguage}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-4">{project.description || 'No description'}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Calendar className="w-3 h-3" />
                {new Date(project.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
