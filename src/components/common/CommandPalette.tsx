import React, { useState, useEffect } from 'react';
import { Search, X, LayoutDashboard, MessageSquare, Sparkles, BookOpen, Send, GraduationCap, Settings, Command } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, setActiveTab, faqs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const pages: { id: NavigationTab; title: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', title: 'Executive Dashboard', desc: 'Overview metrics & analytics', icon: <LayoutDashboard className="w-4 h-4 text-emerald-500" /> },
    { id: 'simulator', title: 'WhatsApp Live Inbox', desc: 'Manage live student chats & AI responses', icon: <MessageSquare className="w-4 h-4 text-blue-500" /> },
    { id: 'playground', title: 'AI Grounding Sandbox', desc: 'Test queries against grounding knowledge base', icon: <Sparkles className="w-4 h-4 text-cyan-500" /> },
    { id: 'kb', title: 'FAQ Knowledge Base', desc: 'Manage 136 approved FAQ answers', icon: <BookOpen className="w-4 h-4 text-cyan-500" /> },
    { id: 'lms', title: 'LMS Webhook Engine', icon: <Send className="w-4 h-4 text-amber-500" />, desc: 'Simulate broadcasting LMS notifications' },
    { id: 'courses', title: 'Courses & Recommender', desc: 'Explore online class catalog & AI quiz', icon: <GraduationCap className="w-4 h-4 text-emerald-500" /> },
    { id: 'settings', title: 'Settings & Meta Cloud API', desc: 'Configure strictness, business hours & tokens', icon: <Settings className="w-4 h-4 text-slate-500" /> }
  ];

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFaqs = faqs
    .filter((f) => f.question.toLowerCase().includes(searchTerm.toLowerCase()) || f.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase())))
    .slice(0, 5);

  const handleSelect = (tab: NavigationTab) => {
    setActiveTab(tab);
    setIsCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type a command, search pages, or query FAQs..."
            className="w-full text-sm outline-none text-slate-800 placeholder-slate-400 bg-transparent font-medium"
            autoFocus
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Navigation Pages */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Navigation & Actions
            </div>
            <div className="space-y-1 mt-1">
              {filteredPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handleSelect(page.id)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white shadow-2xs">
                      {page.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{page.title}</div>
                      <div className="text-[11px] text-slate-500">{page.desc}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono group-hover:text-emerald-600 font-medium">
                    Jump to →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick FAQ Matches */}
          {searchTerm.trim().length > 0 && filteredFaqs.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching FAQs ({filteredFaqs.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    onClick={() => {
                      setActiveTab('kb');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-300 cursor-pointer text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{faq.question}</span>
                      <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-mono">
                        {faq.id}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-1 text-[11px]">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Command className="w-3.5 h-3.5 text-slate-400" />
            Press <kbd className="bg-white px-1 py-0.5 border rounded text-[10px] font-mono">ESC</kbd> to close
          </span>
          <span className="text-slate-400">136 Approved FAQs indexed</span>
        </div>
      </div>
    </div>
  );
};
