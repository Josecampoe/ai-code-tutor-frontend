import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityBar, type ActivityView } from '../components/layout/ActivityBar';
import { StatusBar } from '../components/layout/StatusBar';
import { FilesSidebar } from '../components/sidebar/FilesSidebar';
import { CodeEditor } from '../components/editor/CodeEditor';
import { TerminalPanel, type TerminalLine } from '../components/editor/TerminalPanel';
import { AIPanel } from '../components/ai/AIPanel';
import type { Language } from '../types';
import type { VNode } from '../types/vfs';
import { Terminal, Save } from 'lucide-react';

interface StoredUser { id: number; username: string; email: string; }
interface OpenFile { name: string; content: string; language: Language; }

export function EditorPage() {
  const navigate = useNavigate();
  const user: StoredUser = JSON.parse(localStorage.getItem('user') ?? '{}');

  const [activity, setActivity] = useState<ActivityView>('files');
  const [openFile, setOpenFile] = useState<OpenFile | null>(null);
  const [code, setCode] = useState('');
  const [fsNodes, setFsNodes] = useState<VNode[]>([]);
  const [fsActiveId, setFsActiveId] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [canValidate, setCanValidate] = useState(false);
  const [hasAiWarning, setHasAiWarning] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [terminalRunning, setTerminalRunning] = useState(false);
  const [aiPanelWidth, setAiPanelWidth] = useState(288);
  const [isSaved, setIsSaved] = useState(false);
  const [isResizingAiPanel, setIsResizingAiPanel] = useState(false);
  const aiPanelResizerRef = useRef<HTMLDivElement>(null);

  // Warn before closing if there is unsaved code
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (code.trim() && !isSaved) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [code, isSaved]);

  // Load saved content from localStorage for a given file
  const loadSavedContent = (fileName: string, defaultContent: string): string => {
    const storageKey = `saved-project-0-file-${fileName}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.fileContent ?? defaultContent;
      } catch { /* ignore */ }
    }
    return defaultContent;
  };

  const handleSaveCode = () => {
    if (!openFile || !code.trim()) return;
    const storageKey = `saved-project-0-file-${openFile.name}`;
    localStorage.setItem(storageKey, JSON.stringify({
      fileName: openFile.name,
      fileContent: code,
      savedAt: new Date().toISOString(),
      projectId: 0,
    }));
    setIsSaved(true);
  };

  // Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSaveCode(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openFile, code]);

  const handleOpenFile = (name: string, content: string, language: Language) => {
    const restoredContent = loadSavedContent(name, content);
    setOpenFile({ name, content: restoredContent, language });
    setCode(restoredContent);
    setIsSaved(true);
    setErrorCount(0);
    setCanValidate(false);
    setHasAiWarning(false);
  };

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
      const newWidth = Math.max(200, Math.min(600, startWidth + delta));
      setAiPanelWidth(newWidth);
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
    projectId: 0,
    projectName: openFile.name,
    language: openFile.language,
    currentCode: openFile.content,
    versionNumber: 0,
  } : null;

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] text-[#111827] overflow-hidden">
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
                  <div className="w-full h-px bg-[#E5E7EB]" />
                  <div className="w-full flex items-center justify-between text-xs">
                    <span className="text-[#9CA3AF]">User ID</span>
                    <span className="text-[#4B5563] font-mono bg-[#F0F1F3] px-2 py-0.5 rounded">#{user.id}</span>
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
            {/* Editor */}
            <div className="flex flex-1 overflow-hidden">
              <CodeEditor
                editorData={editorData}
                code={code}
                onChange={newCode => { setCode(newCode); setIsSaved(false); }}
                onErrorCountChange={(count, validate) => {
                  setErrorCount(count);
                  setCanValidate(validate);
                }}
              />
            </div>

            {/* Bottom bar — save button + terminal toggle */}
            {!terminalOpen && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-white border-t border-[#E5E7EB] shrink-0">
                <button
                  onClick={() => setTerminalOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#111827] cursor-pointer transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5" /> Console
                </button>

                {openFile && code.trim() && (
                  <button
                    onClick={handleSaveCode}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-[#E5E7EB] text-[#534AB7] hover:bg-[#EEEDFE] cursor-pointer transition-colors"
                    aria-label="Save code"
                  >
                    <Save className="w-3 h-3" /> Save
                  </button>
                )}
              </div>
            )}

            {/* Terminal panel */}
            {terminalOpen && (
              <div className="h-48 shrink-0">
                <TerminalPanel
                  code={code}
                  language={openFile?.language ?? 'javascript'}
                  lines={terminalLines}
                  running={terminalRunning}
                  onLines={setTerminalLines}
                  onRunning={setTerminalRunning}
                  onClose={() => setTerminalOpen(false)}
                />
              </div>
            )}
          </div>

          {/* AI Panel */}
          <>
            {/* Resizer */}
            <div
              ref={aiPanelResizerRef}
              onMouseDown={handleAiPanelResizerMouseDown}
              className="relative shrink-0 cursor-col-resize group"
              style={{ width: 6 }}
              aria-label="Resize AI panel"
            >
              <div
                className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 transition-colors group-hover:bg-[#534AB7]/40"
                style={{ background: isResizingAiPanel ? 'rgba(83,74,183,0.5)' : 'transparent' }}
              />
            </div>
            <AIPanel
              editorData={editorData}
              code={code}
              exerciseContext={null}
              width={aiPanelWidth}
              onAiResponse={(msg) => {
                const lower = msg.toLowerCase();
                if (['error', 'falta', 'incorrecto', 'problema', 'fallo'].some(w => lower.includes(w))) {
                  setHasAiWarning(true);
                }
              }}
            />
          </>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        language={openFile?.language ?? '—'}
        projectName={openFile?.name ?? 'No file open'}
        version={0}
        username={user.username ?? ''}
        errorCount={errorCount}
        canValidate={canValidate}
        hasAiWarning={hasAiWarning}
        hasUnsavedChanges={!!openFile && !isSaved}
      />
    </div>
  );
}
