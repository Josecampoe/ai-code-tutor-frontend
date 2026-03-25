import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useAppContext } from '../../context/AppContext';
import { EditorControls } from './EditorControls';
import { buildTrieForLanguage } from '../../dataStructures';

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
};

export function EditorPanel() {
  const { state, setCode, triggerAnalysis } = useAppContext();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trieRef = useRef(buildTrieForLanguage(state.language));

  // Rebuild trie when language changes
  useEffect(() => {
    trieRef.current = buildTrieForLanguage(state.language);
  }, [state.language]);

  const handleChange = (value: string | undefined) => {
    const code = value ?? '';
    setCode(code);

    // Debounced auto-analysis — 2000ms after user stops typing
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (code.trim()) triggerAnalysis(code);
    }, 2000);
  };

  return (
    <section className="flex flex-col flex-1 h-full min-w-0 border-x border-[#2a2a3e]">
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={MONACO_LANGUAGE_MAP[state.language]}
          value={state.code}
          theme="vs-dark"
          onChange={handleChange}
          options={{
            fontSize: 14,
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
      <EditorControls />
    </section>
  );
}
