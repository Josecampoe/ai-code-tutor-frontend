import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Send, Bot, User } from 'lucide-react';

export function ChatTab() {
  const { state, sendChatMessage } = useAppContext();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatMessages, state.isChatLoading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || state.isChatLoading) return;
    setInput('');
    await sendChatMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-2">
        {state.chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center text-gray-600 gap-2">
            <Bot className="w-8 h-8 opacity-30" />
            <p className="text-sm">Ask me anything about your code.</p>
            <p className="text-xs text-gray-700">I can see what you're writing in the editor.</p>
          </div>
        )}

        {state.chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
              msg.role === 'user' ? 'bg-indigo-600' : 'bg-violet-700'
            }`}>
              {msg.role === 'user'
                ? <User className="w-3.5 h-3.5 text-white" />
                : <Bot className="w-3.5 h-3.5 text-white" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-[#22223a] text-gray-300 border border-[#2a2a3e] rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {state.isChatLoading && (
          <div className="flex gap-2 items-center">
            <div className="w-6 h-6 rounded-full bg-violet-700 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-[#22223a] border border-[#2a2a3e] rounded-xl rounded-tl-none px-3 py-2">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 pt-3 border-t border-[#2a2a3e] shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your code... (Enter to send)"
          rows={2}
          className="flex-1 bg-[#16162a] border border-[#2a2a3e] rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || state.isChatLoading}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
