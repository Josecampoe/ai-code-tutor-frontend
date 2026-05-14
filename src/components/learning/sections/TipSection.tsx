interface Props {
  content?: string;
}

export function TipSection({ content }: Props) {
  return (
    <div className="bg-[#FAEEDA] border-l-[3px] border-l-[#854F0B] rounded-r-lg p-3 flex items-start gap-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <p className="text-[12px] text-[#633806] leading-[1.7]">{content}</p>
    </div>
  );
}
