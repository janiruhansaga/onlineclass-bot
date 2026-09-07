import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ActivityLogsPage: React.FC = () => {
  const { activityLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSev = severityFilter === 'all' || log.severity === severityFilter;
    const matchesSearch =
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userOrPhone && log.userOrPhone.includes(searchTerm));
    return matchesSev && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
        <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider">
          <History className="w-4 h-4" />
          System Audit & Decisions Log
        </div>
        <h1 className="text-xl font-bold text-slate-900">Audit Activity Logs</h1>
        <p className="text-xs text-slate-500 max-w-2xl">
          Complete historical audit trail of AI grounding decisions, human escalations, LMS webhook executions, and settings changes.
        </p>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search logs by title, description, or phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {['all', 'info', 'success', 'warning', 'error'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                severityFilter === sev
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Log List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 text-xs">
              <span
                className={`p-2 rounded-xl text-slate-900 shrink-0 mt-0.5 ${
                  log.severity === 'success'
                    ? 'bg-emerald-100 text-emerald-800'
                    : log.severity === 'warning'
                    ? 'bg-amber-100 text-amber-800'
                    : log.severity === 'error'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                <Zap className="w-4 h-4" />
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.title}</span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono font-bold">
                      {log.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                  {log.description}
                </p>
                {log.userOrPhone && (
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">
                    Actor / Phone: {log.userOrPhone}
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              No audit log events match your query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
