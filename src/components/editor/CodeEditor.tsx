import { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { saveSnapshot, getErrorMessage } from '../../services/api';
import type { EditorData } from '../../types';

interface Props {
  editorData: EditorData | null;
  code: string;
  onChange: (code: string) => void;
  onErrorCountChange?: (count: number, canValidate: boolean) => void;
}

const MONACO_LANG: Record<string, string> = {
  javascript: 'javascript', typescript: 'typescript',
  python: 'python', java: 'java', cpp: 'cpp',
};

function getMonacoLang(language: string, fileName: string): string {
  const hasKnownExt = /\.(js|jsx|ts|tsx|py|java|cpp|h|cc)$/.test(fileName);
  if (!hasKnownExt) return 'plaintext';
  return MONACO_LANG[language] ?? 'plaintext';
}

export function CodeEditor({ editorData, code, onChange, onErrorCountChange }: Props) {
  const saving = useRef(false);
  const disposeRef = useRef<Monaco.IDisposable | null>(null);

  const handleMount = (_editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
    // Habilitar validación JS/TS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ts = (monaco.languages as any).typescript;
    if (ts) {
      ts.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: false, noSyntaxValidation: false });
      ts.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: false, noSyntaxValidation: false });
    }

    // Escuchar markers de error
    disposeRef.current?.dispose();
    disposeRef.current = monaco.editor.onDidChangeMarkers((uris) => {
      const errors = uris.flatMap(uri =>
        monaco.editor.getModelMarkers({ resource: uri })
          .filter(m => m.severity === monaco.MarkerSeverity.Error)
      );
      const lang = editorData?.language ?? '';
      const canValidate = lang === 'javascript' || lang === 'typescript';
      onErrorCountChange?.(errors.length, canValidate);
    });
  };

  // Cleanup on unmount
  useEffect(() => () => { disposeRef.current?.dispose(); }, []);

  // Ctrl+S para guardar snapshot
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!editorData || saving.current || editorData.projectId === 0) return;
        saving.current = true;
        try {
          await saveSnapshot({ content: code, versionLabel: 'autosave', projectId: editorData.projectId });
        } catch (err) {
          console.error(getErrorMessage(err));
        } finally {
          saving.current = false;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [code, editorData]);

  if (!editorData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0d0d14] text-[#374151] text-sm select-none">
        <div className="text-center">
          <p className="text-5xl mb-4 opacity-20">{'</>'}</p>
          <p className="text-[#6b7280]">Abre un archivo del explorador para empezar</p>
          <p className="text-xs mt-2 text-[#374151]">Ctrl+S para guardar un snapshot</p>
        </div>
      </div>
    );
  }

  const lang = getMonacoLang(editorData.language, editorData.projectName);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center bg-[#080810] border-b border-[#ffffff06] shrink-0">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0d0d14] border-t-2 border-[#0e639c] text-sm text-[#e5e7eb]">
          <span className="text-xs">{editorData.projectName}</span>
        </div>
      </div>

      <MonacoEditor
        height="100%"
        language={lang}
        value={code}
        theme="vs-dark"
        onMount={handleMount}
        onChange={v => onChange(v ?? '')}
        options={{
          fontSize: 14,
          fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          tabSize: 2,
          automaticLayout: true,
          padding: { top: 12 },
        }}
      />
    </div>
  );
}
