import React, { useState } from 'react';
import {
  ListOrdered,
  Plus,
  Play,
  Pause,
  Clock,
  Users,
  CheckCircle2,
  Edit2,
  Zap,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AutomatedSequence } from '../types';

export const SequencesPage: React.FC = () => {
  const { sequences } = useApp();
  const [sequenceList, setSequenceList] = useState<AutomatedSequence[]>(sequences);

  const toggleSequenceStatus = (id: string) => {
    setSequenceList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider">
            <ListOrdered className="w-4 h-4" />
            Automated WhatsApp Workflow Engine
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Welcome & Follow-up Sequences
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Configure automated multi-step WhatsApp messaging workflows triggered by student enrollment, 
            missed live sessions, or payment due dates.
          </p>
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-slate-900 text-emerald-400 font-bold text-xs flex items-center gap-2 border border-slate-800 shadow-md">
          <Plus className="w-4 h-4" /> Create Custom Workflow
        </button>
      </div>

      {/* Sequences List */}
      <div className="space-y-4">
        {sequenceList.map((seq) => (
          <div
            key={seq.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {seq.id}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{seq.name}</h3>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      seq.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {seq.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{seq.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleSequenceStatus(seq.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    seq.status === 'active'
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  {seq.status === 'active' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pause Sequence
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Activate Sequence
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Template Body Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Template Content Preview:
                </span>
                <p className="font-mono text-slate-800 leading-relaxed text-[11px]">
                  "{seq.templateText}"
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Trigger Delay:
                  </span>
                  <span className="font-semibold text-slate-900">{seq.delay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Active Recipients:
                  </span>
                  <span className="font-mono font-bold text-emerald-600">{seq.activeStudents} Students</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Steps Count:</span>
                  <span className="font-semibold text-slate-900">{seq.stepsCount} Messages</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
