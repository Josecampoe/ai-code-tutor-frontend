interface Props { content?: string; }
export function ExplanationSection({ content }: Props) {
  return <p className="text-[12px] text-[#4B5563] leading-[1.7]">{content}</p>;
}
