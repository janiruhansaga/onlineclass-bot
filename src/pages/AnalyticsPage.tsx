import React from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Target,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AnalyticsPage: React.FC = () => {
  const { faqs, chats, escalations, activityLogs } = useApp();

  const totalChats = chats.length;
  const pendingEscalations = escalations.filter((e) => e.status === 'pending').length;
  const resolvedChats = totalChats - pendingEscalations;
  const accuracyPercentage = Math.round((resolvedChats / (totalChats || 1)) * 100);

  // Group FAQs by category count
  const categoryCounts: Record<string, number> = {};
  faqs.forEach((f) => {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
        <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider">
          <BarChart3 className="w-4 h-4" />
          Accuracy & Performance Metrics
        </div>
        <h1 className="text-xl font-bold text-slate-900">Analytics & Resolution Metrics</h1>
        <p className="text-xs text-slate-500 max-w-2xl">
          Comprehensive evaluation of AI grounding accuracy, response latency, human handoff ratios, 
          and knowledge base coverage across all online course modules.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Grounded Match Accuracy
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-2">{accuracyPercentage}%</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Strict FAQ Grounding</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average Latency
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-2">600 ms</div>
          <div className="text-xs text-cyan-600 font-medium mt-1">Simulated Typing Delay</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Approved FAQs
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-2">{faqs.length} FAQs</div>
          <div className="text-xs text-indigo-600 font-medium mt-1">9 Categorized Modules</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Human Handoff Ratio
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-2">
            {Math.round((pendingEscalations / (totalChats || 1)) * 100)}%
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">Escalated Queries</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-500" />
          Approved FAQ Knowledge Base Coverage (136 FAQs)
        </h3>

        <div className="space-y-3">
          {Object.entries(categoryCounts).map(([cat, count]) => {
            const percentage = Math.round((count / faqs.length) * 100);
            return (
              <div key={cat} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-medium text-slate-800">
                  <span>{cat}</span>
                  <span className="font-mono text-slate-500">{count} FAQs ({percentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${percentage * 4}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
