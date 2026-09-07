import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  BookOpen,
  UserCheck,
  Send,
  GraduationCap,
  ListOrdered,
  BarChart3,
  Settings,
  History,
  Bot,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, isSidebarCollapsed, escalations, faqs } = useApp();

  const pendingEscalations = escalations.filter((e) => e.status === 'pending').length;

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'simulator', label: 'Chat Simulator', icon: <MessageSquare className="w-5 h-5" />, badge: 'LIVE', badgeColor: 'bg-emerald-500' },
    { id: 'playground', label: 'AI Playground', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'kb', label: 'FAQ Base (136)', icon: <BookOpen className="w-5 h-5" />, badge: faqs.length, badgeColor: 'bg-cyan-500/20 text-cyan-300' },
    { id: 'escalations', label: 'Human Escalations', icon: <UserCheck className="w-5 h-5" />, badge: pendingEscalations > 0 ? pendingEscalations : undefined, badgeColor: 'bg-rose-500' },
    { id: 'lms', label: 'LMS Webhook Engine', icon: <Send className="w-5 h-5" /> },
    { id: 'courses', label: 'Courses & AI Recommender', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'sequences', label: 'Automated Sequences', icon: <ListOrdered className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics & Accuracy', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings & Meta API', icon: <Settings className="w-5 h-5" /> },
    { id: 'logs', label: 'Audit Activity Logs', icon: <History className="w-5 h-5" /> },
  ];

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-200 z-40 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/10 shrink-0">
          <Bot className="w-5 h-5 text-slate-950" />
        </div>
        {!isSidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-white text-sm tracking-tight truncate flex items-center gap-1.5">
              OnlineClass AI
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </h1>
            <p className="text-[10px] text-slate-400 font-mono truncate">WhatsApp Support Bot</p>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <span className={`shrink-0 ${isActive ? 'text-slate-950' : 'group-hover:text-emerald-400 transition-colors'}`}>
                {item.icon}
              </span>
              {!isSidebarCollapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
              {!isSidebarCollapsed && item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                    isActive ? 'bg-slate-950 text-emerald-400' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info / Mode Status */}
      {!isSidebarCollapsed && (
        <div className="p-3 m-2 rounded-xl bg-slate-850 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span>Meta API Readiness</span>
            <span className="text-[10px] bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
              Demo Mode
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Local WhatsApp engine fully active. Swappable to Meta Cloud API.
          </p>
        </div>
      )}
    </aside>
  );
};
