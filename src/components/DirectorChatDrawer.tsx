import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Trash2,
  Copy,
  Check,
  Film,
  Zap,
  Cpu,
  ArrowRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: number;
}

interface DirectorChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrompt: (prompt: string) => void;
}

export const DirectorChatDrawer: React.FC<DirectorChatDrawerProps> = ({
  isOpen,
  onClose,
  onApplyPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        `👋 **Welcome to Leul AI Director's Suite!**\n\n` +
        `I am your AI Co-Director & Cinematography Consultant. I can help you with:\n` +
        `- Scripting dramatic 2-minute narrative arcs\n` +
        `- Crafting cinematic Veo 3.1 video generation prompts\n` +
        `- Camera blocking (crane shots, anamorphic lens, lighting setups)\n` +
        `- Audio soundtrack and voiceover screenplay direction\n\n` +
        `*What cinematic project are you envisioning today?*`,
      model: 'gemini-4-argon',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-4-argon');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/director-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          systemInstruction:
            'You are "Leul Director", an Oscar-winning Hollywood director and visual effects supervisor for Leul AI Video Studio. You provide expert guidance on film narrative, shot composition, lighting schemes, camera lenses, and Veo video prompts. When providing prompt recommendations, always highlight the exact prompt in a code block like `"your prompt here"` so the creator can copy it directly.',
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        role: 'assistant',
        content: data.reply || 'Scene directed successfully.',
        model: selectedModel,
        timestamp: Date.now(),
      };
      setMessages([...updated, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract prompt from code block or text
  const extractAndApplyPrompt = (text: string) => {
    const match = text.match(/`"([^"]+)"`/) || text.match(/"([^"]{15,})"/);
    if (match && match[1]) {
      onApplyPrompt(match[1]);
      onClose();
    } else {
      // Fallback first paragraph or clean line
      onApplyPrompt(text.slice(0, 150));
      onClose();
    }
  };

  const starterPrompts = [
    'How do I block a high-speed cyberpunk chase scene?',
    'Give me a 3-scene story arc for a 2-minute documentary on ocean depths.',
    'What camera lens & lighting works best for emotional character closeups?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-[#0c0f1c] border-l border-[#1f263d] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="h-16 px-4 border-b border-[#1f263d] flex items-center justify-between bg-[#0e1222]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>AI Director Co-Pilot</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-300">
                MULTI-TURN
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Cinematography, Scripting &amp; Prompt Engineering</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-[#181d33] transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181d33] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model Selector Bar */}
      <div className="px-4 py-2 bg-[#090b14] border-b border-[#1b2034] flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-medium">Model Engine:</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setSelectedModel('gemini-4-argon')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
              selectedModel === 'gemini-4-argon'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Complex storytelling & reasoning"
          >
            gemini-4-argon
          </button>
          <button
            onClick={() => setSelectedModel('gemini-3.8-flash')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
              selectedModel === 'gemini-3.8-flash'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="General tasks"
          >
            3.8-flash
          </button>
          <button
            onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
              selectedModel === 'gemini-3.1-flash-lite'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Fast responses"
          >
            3.1-lite
          </button>
        </div>
      </div>

      {/* Messages Scroll Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                  : 'bg-[#131728] border border-[#21273d] text-slate-200'
              }`}
            >
              <div className="whitespace-pre-line prose prose-invert prose-xs">
                {m.content}
              </div>

              {/* If model response has an actionable prompt, show apply button */}
              {m.role === 'assistant' && m.id !== 'welcome' && (
                <div className="mt-3 pt-2.5 border-t border-[#1f263d] flex items-center justify-end">
                  <button
                    onClick={() => extractAndApplyPrompt(m.content)}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/40 text-[10px] font-semibold transition-all"
                  >
                    <Film className="w-3 h-3 text-cyan-400" />
                    <span>Apply Prompt to Video Studio</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">
              {m.role === 'assistant' ? `${m.model || 'Director'}` : 'You'}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
            <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
            <span>Director is planning cinematic breakdown...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-col space-y-1">
          {starterPrompts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(s);
              }}
              className="text-[11px] text-left text-slate-400 hover:text-slate-200 bg-[#121524] hover:bg-[#181d32] border border-[#20263d] px-2.5 py-1.5 rounded-lg truncate transition-colors"
            >
              &rarr; {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 bg-[#0e1222] border-t border-[#1f263d]">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Director AI about scenes, lighting, Veo prompts..."
            className="flex-1 bg-[#14192b] border border-[#242b46] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
