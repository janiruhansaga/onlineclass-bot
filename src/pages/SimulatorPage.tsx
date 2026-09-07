import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Search,
  Bot,
  UserCheck,
  CheckCheck,
  Sparkles,
  AlertTriangle,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';

export const SimulatorPage: React.FC = () => {
  const {
    chats,
    messages,
    activeChatId,
    setActiveChatId,
    sendMessageInSimulator,
    toggleChatMode,
    faqs
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [searchChat, setSearchChat] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const chatMessages = (currentChat && messages[currentChat.id]) || [];

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const textToSend = overrideText || inputMessage;
    if (!textToSend.trim() || !currentChat) return;

    setInputMessage('');
    setIsTyping(true);

    await sendMessageInSimulator(currentChat.id, textToSend);

    setTimeout(() => {
      setIsTyping(false);
    }, 700);
  };

  const handleAgentSend = async () => {
    if (!inputMessage.trim() || !currentChat) return;
    const textToSend = inputMessage;
    setInputMessage('');
    await sendMessageInSimulator(currentChat.id, textToSend, 'agent');
  };

  const quickPrompts = [
    'Where can I find the Zoom link for today\'s class?',
    'Can I pay my course fees in monthly installments?',
    'When will class recordings be uploaded after live session?',
    'What are the class timings for weekday batches?',
    'Can you grant me admin password access for the server?' // Disallowed prompt to test escalation!
  ];

  const filteredChats = chats.filter((c) =>
    c.customerName.toLowerCase().includes(searchChat.toLowerCase()) ||
    c.phoneNumber.includes(searchChat) ||
    (c.courseName && c.courseName.toLowerCase().includes(searchChat.toLowerCase()))
  );

  return (
    <div className="h-[calc(100vh-64px-33px)] flex bg-slate-100 overflow-hidden font-sans">
      {/* LEFT PANE: Customer Chat List */}
      <div className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Chat List Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
              WA
            </div>
            <div>
              <h2 className="font-bold text-xs">WhatsApp Student Live Support</h2>
              <p className="text-[10px] text-emerald-400">Meta Cloud API Connected</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
            {chats.length} Active
          </span>
        </div>

        {/* Search Input */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchChat}
              onChange={(e) => setSearchChat(e.target.value)}
              placeholder="Search student or phone..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredChats.map((chat) => {
            const isActive = chat.id === currentChat?.id;
            return (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                  isActive ? 'bg-emerald-50/80 border-l-4 border-emerald-500' : 'hover:bg-slate-50'
                }`}
              >
                <img
                  src={chat.avatar}
                  alt={chat.customerName}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-900 truncate">{chat.customerName}</h3>
                    <span className="text-[10px] text-slate-400 shrink-0">{chat.lastMessageTime}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {chat.lastMessage}
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        chat.mode === 'ai' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {chat.mode === 'ai' ? 'AI Grounded' : 'Agent Takeover'}
                    </span>
                    {chat.status === 'escalated' && (
                      <span className="text-[9px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-bold">
                        Escalated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANE: WhatsApp Chat Window */}
      {currentChat ? (
        <div className="flex-1 flex flex-col bg-[#efeae2] relative min-w-0">
          {/* WhatsApp Chat Bar Header */}
          <div className="h-16 bg-[#075e54] text-white px-4 flex items-center justify-between shadow-md z-10">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={currentChat.avatar}
                alt={currentChat.customerName}
                className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-white truncate flex items-center gap-2">
                  {currentChat.customerName}
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-normal font-mono">
                    {currentChat.phoneNumber}
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-200 truncate">
                  Course: {currentChat.courseName || 'General Inquiry'} • {currentChat.batch || 'Batch A'}
                </p>
              </div>
            </div>

            {/* Actions: AI/Human Mode Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleChatMode(currentChat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  currentChat.mode === 'ai'
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                }`}
              >
                {currentChat.mode === 'ai' ? (
                  <>
                    <Bot className="w-3.5 h-3.5" /> AI Grounded Mode Active
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" /> Human Agent Mode
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Test Mode Notification Sub-Header */}
          <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-[11px] flex items-center justify-between border-b border-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              {currentChat.phoneNumber.includes('94783351453') || currentChat.id.startsWith('CHAT-REAL-') ? (
                <span>Live Meta WhatsApp Cloud API Channel Active (<strong className="text-white font-mono">+94783351453</strong>)</span>
              ) : (
                <span>Meta WhatsApp Cloud API & Grounded Engine (136 FAQs)</span>
              )}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Chat ID: {currentChat.id}
            </span>
          </div>

          {/* Message History Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg: ChatMessage) => {
              const isUser = msg.sender === 'user';
              const isAgent = msg.sender === 'agent';
              const isBot = msg.sender === 'bot';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-xl rounded-2xl p-3 shadow-xs text-xs relative text-slate-900 space-y-1.5 ${
                      isUser
                        ? 'bg-white rounded-tl-none border border-slate-200'
                        : isAgent
                        ? 'bg-cyan-100 rounded-tr-none border border-cyan-200'
                        : 'bg-[#d9fdd3] rounded-tr-none border border-emerald-200'
                    }`}
                  >
                    {/* Header Label for Bot Grounding Metadata */}
                    {isBot && (
                      <div className="flex items-center justify-between gap-2 border-b border-emerald-300/40 pb-1 text-[10px] font-semibold text-emerald-900">
                        <span className="flex items-center gap-1">
                          <Bot className="w-3 h-3 text-emerald-700" />
                          {msg.isGroundingFailure ? 'Grounding Escalation' : 'AI Grounded Response'}
                        </span>
                        {msg.matchedFaqId && (
                          <span className="bg-emerald-800 text-white px-1.5 py-0.2 rounded font-mono text-[9px]">
                            {msg.matchedFaqId} ({msg.confidenceScore}%)
                          </span>
                        )}
                      </div>
                    )}

                    {isAgent && (
                      <div className="text-[10px] font-bold text-cyan-900 border-b border-cyan-300/40 pb-1">
                        👨‍💻 Human Support Agent Response
                      </div>
                    )}

                    {/* Message Body Text */}
                    <p className="leading-relaxed whitespace-pre-wrap font-sans text-slate-900">
                      {msg.text}
                    </p>

                    {/* Timestamp & Status Ticks */}
                    <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 pt-0.5">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Simulated Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2 rounded-xl shadow-xs w-max border border-slate-200 animate-pulse">
                <Bot className="w-4 h-4 text-emerald-600" />
                <span>AI Bot is searching 136 approved FAQs...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Pills Bar */}
          <div className="bg-slate-100 p-2 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0 px-1">
              Sample Prompts:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(undefined, prompt)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-full text-slate-700 whitespace-nowrap text-[11px] transition-colors shrink-0 font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Toolbar */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shadow-lg"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                currentChat.mode === 'ai'
                  ? 'Type student message (AI will auto-match against 136 FAQs)...'
                  : 'Type message as Human Agent...'
              }
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
            />

            {currentChat.mode === 'ai' ? (
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-2.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center shrink-0"
                title="Send as Student (Trigger AI)"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAgentSend}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-1 shrink-0"
                title="Send as Human Agent"
              >
                <UserCheck className="w-4 h-4" /> Send Agent
              </button>
            )}
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
          <Bot className="w-12 h-12 text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-700">No Student Selected</h3>
          <p className="text-xs text-slate-500">Select a student from the sidebar to open the conversation simulator.</p>
        </div>
      )}
    </div>
  );
};
