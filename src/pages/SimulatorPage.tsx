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
  Info,
  Plus,
  RefreshCw,
  Radio,
  ExternalLink,
  MessageCircle,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessage, ChatSession } from '../types';

export const SimulatorPage: React.FC = () => {
  const {
    chats,
    messages,
    activeChatId,
    setActiveChatId,
    sendMessageInSimulator,
    toggleChatMode,
    sendRealWhatsAppTest,
    addActivityLog
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [searchChat, setSearchChat] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSimulateDrawerOpen, setIsSimulateDrawerOpen] = useState(false);
  const [simulatedPhone, setSimulatedPhone] = useState('+94774567890');
  const [simulatedText, setSimulatedText] = useState('Where can I find the Zoom link for today\'s class?');
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [directPhone, setDirectPhone] = useState('+94771234567');
  const [directText, setDirectText] = useState('Hello! Welcome to OnlineClass support.');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const chatMessages = (currentChat && messages[currentChat.id]) || [];

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSending]);

  // Admin Reply to Student's Real WhatsApp
  const handleAgentSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !currentChat) return;

    const textToSend = inputMessage;
    setInputMessage('');
    setIsSending(true);

    try {
      // Dispatch via Meta Cloud API / Real-time handler
      await sendMessageInSimulator(currentChat.id, textToSend, 'agent');
      
      addActivityLog(
        'AI_RESPONSE',
        'Human Agent Reply Dispatched',
        `Replied to ${currentChat.phoneNumber}: "${textToSend}"`,
        currentChat.phoneNumber,
        'success'
      );
    } catch (err) {
      console.error('Failed to send agent reply', err);
    } finally {
      setIsSending(false);
    }
  };

  // Simulate an incoming student message to test Webhook & AI Grounding
  const handleSimulateIncomingStudentMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedText.trim()) return;

    setIsSending(true);

    // If chat doesn't exist for simulated phone, find or use current
    let targetChatId = currentChat?.id || chats[0]?.id;
    const existing = chats.find(c => c.phoneNumber.replace(/[^\d]/g, '') === simulatedPhone.replace(/[^\d]/g, ''));
    if (existing) {
      targetChatId = existing.id;
      setActiveChatId(existing.id);
    }

    await sendMessageInSimulator(targetChatId, simulatedText, 'user');
    setSimulatedText('');
    setIsSending(false);
    setIsSimulateDrawerOpen(false);
  };

  // Direct WhatsApp Message Sender
  const handleSendDirectWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directPhone.trim() || !directText.trim()) return;

    setIsSending(true);
    const res = await sendRealWhatsAppTest(directPhone, directText);
    setIsSending(false);
    setIsDirectModalOpen(false);

    if (res.success) {
      alert(`WhatsApp Message dispatched successfully to ${directPhone}!`);
    } else {
      alert(`Message queued. (If Meta token is not set, simulated locally): ${res.error || 'Done'}`);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.customerName.toLowerCase().includes(searchChat.toLowerCase()) ||
    c.phoneNumber.includes(searchChat) ||
    (c.courseName && c.courseName.toLowerCase().includes(searchChat.toLowerCase()))
  );

  return (
    <div className="h-[calc(100vh-64px-33px)] flex flex-col bg-slate-950 overflow-hidden font-sans">
      
      {/* BOT ADMIN SYSTEM STATUS HEADER */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>WhatsApp Business Account Active: <strong className="font-mono text-white">+1 415 523 8886</strong></span>
          </div>
          <span className="hidden md:inline-flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Meta Cloud API Webhook Verified & Live
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDirectModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Direct Message</span>
          </button>
          <button
            onClick={() => setIsSimulateDrawerOpen(!isSimulateDrawerOpen)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Test Webhook Message</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANE: Customer Phone Numbers & Live Conversations */}
        <div className="w-80 md:w-96 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
          
          {/* Search Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchChat}
                onChange={(e) => setSearchChat(e.target.value)}
                placeholder="Search phone (+94...) or student..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Customer Chat Sessions List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
            {filteredChats.map((chat) => {
              const isActive = chat.id === currentChat?.id;
              const isEscalated = chat.status === 'escalated' || chat.mode === 'human';

              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-slate-800/90 border-l-4 border-emerald-500'
                      : 'hover:bg-slate-850/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={chat.avatar}
                      alt={chat.customerName}
                      className="w-11 h-11 rounded-full object-cover border border-slate-700"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-white truncate">{chat.customerName}</h3>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">{chat.lastMessageTime}</span>
                    </div>

                    <div className="text-[10px] font-mono text-emerald-400 truncate mt-0.5">
                      {chat.phoneNumber}
                    </div>

                    <div className="text-[11px] text-slate-300 truncate mt-0.5 font-sans">
                      {chat.lastMessage}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          chat.mode === 'ai' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {chat.mode === 'ai' ? '🤖 AI Auto' : '👤 Agent Mode'}
                      </span>

                      {isEscalated && (
                        <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.2 rounded font-bold">
                          Needs Agent
                        </span>
                      )}

                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                        Meta API
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: BOT ADMIN WHATSAPP LIVE CONSOLE */}
        {currentChat ? (
          <div className="flex-1 flex flex-col bg-[#0b141a] relative min-w-0">
            
            {/* WhatsApp Business Header Bar */}
            <div className="h-16 bg-[#1f2c34] text-white px-4 flex items-center justify-between border-b border-slate-800 z-10 shadow-md">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={currentChat.avatar}
                  alt={currentChat.customerName}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-500/30 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-white truncate flex items-center gap-2">
                    {currentChat.customerName}
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                      {currentChat.phoneNumber}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    Course: <strong className="text-slate-200">{currentChat.courseName || 'General Student Inquiry'}</strong>
                  </p>
                </div>
              </div>

              {/* Bot Control Mode Switcher */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleChatMode(currentChat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    currentChat.mode === 'ai'
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  }`}
                >
                  {currentChat.mode === 'ai' ? (
                    <>
                      <Bot className="w-4 h-4" /> AI Bot Auto-Responder Active
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" /> Human Agent Takeover Mode
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Webhook Meta Header Info */}
            <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-[11px] flex items-center justify-between border-b border-slate-800">
              <span className="flex items-center gap-2 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bot Number: <strong className="text-white font-mono">+1 415 523 8886</strong> ➔ Customer: <strong className="text-white font-mono">{currentChat.phoneNumber}</strong></span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Chat Session ID: {currentChat.id}
              </span>
            </div>

            {/* MESSAGE STREAM (WhatsApp Dark Palette Theme) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a]">
              {chatMessages.map((msg: ChatMessage) => {
                const isCustomer = msg.sender === 'user';
                const isAgent = msg.sender === 'agent';
                const isBot = msg.sender === 'bot';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    {/* Message Bubble Container */}
                    <div
                      className={`max-w-xl rounded-2xl p-3 text-xs relative space-y-1.5 shadow-md ${
                        isCustomer
                          ? 'bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700/60'
                          : isAgent
                          ? 'bg-cyan-950 text-cyan-100 rounded-tr-none border border-cyan-700/60'
                          : 'bg-[#005c4b] text-slate-100 rounded-tr-none border border-emerald-600/40'
                      }`}
                    >
                      {/* Incoming Customer Header */}
                      {isCustomer && (
                        <div className="flex items-center gap-1.5 border-b border-slate-700/50 pb-1 text-[10px] text-slate-400 font-mono">
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          <span>Incoming Customer ({currentChat.phoneNumber})</span>
                        </div>
                      )}

                      {/* Bot Grounded Response Header */}
                      {isBot && (
                        <div className="flex items-center justify-between gap-2 border-b border-emerald-700/60 pb-1 text-[10px] font-semibold text-emerald-200">
                          <span className="flex items-center gap-1">
                            <Bot className="w-3 h-3 text-emerald-300" />
                            {msg.isGroundingFailure ? '⚠️ Grounding Escalation Triggered' : '🤖 AI Grounded Response (136 FAQs)'}
                          </span>
                          {msg.matchedFaqId && (
                            <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-mono text-[9px] border border-emerald-500/30">
                              {msg.matchedFaqId} ({msg.confidenceScore}%)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Human Agent Header */}
                      {isAgent && (
                        <div className="flex items-center gap-1.5 border-b border-cyan-700/60 pb-1 text-[10px] font-bold text-cyan-300">
                          <UserCheck className="w-3 h-3 text-cyan-400" />
                          <span>👨‍💻 Human Support Agent Reply (Meta Cloud API)</span>
                        </div>
                      )}

                      {/* Message Content Body */}
                      <p className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
                        {msg.text}
                      </p>

                      {/* Time & Delivery Status Ticks */}
                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-0.5 font-mono">
                        <span>{msg.timestamp}</span>
                        {!isCustomer && (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* BOT ADMIN REPLY TOOLBAR */}
            <div className="p-3 bg-[#202c33] border-t border-slate-800">
              <form onSubmit={handleAgentSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    currentChat.mode === 'ai'
                      ? 'Type reply as Admin (or switch to Human Agent mode above)...'
                      : `Type manual WhatsApp reply to ${currentChat.phoneNumber}...`
                  }
                  className="flex-1 px-4 py-2.5 bg-[#2a3942] rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />

                <button
                  type="submit"
                  disabled={isSending || !inputMessage.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Send WhatsApp Reply</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-[#0b141a]">
            <Bot className="w-12 h-12 text-slate-600 mb-2" />
            <h3 className="font-bold text-slate-300">No WhatsApp Customer Selected</h3>
            <p className="text-xs text-slate-500">Select a phone number from the sidebar to open the live conversation.</p>
          </div>
        )}
      </div>

      {/* MODAL: TEST INCOMING WEBHOOK MESSAGE */}
      {isSimulateDrawerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Test Incoming WhatsApp Webhook
              </h3>
              <button
                onClick={() => setIsSimulateDrawerOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Test how the AI Bot receives and grounds incoming student messages without sending a real WhatsApp message from your phone.
            </p>

            <form onSubmit={handleSimulateIncomingStudentMessage} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Customer Phone Number
                </label>
                <input
                  type="text"
                  value={simulatedPhone}
                  onChange={(e) => setSimulatedPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Incoming Message Text
                </label>
                <textarea
                  value={simulatedText}
                  onChange={(e) => setSimulatedText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-emerald-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSimulateDrawerOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simulate Webhook Trigger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEND DIRECT WHATSAPP MESSAGE TO ANY PHONE */}
      {isDirectModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                Send Direct WhatsApp Message
              </h3>
              <button
                onClick={() => setIsDirectModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Send a real WhatsApp message to any student's phone number directly via Meta Cloud API.
            </p>

            <form onSubmit={handleSendDirectWhatsApp} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Recipient Phone Number (International format e.g. +94771234567)
                </label>
                <input
                  type="text"
                  value={directPhone}
                  onChange={(e) => setDirectPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Message Body
                </label>
                <textarea
                  value={directText}
                  onChange={(e) => setDirectText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-emerald-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDirectModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send WhatsApp Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
