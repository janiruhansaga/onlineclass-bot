import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  MessageSquare,
  X,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EscalationTicket } from '../types';

export const EscalationsPage: React.FC = () => {
  const { escalations, resolveEscalation, setActiveChatId, setActiveTab } = useApp();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('pending');
  const [selectedTicket, setSelectedTicket] = useState<EscalationTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredTickets = escalations.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    resolveEscalation(selectedTicket.id, resolutionNotes);
    setSelectedTicket(null);
    setResolutionNotes('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            Human Agent Escalation Queue
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Escalations & Unresolved Tickets ({escalations.length})
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            When queries fall below the grounding confidence threshold or involve sensitive security topics, 
            the AI creates an escalation event for human agent review.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['pending', 'in_progress', 'resolved', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-3 relative flex flex-col justify-between ${
              ticket.status === 'pending'
                ? 'border-amber-200 bg-amber-50/20'
                : ticket.status === 'resolved'
                ? 'border-emerald-200'
                : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="font-mono text-xs font-bold text-slate-700">{ticket.id}</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    ticket.priority === 'high'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {ticket.priority} Priority
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">{ticket.customerName}</h3>
                <p className="text-[11px] text-slate-500 font-mono">{ticket.phoneNumber}</p>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  User Query (Triggered Escalation):
                </span>
                <p className="text-slate-800 font-medium italic">"{ticket.userQuery}"</p>
                <div className="text-[10px] text-rose-700 font-semibold pt-1">
                  Reason: {ticket.reason}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setActiveChatId(ticket.chatId);
                  setActiveTab('simulator');
                }}
                className="text-xs text-cyan-600 font-semibold hover:text-cyan-700 flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Jump to Chat
              </button>

              {ticket.status !== 'resolved' ? (
                <button
                  onClick={() => setSelectedTicket(ticket)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-xs transition-colors"
                >
                  Resolve Ticket
                </button>
              ) : (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredTickets.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
            <h3 className="font-bold text-slate-700">No Escalation Tickets Found</h3>
            <p className="text-xs">No tickets match the selected "{statusFilter}" filter.</p>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Resolve Ticket ({selectedTicket.id})
              </h3>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolve} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">{selectedTicket.customerName}</span>
                <p className="text-slate-600 italic font-mono text-[11px] mt-1">
                  "{selectedTicket.userQuery}"
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Resolution Notes / Action Taken</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Contacted student via WhatsApp and provided custom schedule info."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-600 transition-all shadow-md"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
