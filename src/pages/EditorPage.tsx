import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityBar, type ActivityView } from '../components/layout/ActivityBar';
import { StatusBar } from '../components/layout/StatusBar';
import { FilesSidebar } from '../components/sidebar/FilesSidebar';
import { CodeEditor } from '../components/editor/CodeEditor';
import { NewProjectModal } from '../components/editor/NewProjectModal';
import { TerminalPanel, type TerminalLine } from '../components/editor/TerminalPanel';
import { AIPanel } from '../components/ai/AIPanel';
import { createProject, saveSnapshot, getProjectsByUser, loadEditor } from '../services/api';
import type { Language, Project } from '../types';
import type { VNode, VFile } from '../types/vfs';
import { uid } from '../types/vfs';
import { Terminal, Save, FolderPlus } from 'lucide-react';

interface StoredUser { id: number; username: string; email: string; }
interface OpenFile { name: string; content: string; language: Language; }

const FS_STORAGE_KEY = 'codetutor-fs-nodes';
const ACTIVE_PROJECT_KEY = 'codetutor-active-project';

export function EditorPage() {
  const navigate = useNavigate();
  const user: StoredUser = JSON.parse(localStorage.getItem('user') ?? '{}');

  const [activity, setActivity] = useState<ActivityView>('files');
  const [openFile, setOpenFile] = useState<OpenFile | null>(null);
  const [code, setCode] = useState('');
  const [fsNodes, setFsNodes] = useState<VNode[]>(() => {
    try { return JSON.parse(localStorage.getItem(FS_STORAGE_KEY) ?? '[]'); } catch { return []; }
  });
  const [fsActiveId, setFsActiveId] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [canValidate, setCanValidate] = useState(false);
  const [hasAiWarning, setHasAiWarning] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [terminalRunning, setTerminalRunning] = useState(false);
  const [aiPanelWidth, setAiPanelWidth] = useState(288);
  const [isSaved, setIsSaved] = useState(true);
  const [isResizingAiPanel, setIsResizingAiPanel] = useState(false);
  const [savingToBackend, setSavingToBackend] = useState(false);

  // Active project from backend
  const [activeProject, setActiveProject] = useState<Project | null>(() => {
    try { return JSON.parse(localStorage.getItem(ACTIVE_PROJECT_KEY) ?? 'null'); } catch { return null; }
  });
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);

  const aiPanelResizerRef = useRef<HTMLDivElement>(null);

  // Load saved projects list
  useEffect(() => {
    if (user.id) {
      getProjectsByUser(user.id).then(setSavedProjects).catch(() => {});
    }
  }, [user.id]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Warn before closing
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isSaved) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaved]);

  // ─── SAVE current project ──────────────────────────────────────────────────
  const saveCurrentProject = async () => {
    if (!activeProject || savingToBackend) return;
    setSavingToBackend(true);

    // Update file content in nodes
    const updatedNodes = fsNodes.map(n =>
      n.id === fsActiveId && n.type === 'file' ? { ...n, content: code } : n
    );
    setFsNodes(updatedNodes);
    localStorage.setItem(FS_STORAGE_KEY, JSON.stringify(updatedNodes));

    try {
      await saveSnapshot({
        content: JSON.stringify({ nodes: updatedNodes }),
        versionLabel: `Save - ${new Date().toLocaleTimeString()}`,
        projectId: activeProject.id,
      });
      // Save locally too
      localStorage.setItem(`codetutor-project-${activeProject.id}-nodes`, JSON.stringify(updatedNodes));
      setIsSaved(true);
      setToast('Project saved');
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSavingToBackend(false);
    }
  };

  // ─── CREATE new project ────────────────────────────────────────────────────
  const handleCreateProject = async (name: string) => {
    setModalLoading(true);
    setModalError(null);

    try {
      // Step 1: Save current project if active
      if (activeProject && !isSaved) {
        await saveCurrentProject();
      }

      // Step 2: Create new project in backend
      const newProject = await createProject({
        name,
        description: name,
        programmingLanguage: 'javascript',
        userId: user.id,
      });

      // Step 3: Clear editor
      setOpenFile(null);
      setCode('');
      setFsActiveId(null);
      setTerminalLines([]);

      // Step 4: Set up new project with empty folder
      const folderId = uid();
      const newNodes: VNode[] = [{ id: folderId, type: 'folder', name, parentId: null, open: true }];
      setFsNodes(newNodes);
      localStorage.setItem(FS_STORAGE_KEY, JSON.stringify(newNodes));

      // Step 5: Set active project
      setActiveProject(newProject);
      localStorage.setItem(ACTIVE_PROJECT_KEY, JSON.stringify(newProject));
      setIsSaved(true);

      // Step 6: Refresh saved projects list
      const projects = await getProjectsByUser(user.id);
      setSavedProjects(projects);

      setIsNewProjectModalOpen(false);
    } catch (err) {
      setModalError('Error creating project. Check your connection.');
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  // ─── LOAD a saved project ─────────────────────────────────────────────────
  const handleLoadSavedProject = async (project: Project) => {
    // Save current first
    if (activeProject && !isSaved) {
      await saveCurrentProject();
    }

    // Clear editor
    setOpenFile(null);
    setCode('');
    setFsActiveId(null);
    setTerminalLines([]);
    setLoadingProject(true);

    // Try to load from localStorage first (instant)
    const localNodes = localStorage.getItem(`codetutor-project-${project.id}-nodes`);
    let projectNodes: VNode[] = [];

    if (localNodes) {
      try {
        const parsed = JSON.parse(localNodes);
        if (Array.isArray(parsed) && parsed.length > 0) projectNodes = parsed;
      } catch { /* ignore */ }
    }

    // If no local data, load from backend
    if (projectNodes.length === 0) {
      try {
        const data = await loadEditor(project.id);
        try {
          const parsed = JSON.parse(data.currentCode ?? '');
          if (parsed.nodes) projectNodes = parsed.nodes;
        } catch {
          const folderId = uid();
          projectNodes = [
            { id: folderId, type: 'folder', name: project.name, parentId: null, open: true },
            { id: uid(), type: 'file', name: project.name + '.' + project.programmingLanguage, content: data.currentCode ?? '', language: project.programmingLanguage, parentId: folderId },
          ];
        }
      } catch {
        const folderId = uid();
        projectNodes = [{ id: folderId, type: 'folder', name: project.name, parentId: null, open: true }];
      }
    }

    setFsNodes(projectNodes);
    localStorage.setItem(FS_STORAGE_KEY, JSON.stringify(projectNodes));
    setActiveProject(project);
    localStorage.setItem(ACTIVE_PROJECT_KEY, JSON.stringify(project));
    setIsSaved(true);
    setLoadingProject(false);
    setToast('Project loaded');
  };

  // ─── File operations ───────────────────────────────────────────────────────
  const handleOpenFile = (name: string, content: string, language: Language) => {
    setOpenFile({ name, content, language });
    setCode(content);
    setErrorCount(0);
    setCanValidate(false);
    setHasAiWarning(false);
  };

  useEffect(() => {
    if (!fsActiveId || !openFile) return;
    const activeNode = fsNodes.find(n => n.id === fsActiveId);
    if (activeNode && activeNode.type === 'file') {
      const file = activeNode as VFile;
      if (file.name !== openFile.name || file.language !== openFile.language) {
        setOpenFile({ name: file.name, content: code, language: file.language });
      }
    }
  }, [fsNodes, fsActiveId]);

  useEffect(() => {
    if (fsActiveId === null && openFile) { setOpenFile(null); setCode(''); }
  }, [fsActiveId]);

  // Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveCurrentProject(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeProject, fsNodes, fsActiveId, code, isSaved]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('codetutor_token');
    navigate('/');
  };

  const handleAiPanelResizerMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizingAiPanel(true);
    const startX = event.clientX;
    const startWidth = aiPanelWidth;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      setAiPanelWidth(Math.max(200, Math.min(600, startWidth + delta)));
    };
    const handleMouseUp = () => {
      setIsResizingAiPanel(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [aiPanelWidth]);

  const editorData = openFile ? {
    projectId: activeProject?.id ?? 0,
    projectName: openFile.name,
    language: openFile.language,
    currentCode: openFile.content,
    versionNumber: 0,
  } : null;

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] text-[#111827] overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-[#111827] text-white text-[12px] px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        open={isNewProjectModalOpen}
        onClose={() => { setIsNewProjectModalOpen(false); setModalError(null); }}
        onCreate={handleCreateProject}
        loading={modalLoading}
        error={modalError}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar active={activity} onChange={setActivity} />

        {/* Sidebar */}
        <div className="w-56 bg-white border-r border-[#E5E7EB] flex flex-col overflow-hidden shrink-0">
          {activity === 'files' && (
            <FilesSidebar
              userId={user.id}
              nodes={fsNodes}
              setNodes={setFsNodes}
              activeId={fsActiveId}
              setActiveId={setFsActiveId}
              onOpenFile={handleOpenFile}
              onNewProject={() => setIsNewProjectModalOpen(true)}
              onLoadProject={(_nodes, projId) => {
                const proj = savedProjects.find(p => p.id === projId);
                if (proj) handleLoadSavedProject(proj);
              }}
              refreshTrigger={savedProjects.length}
            />
          )}
          {activity === 'settings' && (
            <div className="flex flex-col h-full">
              <div className="px-3 py-2 border-b border-[#E5E7EB] shrink-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">Settings</p>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex flex-col items-center gap-3 py-5 px-3 bg-[#F8F9FA] rounded-2xl border border-[#E5E7EB]">
                  <div className="w-14 h-14 rounded-2xl bg-[#534AB7] flex items-center justify-center text-white text-2xl font-bold select-none">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#111827]">{user.username}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{user.email}</p>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors cursor-pointer">
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Editor area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top bar with project info */}
            {activeProject && (
              <div className="h-9 bg-white border-b border-[#E5E7EB] flex items-center px-3 shrink-0 gap-3">
                <span className="text-[13px] font-medium text-[#111827]">{activeProject.name}</span>
                <span className="bg-[#EEEDFE] text-[#3C3489] text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {activeProject.programmingLanguage}
                </span>
                <div className="ml-auto">
                  <button
                    onClick={() => setIsNewProjectModalOpen(true)}
                    className="flex items-center gap-1 text-[11px] text-[#9CA3AF] hover:text-[#534AB7] cursor-pointer transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> New
                  </button>
                </div>
              </div>
            )}

            {/* Editor */}
            <div className="flex flex-1 overflow-hidden relative">
              {loadingProject && (
                <div className="absolute inset-0 z-10 bg-white/80 flex flex-col items-center justify-center">
                  <svg className="w-8 h-8 animate-spin text-[#534AB7] mb-3" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  <p className="text-[13px] text-[#4B5563]">Loading project...</p>
                </div>
              )}
              <CodeEditor
                editorData={editorData}
                code={code}
                onChange={newCode => { setCode(newCode); setIsSaved(false); }}
                onErrorCountChange={(count, validate) => { setErrorCount(count); setCanValidate(validate); }}
              />
            </div>

            {/* Bottom bar */}
            {!terminalOpen && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-white border-t border-[#E5E7EB] shrink-0">
                <button onClick={() => setTerminalOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#111827] cursor-pointer transition-colors">
                  <Terminal className="w-3.5 h-3.5" /> Console
                </button>
                <button
                  onClick={saveCurrentProject}
                  disabled={savingToBackend || !activeProject}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-[#E5E7EB] text-[#534AB7] hover:bg-[#EEEDFE] cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Save className="w-3 h-3" /> {savingToBackend ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}

            {/* Terminal */}
            {terminalOpen && (
              <div className="h-48 shrink-0">
                <TerminalPanel code={code} language={openFile?.language ?? 'javascript'}
                  lines={terminalLines} running={terminalRunning}
                  onLines={setTerminalLines} onRunning={setTerminalRunning}
                  onClose={() => setTerminalOpen(false)} />
              </div>
            )}
          </div>

          {/* AI Panel */}
          <>
            <div ref={aiPanelResizerRef} onMouseDown={handleAiPanelResizerMouseDown}
              className="relative shrink-0 cursor-col-resize group" style={{ width: 6 }}>
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 transition-colors group-hover:bg-[#534AB7]/40"
                style={{ background: isResizingAiPanel ? 'rgba(83,74,183,0.5)' : 'transparent' }} />
            </div>
            <AIPanel editorData={editorData} code={code} exerciseContext={null} width={aiPanelWidth}
              onAiResponse={(msg) => {
                if (['error', 'falta', 'incorrecto'].some(w => msg.toLowerCase().includes(w))) setHasAiWarning(true);
              }} />
          </>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar language={openFile?.language ?? '—'} projectName={activeProject?.name ?? 'No project'}
        version={0} username={user.username ?? ''} errorCount={errorCount}
        canValidate={canValidate} hasAiWarning={hasAiWarning} hasUnsavedChanges={!isSaved} />
    </div>
  );
}
