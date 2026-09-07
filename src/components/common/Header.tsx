import React, { useState } from 'react';
import {
  Bell,
  Search,
  Command,
  ChevronRight,
  Menu,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    setIsCommandPaletteOpen,
    escalations,
    resetAllData
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const pendingEscalations = escalations.filter((e) => e.status === 'pending');

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Executive Dashboard';
      case 'simulator': return 'WhatsApp Live Inbox & Bot Management Console';
      case 'playground': return 'AI Grounding Playground';
      case 'kb': return 'FAQ Knowledge Base (136 Approved FAQs)';
      case 'escalations': return 'Human Escalation Queue';
      case 'lms': return 'LMS Webhook Simulator';
      case 'courses': return 'Course Catalog & AI Recommender';
      case 'sequences': return 'Automated Message Sequences';
      case 'analytics': return 'Performance & Accuracy Analytics';
      case 'settings': return 'System Settings & API Readiness';
      case 'logs': return 'System Audit Logs';
      default: return 'Overview';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Sidebar toggle & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-medium text-slate-700">Online Class Bot</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-900">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      {/* Right: Search, Actions, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Command Palette Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-all border border-slate-200"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick actions & search...</span>
          <kbd className="bg-white px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-300 shadow-2xs text-slate-500">
            Ctrl K
          </kbd>
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (confirm('Reset demo state back to default 136 FAQs and mock chats?')) {
              resetAllData();
            }
          }}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1.5"
          title="Reset Demo Data"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span className="hidden lg:inline text-xs text-slate-600 font-medium">Reset Demo</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Notifications & Escalations"
          >
            <Bell className="w-5 h-5" />
            {pendingEscalations.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {pendingEscalations.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Escalation Alerts ({pendingEscalations.length})
                </h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              {pendingEscalations.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
                  <span>No pending escalations! All AI responses are grounded.</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {pendingEscalations.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{ticket.customerName}</span>
                        <span className="text-[10px] text-amber-700 bg-amber-200 px-1.5 py-0.5 rounded font-mono">
                          {ticket.reason}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-1 mt-1 font-mono text-[11px]">
                        "{ticket.userQuery}"
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {ticket.createdAt}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs shadow-xs border border-slate-700">
            AI
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">Support Admin</div>
            <div className="text-[10px] text-emerald-600 font-medium">Demo Mode Engine</div>
          </div>
        </div>
      </div>
    </header>
  );
};
