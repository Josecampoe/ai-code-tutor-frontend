import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { sendChatMessage, getErrorMessage } from '../../services/api';
import type { EditorData } from '../../types';

// ─── Estructura de mensaje de chat ────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

function uid() { return `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

// Elimina emojis de las respuestas de la IA
function stripEmojis(text: string): string {
  return text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27FF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FEFF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA9F}]/gu, '').replace(/\s{2,}/g, ' ').trim();
}

// ─── Burbuja de mensaje ───────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6f42c1] to-[#0e639c] flex items-center justify-center shrink-0 mt-0.5 shadow-md">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap break-words
        ${isUser
          ? 'bg-gradient-to-br from-[#0e639c] to-[#1177bb] text-white rounded-tr-sm shadow-lg shadow-[#0e639c]/20'
          : 'bg-[#161622] text-[#e5e7eb] border border-[#ffffff0a] rounded-tl-sm'}`}>
        {msg.content}
      </div>
    </div>
  );
}

// ─── Indicador de escritura (tres puntos) ─────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="w-6 h-6 rounded-full bg-[#0e639c] flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-[#2d2d2d] border border-[#3c3c3c] rounded-lg rounded-tl-none px-3 py-2 flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 bg-[#858585] rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────
interface Props { editorData: EditorData | null; code: string; exerciseContext: { statement: string; code: string } | null; }

export function AIPanel({ editorData, code, exerciseContext }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevExerciseRef = useRef<string | null>(null);

  // Cuando llega un nuevo ejercicio, inyecta automáticamente el mensaje de ayuda
  useEffect(() => {
    if (!exerciseContext) return;
    const key = exerciseContext.statement;
    if (prevExerciseRef.current === key) return;
    prevExerciseRef.current = key;

    const helpMessage = `Necesito ayuda con este ejercicio:\n\n${exerciseContext.statement}\n\nMi código actual:\n\`\`\`\n${exerciseContext.code || '(vacío)'}\n\`\`\``;
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: helpMessage, timestamp: new Date() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);
    sendChatMessage({
      message: helpMessage,
      history: updated.map(m => ({ role: m.role, content: m.content })),
      currentCode: exerciseContext.code,
      language: editorData?.language,
    }).then(res => {
      addMessage('ai', stripEmojis(res.message));
    }).catch(err => {
      addMessage('ai', `Error: ${getErrorMessage(err)}`);
    }).finally(() => setLoading(false));
  }, [exerciseContext]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const addMessage = (role: 'user' | 'ai', content: string) => {
    setMessages(prev => [...prev, { id: uid(), role, content, timestamp: new Date() }]);
  };

  // Construye el historial para enviar al backend
  const buildHistory = (msgs: ChatMessage[]) =>
    msgs.map(m => ({ role: m.role, content: m.content }));

  // Analizar el código actual del editor
  const handleAnalyze = async () => {
    if (!editorData || !code.trim() || loading) return;
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: 'Analizando código actual...', timestamp: new Date() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);
    try {
      const res = await sendChatMessage({
        message: 'Analiza el código que tengo en el editor y explícame qué hace y cómo puedo mejorarlo',
        history: buildHistory(updated),
        currentCode: code,
        language: editorData.language,
      });
      addMessage('ai', stripEmojis(res.message));
    } catch (err) {
      addMessage('ai', `Error: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensaje libre del usuario
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: text, timestamp: new Date() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);
    try {
      const res = await sendChatMessage({
        message: text,
        history: buildHistory(updated),
        currentCode: code,
        language: editorData?.language,
      });
      addMessage('ai', stripEmojis(res.message));
    } catch (err) {
      addMessage('ai', `Error: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col w-72 bg-[#0d0d14] border-l border-[#ffffff08] shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#ffffff08] shrink-0 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#a78bfa] animate-pulse" />
        <span className="text-xs font-semibold text-[#e5e7eb] tracking-wide">AI Tutor</span>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 bg-[#0d0d14]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6f42c1]/30 to-[#0e639c]/30 border border-[#ffffff10] flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#a78bfa]" />
            </div>
            <div>
              <p className="text-sm text-[#e5e7eb] font-medium">Hola, soy tu tutor IA</p>
              <p className="text-xs text-[#6b7280] mt-1">Escribe un mensaje o analiza tu código.</p>
            </div>
          </div>
        )}
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-[#ffffff08] flex flex-col gap-2 shrink-0 bg-[#0d0d14]">
        <button
          onClick={handleAnalyze}
          disabled={loading || !editorData}
          className="self-start text-[10px] px-2.5 py-1 rounded-full border border-[#a78bfa]/30 bg-[#a78bfa]/10 text-[#a78bfa] hover:bg-[#a78bfa]/20 disabled:opacity-40 transition-colors cursor-pointer font-medium"
        >
          Analizar código
        </button>
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={2}
            className="flex-1 bg-[#161622] border border-[#ffffff10] rounded-xl px-3 py-2 text-xs text-[#e5e7eb] placeholder-[#4b5563] resize-none focus:outline-none focus:border-[#6f42c1]/50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-gradient-to-br from-[#6f42c1] to-[#0e639c] hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shrink-0 shadow-lg shadow-[#6f42c1]/20"
            aria-label="Enviar"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
