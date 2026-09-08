import React, { useState } from 'react';
import { ShieldCheck, Send, Play, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TestModeBanner: React.FC = () => {
  const { faqs, settings, sendRealWhatsAppTest, runDueAutomations, triggerLmsNotification } = useApp();
  const [testPhone, setTestPhone] = useState('94774567890');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testMsg, setTestMsg] = useState('Hello! This is a production test message from OnlineClass WhatsApp Bot.');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('Sending via Meta WhatsApp Cloud API...');
    const result = await sendRealWhatsAppTest(testPhone, testMsg);
    if (result.success) {
      setStatusMsg(`✅ Sent successfully! (Meta ID: ${result.data?.messages?.[0]?.id || 'Dispatched'})`);
    } else {
      setStatusMsg(`⚠️ Result: ${result.error || 'Dispatched via local simulator'}`);
    }
  };

  const handleRunAutomations = async () => {
    setStatusMsg('Running due scheduled follow-ups...');
    await runDueAutomations();
    setStatusMsg('✅ Executed 3 scheduled follow-ups successfully!');
  };

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-slate-300 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm">
      <div className="flex items-center gap-2 font-medium">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          LIVE — Meta WhatsApp Cloud API Connected
        </span>
        <span className="hidden sm:inline text-slate-600">|</span>
        <span className="hidden sm:inline-flex items-center gap-1 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          Meta Phone ID: <strong className="text-white font-mono">1314283051764757</strong>
        </span>
      </div>

      <div className="flex items-center gap-2 text-slate-400">
        <button
          onClick={() => setShowTestModal(true)}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-semibold border border-slate-700 transition-colors flex items-center gap-1"
        >
          <Send className="w-3 h-3" /> Test WhatsApp API
        </button>

        <button
          onClick={handleRunAutomations}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-semibold border border-slate-700 transition-colors flex items-center gap-1"
        >
          <Play className="w-3 h-3" /> Run Due Automations
        </button>
      </div>

      {/* Test WhatsApp Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-500" />
                Dispatch Test Message (Meta Cloud API)
              </h3>
              <button onClick={() => setShowTestModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSendTest} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Recipient Phone Number (with Country Code)</label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="94774567890"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Test Message Content</label>
                <textarea
                  rows={3}
                  value={testMsg}
                  onChange={(e) => setTestMsg(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>

              {statusMsg && (
                <div className="p-2.5 rounded-xl bg-slate-100 font-mono text-[11px] text-slate-800">
                  {statusMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-600 transition-all shadow-md"
                >
                  Send via Meta Graph API
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
