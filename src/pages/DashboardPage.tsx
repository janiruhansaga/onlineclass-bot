import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  UserCheck,
  GraduationCap,
  Send,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Bot,
  Zap,
  BookOpen,
  Plus,
  Sliders,
  Clock,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Activity,
  Layers,
  RotateCcw,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WhatsAppQrCard } from '../components/common/WhatsAppQrCard';


export const DashboardPage: React.FC = () => {
  const {
    chats,
    faqs,
    escalations,
    sequences,
    lmsLogs,
    settings,
    setActiveTab,
    setActiveChatId,
    addFaq
  } = useApp();

  const [selectedDay, setSelectedDay] = useState<number>(3); // Default Thursday
  const [quickFaqModal, setQuickFaqModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('Admissions & Enrollment');

  // Greeting based on time
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning, Admin' : currentHour < 18 ? 'Good afternoon, Admin' : 'Good evening, Admin';
  const formattedDateTime = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Weekly conversation chart data (Mon-Sun)
  const chartData = [
    { day: 'Mon', total: 165, ai: 122, human: 43 },
    { day: 'Tue', total: 198, ai: 145, human: 53 },
    { day: 'Wed', total: 210, ai: 156, human: 54 },
    { day: 'Thu', total: 245, ai: 178, human: 67 },
    { day: 'Fri', total: 230, ai: 169, human: 61 },
    { day: 'Sat', total: 130, ai: 92, human: 38 },
    { day: 'Sun', total: 106, ai: 72, human: 34 },
  ];

  const activeDayData = chartData[selectedDay];

  const handleQuickAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    addFaq({
      question: newQuestion,
      answer: newAnswer,
      category: newCategory,
      keywords: newQuestion.toLowerCase().split(' ').slice(0, 4),
      isGrounded: true
    });
    setNewQuestion('');
    setNewAnswer('');
    setQuickFaqModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              OnlineClass Bot Connected ({settings.botPhoneNumber || '+94789049004'})
            </span>
            <span className="text-slate-400 text-xs font-mono">{formattedDateTime}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {greeting}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Your AI support agent is operating normally. Grounded response rate is optimal.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('simulator')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs shadow-md transition-all flex items-center gap-2 border border-slate-800"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            Open WhatsApp Live Inbox
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
            AI Sandbox
          </button>
        </div>
      </div>

      {/* WHATSAPP WEB QR PAIRING LINKER */}
      <WhatsAppQrCard />

      {/* 2. TOP KPI CARDS (5 CARDS GRID) */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Conversations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Conversations</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">1,284</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4%</span>
            <span className="text-slate-400 font-normal ml-0.5">vs last week</span>
          </div>
        </div>

        {/* KPI 2: AI Resolved */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">AI Resolved</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">934</div>
          <div className="flex items-center gap-1 text-[11px] text-cyan-600 font-semibold mt-1">
            <span>72.7%</span>
            <span className="text-slate-400 font-normal ml-0.5">resolution rate</span>
          </div>
        </div>

        {/* KPI 3: Pending Human Review */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Review</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">23</div>
          <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-1">
            <AlertCircle className="w-3 h-3" />
            <span>Requires action</span>
          </div>
        </div>

        {/* KPI 4: Course Enquiries */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Course Enquiries</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">317</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12.8%</span>
            <span className="text-slate-400 font-normal ml-0.5">vs last week</span>
          </div>
        </div>

        {/* KPI 5: LMS Notifications */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">LMS Notifications</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">486</div>
          <div className="flex items-center gap-1 text-[11px] text-purple-600 font-semibold mt-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% delivered</span>
          </div>
        </div>
      </div>

      {/* 3. ROW 1: CONVERSATION ACTIVITY CHART + QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Conversation Activity Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Conversation Activity Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Weekly conversation volume, AI automated resolutions, and human handoffs
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span> Total ({activeDayData.total})
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> AI Resolved ({activeDayData.ai})
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Handoff ({activeDayData.human})
              </span>
            </div>
          </div>

          {/* Interactive Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100 pb-2">
            {chartData.map((item, idx) => {
              const heightPercent = (item.total / 260) * 100;
              const aiPercent = (item.ai / item.total) * 100;
              const isSelected = idx === selectedDay;

              return (
                <div
                  key={item.day}
                  onClick={() => setSelectedDay(idx)}
                  className={`flex-1 flex flex-col items-center gap-2 cursor-pointer group transition-all ${
                    isSelected ? 'opacity-100 scale-105' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-slate-900">
                    {item.total}
                  </div>

                  <div className="w-full bg-slate-100 rounded-xl overflow-hidden relative flex flex-col justify-end p-0.5" style={{ height: `${heightPercent}%` }}>
                    {/* Human Handoff Portion */}
                    <div
                      className="w-full bg-amber-400 rounded-t-lg transition-all"
                      style={{ height: `${100 - aiPercent}%` }}
                    ></div>
                    {/* AI Resolved Portion */}
                    <div
                      className="w-full bg-emerald-500 rounded-b-lg transition-all"
                      style={{ height: `${aiPercent}%` }}
                    ></div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-lg transition-all ${
                      isSelected ? 'bg-slate-900 text-emerald-400' : 'text-slate-600 group-hover:bg-slate-100'
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-medium">
            <span>Selected Day: <strong className="text-slate-900 font-bold">{activeDayData.day}</strong></span>
            <span>
              Resolution Rate:{' '}
              <strong className="text-emerald-600 font-mono font-bold">
                {Math.round((activeDayData.ai / activeDayData.total) * 100)}%
              </strong>
            </span>
          </div>
        </div>

        {/* Quick Actions Section (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-500" />
              Quick Actions
            </h3>
            <p className="text-xs text-slate-500">Instantly execute common administrative tasks</p>
          </div>

          <div className="space-y-2.5">
            {/* Action 1: New FAQ */}
            <button
              onClick={() => setQuickFaqModal(true)}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">New FAQ</div>
                  <div className="text-[11px] text-slate-500">Add an approved FAQ entry</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </button>

            {/* Action 2: Add Course */}
            <button
              onClick={() => setActiveTab('courses')}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Add Course</div>
                  <div className="text-[11px] text-slate-500">Manage course catalog & schedules</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </button>

            {/* Action 3: Create Automation */}
            <button
              onClick={() => setActiveTab('sequences')}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700 group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Create Automation</div>
                  <div className="text-[11px] text-slate-500">Configure welcome & alert sequences</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
            </button>

            {/* Action 4: Test AI Conversation */}
            <button
              onClick={() => setActiveTab('simulator')}
              className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-left transition-all flex items-center justify-between group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Test AI Conversation</div>
                  <div className="text-[11px] text-slate-400">Launch live WhatsApp simulator</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. ROW 2: RECENT CONVERSATIONS + AI PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Conversations Panel (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                Recent Student Conversations
              </h3>
              <p className="text-xs text-slate-500">Active simulated student chats & resolution statuses</p>
            </div>

            <button
              onClick={() => setActiveTab('simulator')}
              className="text-xs text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-1"
            >
              All Simulator Chats →
            </button>
          </div>

          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  setActiveTab('simulator');
                }}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={chat.avatar}
                      alt={chat.customerName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    {chat.unreadCount > 0 && (
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -top-0.5 -right-0.5 animate-ping"></span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900">{chat.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{chat.phoneNumber}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          chat.mode === 'ai' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {chat.mode === 'ai' ? 'AI Grounded' : 'Human Escalated'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 truncate font-sans">
                      "{chat.lastMessage}"
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="inline-block bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                        Interest: {chat.courseName || 'General Inquiry'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">{chat.lastMessageTime}</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 justify-end mt-1.5 group-hover:translate-x-1 transition-transform">
                    Open <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Performance Card (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              AI Grounding Performance
            </h3>
            <p className="text-xs text-slate-500">Core accuracy & latency metrics</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Metric 1: Resolution Rate */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Resolution Rate</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">72.7%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72.7%' }}></div>
              </div>
            </div>

            {/* Metric 2: FAQ Accuracy */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">FAQ Accuracy Rate</span>
                <span className="font-mono font-bold text-cyan-600 text-sm">98.4%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '98.4%' }}></div>
              </div>
            </div>

            {/* Metric 3: Human Handoff Rate */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Human Handoff Rate</span>
                <span className="font-mono font-bold text-amber-600 text-sm">27.3%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '27.3%' }}></div>
              </div>
            </div>

            {/* Metric 4: Avg Response Time */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[11px] block">Average Response Time</span>
                <span className="font-mono text-base font-extrabold text-slate-900">0.6s</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-md">
                ⚡ Instant Engine
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ROW 3: AUTOMATION STATUS + KNOWLEDGE BASE HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Automation Status Card (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              Automation Workflows Status
            </h3>
            <p className="text-xs text-slate-500">Live operational status of WhatsApp messaging sequences</p>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { name: 'Welcome Sequence', desc: 'Onboarding & LMS login', status: 'Active' },
              { name: 'Course Guidance', desc: 'AI Course Recommender Quiz', status: 'Active' },
              { name: 'Follow-up Sequence', desc: 'Payment & missed class alerts', status: 'Active' },
              { name: 'LMS Notifications', desc: 'Broadcast recording webhooks', status: 'Active' },
            ].map((auto, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900">{auto.name}</div>
                  <div className="text-[10px] text-slate-500">{auto.desc}</div>
                </div>
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {auto.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Base Health Card (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-500" />
                Knowledge Base Health & Integrity
              </h3>
              <p className="text-xs text-slate-500">Status of approved FAQ dataset (136 total entries)</p>
            </div>

            <button
              onClick={() => setActiveTab('kb')}
              className="text-xs text-cyan-600 font-bold hover:text-cyan-700 flex items-center gap-1"
            >
              Inspect Knowledge Base Registry →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-emerald-800 font-bold text-base font-mono">136 Approved</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">Fully Grounded FAQs</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-900 font-bold text-base font-mono">0 Unapproved</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Zero Hallucination Risk</div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200">
              <div className="text-cyan-900 font-bold text-base font-mono">8 Updated</div>
              <div className="text-[11px] text-cyan-800 mt-0.5">Recently Modified FAQs</div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="text-indigo-900 font-bold text-xs font-mono">Today 02:45 AM</div>
              <div className="text-[11px] text-indigo-700 mt-0.5">Last Synced Time</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between border border-slate-800">
            <span className="flex items-center gap-2 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Knowledge Base grounding is 100% active. Out-of-scope prompts safely trigger human escalation.
            </span>
            <span className="text-[10px] text-slate-400 font-mono">v2.4 Grounded KB</span>
          </div>
        </div>
      </div>

      {/* QUICK ADD FAQ MODAL */}
      {quickFaqModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                Add Approved FAQ Entry
              </h3>
              <button onClick={() => setQuickFaqModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddFaq} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Admissions & Enrollment">Admissions & Enrollment</option>
                  <option value="Class Schedules & Timetables">Class Schedules & Timetables</option>
                  <option value="Fees, Payments & Installments">Fees, Payments & Installments</option>
                  <option value="LMS, Portal & Tech Support">LMS, Portal & Tech Support</option>
                  <option value="Zoom Links & Class Recordings">Zoom Links & Class Recordings</option>
                  <option value="Courses & Syllabus">Courses & Syllabus</option>
                  <option value="Certificates & Exams">Certificates & Exams</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Student Question</label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. When is the deadline for Python enrollment?"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Approved Grounded Answer</label>
                <textarea
                  rows={3}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Enter the official approved answer..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickFaqModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-600 transition-all shadow-md"
                >
                  Save FAQ Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
