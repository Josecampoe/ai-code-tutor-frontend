import { GitBranch, User, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Props {
  language: string;
  projectName: string;
  version: number;
  username: string;
  errorCount?: number;       // número de errores detectados por Monaco
  canValidate?: boolean;     // true solo para JS/TS
  hasAiWarning?: boolean;    // true si la IA detectó posibles errores en Java/Python
}

const LANG_COLOR: Record<string, string> = {
  javascript: 'text-yellow-300',
  typescript: 'text-blue-300',
  python: 'text-green-300',
  java: 'text-orange-300',
  cpp: 'text-cyan-300',
};

export function StatusBar({ language, projectName, version, username, errorCount = 0, canValidate = false, hasAiWarning = false }: Props) {
  return (
    <div className="flex items-center justify-between px-3 h-6 bg-[#0e639c] text-white text-[11px] shrink-0 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <GitBranch className="w-3 h-3 opacity-70" />
          <span className="opacity-90">main</span>
        </div>
        <div className="w-px h-3 bg-white/20" />
        <span className={`font-mono font-semibold ${LANG_COLOR[language] ?? 'text-white'}`}>
          {language || 'plaintext'}
        </span>
        {projectName !== 'No file open' && projectName && (
          <>
            <div className="w-px h-3 bg-white/20" />
            <span className="opacity-80 truncate max-w-[180px]">{projectName}</span>
          </>
        )}
        {version > 0 && <span className="opacity-60">v{version}</span>}
      </div>

      <div className="flex items-center gap-3">
        {/* Badge de errores para JS/TS */}
        {canValidate && (
          errorCount > 0 ? (
            <div className="flex items-center gap-1 text-red-300">
              <AlertTriangle className="w-3 h-3" />
              <span>{errorCount} {errorCount === 1 ? 'error' : 'errores'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-300">
              <CheckCircle className="w-3 h-3" />
              <span>Sin errores</span>
            </div>
          )
        )}

        {/* Advertencia para Java/Python (sin validación en browser) */}
        {!canValidate && language && language !== 'plaintext' && language !== '—' && (
          hasAiWarning ? (
            <div className="flex items-center gap-1 text-yellow-300">
              <AlertTriangle className="w-3 h-3" />
              <span>Posibles errores</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 opacity-50">
              <Info className="w-3 h-3" />
              <span>Sin validación en browser</span>
            </div>
          )
        )}

        <div className="w-px h-3 bg-white/20" />
        <div className="flex items-center gap-1.5 opacity-80">
          <User className="w-3 h-3" />
          <span>{username}</span>
        </div>
      </div>
    </div>
  );
}
