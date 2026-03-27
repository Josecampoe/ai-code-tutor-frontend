interface Props {
  language: string;
  projectName: string;
  version: number;
  username: string;
}

export function StatusBar({ language, projectName, version, username }: Props) {
  return (
    <div className="flex items-center justify-between px-3 h-6 bg-[#007acc] text-white text-xs shrink-0 select-none">
      <div className="flex items-center gap-4">
        <span className="font-mono">{language}</span>
        <span>{projectName}</span>
        {version > 0 && <span>v{version}</span>}
      </div>
      <span className="text-white/80">{username}</span>
    </div>
  );
}
