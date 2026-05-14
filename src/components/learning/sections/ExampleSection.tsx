import { useState } from 'react';

interface Props {
  content?: string;
  code?: string;
}

export function ExampleSection({ content, code }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {content && <p className="text-[12px] text-[#4B5563] leading-[1.7] mb-3">{content}</p>}
      {code && (
        <div className="relative">
          <pre className="bg-[#1E1E2E] rounded-lg p-3 text-[12px] text-[#A6E3A1] font-mono leading-[1.7] overflow-x-auto whitespace-pre">{code}</pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-white/60 hover:text-white cursor-pointer transition-colors"
            title="Copy code"
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            )}
          </button>
        </div>
      )}
    </>
  );
}
