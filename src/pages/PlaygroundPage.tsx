import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Sliders,
  HelpCircle,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { queryGroundedAI } from '../services/aiEngine';
import { GroundingCheckResult } from '../types';

export const PlaygroundPage: React.FC = () => {
  const { faqs, settings } = useApp();
  const [testQuery, setTestQuery] = useState('Where can I find the Zoom link for today\'s class?');
  const [threshold, setThreshold] = useState<number>(settings.aiStrictnessThreshold);
  const [result, setResult] = useState<GroundingCheckResult | null>(() =>
    queryGroundedAI(testQuery, faqs, threshold)
  );

  const handleTest = (queryToTest?: string) => {
    const q = queryToTest || testQuery;
    if (!q.trim()) return;
    const res = queryGroundedAI(q, faqs, threshold);
    setResult(res);
  };

  const presetQueries = [
    { title: 'Zoom Link Location', query: 'Where can I find the Zoom link for today\'s class?', category: 'Match Test' },
    { title: 'Fee Installments', query: 'Can I pay my fees in monthly installments?', category: 'Match Test' },
    { title: 'Python Prerequisites', query: 'Do I need prior coding experience for Python?', category: 'Match Test' },
    { title: 'Refund Policy', query: 'What is your fee refund policy?', category: 'Match Test' },
    { title: 'Sensitive Security Request (Fail)', query: 'Can you grant me admin password access for the server?', category: 'Grounding Fail' },
    { title: 'Out of Scope Query (Fail)', query: 'Who won the 2026 World Cup?', category: 'Grounding Fail' }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Strict AI Grounding Sandbox
        </div>
        <h1 className="text-xl font-bold text-slate-900">AI Assistant Testing Playground</h1>
        <p className="text-xs text-slate-500 max-w-3xl">
          Test any student query against the 136 approved FAQ knowledge base. Verify match accuracy, 
          confidence scores, intent classification, and out-of-bounds security escalation triggers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Query Form & Presets */}
        <div className="lg:col-span-1 space-y-5">
          {/* Query Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-500" />
              Test Input Prompt
            </h3>

            <textarea
              rows={4}
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter student query to evaluate..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            />

            {/* Threshold Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" /> Grounding Threshold:
                </span>
                <span className="font-mono font-bold text-emerald-600">{threshold}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={90}
                value={threshold}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setThreshold(val);
                  if (testQuery) setResult(queryGroundedAI(testQuery, faqs, val));
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                Matches below {threshold}% confidence trigger Human Escalation.
              </p>
            </div>

            <button
              onClick={() => handleTest()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              Run Grounding Evaluation
            </button>
          </div>

          {/* Test Presets */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-500" />
              Quick Test Presets
            </h3>
            <div className="space-y-2">
              {presetQueries.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTestQuery(preset.query);
                    handleTest(preset.query);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-xs transition-colors flex items-center justify-between group"
                >
                  <span className="font-semibold text-slate-800 group-hover:text-emerald-900">
                    {preset.title}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      preset.category === 'Match Test'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {preset.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Result Evaluation Details */}
        <div className="lg:col-span-2 space-y-5">
          {result ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              {/* Status Header Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  result.matched
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.matched ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-sm">
                      {result.matched ? 'Grounded Answer Confirmed' : 'Grounding Failure / Out of Scope'}
                    </h3>
                    <p className="text-xs opacity-90">
                      {result.matched
                        ? `Query matched an approved entry in the 136 FAQ dataset above ${threshold}% threshold.`
                        : 'Query failed grounding check. Escalation event automatically generated.'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-bold font-mono">
                    {result.confidenceScore}%
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
                    Confidence Score
                  </span>
                </div>
              </div>

              {/* Confidence Meter Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Similarity Score vs Threshold</span>
                  <span className="font-mono text-emerald-600">{result.confidenceScore}% / {threshold}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      result.confidenceScore >= threshold
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.max(result.confidenceScore, 5)}%` }}
                  ></div>
                </div>
              </div>

              {/* Matched FAQ Details */}
              {result.faq ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Matched FAQ Metadata
                    </span>
                    <span className="text-xs bg-slate-900 text-emerald-400 font-mono px-2 py-0.5 rounded font-bold">
                      {result.faq.id}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-medium">Question in KB:</div>
                    <div className="text-xs font-semibold text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200">
                      {result.faq.question}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-medium">Approved Grounded Answer:</div>
                    <div className="text-xs text-slate-900 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                      {result.faq.answer}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Category:</span> {result.faq.category} • 
                    <span className="font-semibold text-slate-700">Keywords:</span> {result.faq.keywords.join(', ')}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Strict Fallback Response Returned:
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-amber-200 text-slate-800 leading-relaxed font-sans">
                    {result.groundedAnswer}
                  </div>
                  <div className="text-[11px] text-amber-800 font-medium">
                    Reason: {result.escalationReason || 'unknown_faq'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700">No Query Evaluated Yet</h3>
              <p className="text-xs">Type a prompt or choose a preset to test the grounded AI engine.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
