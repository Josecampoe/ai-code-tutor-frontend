interface Props {
  completed: number;
  total: number;
}

export function SidebarFooter({ completed, total }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="p-3 border-t border-[#E5E7EB]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-[#9CA3AF]">Progress</span>
        <span className="text-[11px] text-[#534AB7] font-medium">{completed}/{total}</span>
      </div>
      <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
        <div className="h-full bg-[#534AB7] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
