import { useRef, useEffect } from 'react';
import { Play, Trash2, X, Terminal } from 'lucide-react';
import { runCode } from '../../services/api';

export interface TerminalLine {
  text: string;
  type: 'stdout' | 'stderr' | 'info' | 'success' | 'error';
}

interface Props {
  code: string;
  language: string;
  lines: TerminalLine[];
  running: boolean;
  onLines: (lines: TerminalLine[]) => void;
  onRunning: (v: boolean) => void;
  onClose: () => void;
}

const LINE_COLOR: Record<TerminalLine['type'], string> = {
  stdout: 'text-[#d4d4d4]',
  stderr: 'text-[#f44747]',
  info: 'text-[#858585]',
  success: 'text-[#4ec9b0]',
  error: 'text-[#f44747]',
};

// Lenguajes soportados por el backend
const SUPPORTED = ['java', 'python', 'javascript', 'typescript'];

export function TerminalPanel({ code, language, lines, running, onLines, onRunning, onClose }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleRun = async () => {
    if (running || !SUPPORTED.includes(language)) return;
    onRunning(true);
    onLines([...lines, { text: '> Ejecutando...', type: 'info' }]);
    try {
      const res = await runCode({ code, language });
      const next: TerminalLine[] = [...lines, { text: '> Ejecutando...', type: 'info' }];
      if (res.stdout) {
        res.stdout.split('\n').filter(Boolean).forEach(l => next.push({ text: l, type: 'stdout' }));
      }
      if (res.stderr) {
        res.stderr.split('\n').filter(Boolean).forEach(l => next.push({ text: l, type: 'stderr' }));
      }
      if (res.exitCode === 0) {
        next.push({ text: '> Proceso terminado exitosamente ✓', type: 'success' });
      } else {
        next.push({ text: `> Proceso terminado con código ${res.exitCode}`, type: 'error' });
      }
      onLines(next);
    } catch {
      onLines([...lines,
        { text: '> Ejecutando...', type: 'info' },
        { text: '> Error al conectar con el servidor', type: 'error' },
      ]);
    } finally {
      onRunning(false);
    }
  };

  const notSupported = !SUPPORTED.includes(language);

  return (
    <div className="flex flex-col h-full bg-[#0d0d14] border-t border-[#ffffff08]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#080810] border-b border-[#ffffff06] shrink-0">
        <Terminal className="w-3.5 h-3.5 text-[#6b7280]" />
        <span className="text-xs font-medium text-[#9ca3af]">Consola</span>
        <div className="flex-1" />
        {notSupported && (
          <span className="text-[10px] text-[#6b7280]">
            {language} no soportado en terminal
          </span>
        )}
        <button
          onClick={handleRun}
          disabled={running || notSupported}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#388a34] hover:bg-[#4a9e46] text-white rounded disabled:opacity-40 cursor-pointer transition-colors"
        >
          <Play className="w-3 h-3" />
          {running ? 'Ejecutando...' : 'Ejecutar'}
        </button>
        <button
          onClick={() => onLines([])}
          className="flex items-center gap-1 px-2 py-1 text-xs text-[#6b7280] hover:text-[#cccccc] cursor-pointer transition-colors"
          title="Limpiar"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        <button onClick={onClose} className="text-[#6b7280] hover:text-[#cccccc] cursor-pointer transition-colors" title="Cerrar">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[13px] leading-relaxed">
        {lines.length === 0 && (
          <p className="text-[#374151] text-xs">Haz click en Ejecutar para correr el código...</p>
        )}
        {lines.map((line, i) => (
          <div key={i} className={LINE_COLOR[line.type]}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
