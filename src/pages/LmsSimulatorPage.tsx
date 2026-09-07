import React, { useState } from 'react';
import {
  Send,
  Code2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Play,
  Layers,
  FileCode,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LMSWebhookPayload, LMSExecutionLog } from '../types';

export const LmsSimulatorPage: React.FC = () => {
  const { triggerLmsNotification, lmsLogs } = useApp();

  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(
      {
        message: 'Your class recording is now available.',
        numbers: ['94774567890', '94718901234']
      },
      null,
      2
    )
  );

  const [currentExecution, setCurrentExecution] = useState<LMSExecutionLog | null>(null);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const presetPayloads = [
    {
      name: 'Class Recording Available',
      payload: {
        message: 'Your class recording for Web Development Module 3 is now available on LMS.',
        numbers: ['94774567890', '94718901234']
      }
    },
    {
      name: 'Fee Installment Due Alert',
      payload: {
        message: 'Friendly Reminder: Your monthly course fee installment is due in 3 days.',
        numbers: ['94751239988']
      }
    },
    {
      name: 'Urgent Class Reschedule Alert',
      payload: {
        message: 'Notice: Today\'s 7 PM Python class is rescheduled to tomorrow 7 PM due to holiday.',
        numbers: ['94785554321', '94774567890']
      }
    }
  ];

  const handleExecute = async () => {
    setJsonError(null);
    try {
      const parsed: LMSWebhookPayload = JSON.parse(jsonText);
      if (!parsed.message || !Array.isArray(parsed.numbers)) {
        throw new Error('Payload must contain "message" string and "numbers" string array.');
      }

      // Step 1: Received
      setPipelineStep(1);

      setTimeout(async () => {
        // Step 2: Validated
        setPipelineStep(2);

        setTimeout(async () => {
          // Step 3: Queued
          setPipelineStep(3);

          setTimeout(async () => {
            // Step 4: Processed
            setPipelineStep(4);
            const resultLog = await triggerLmsNotification(parsed);
            setCurrentExecution(resultLog);
          }, 400);
        }, 400);
      }, 400);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON formatting');
      setPipelineStep(0);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider">
            <Send className="w-4 h-4" />
            LMS Webhook & Broadcast Simulator
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            LMS Automated Event Trigger Engine
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Simulate incoming webhooks from your Learning Management System (LMS) to dispatch 
            automated broadcast updates, class alerts, or recording notifications via WhatsApp.
          </p>
        </div>

        <button
          onClick={handleExecute}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          Dispatch Webhook Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: JSON Payload Editor */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-500" />
                JSON Payload Editor
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                POST /api/lms/webhook
              </span>
            </div>

            <textarea
              rows={9}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl outline-none border border-slate-800 focus:border-emerald-500 shadow-inner"
            />

            {jsonError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {jsonError}
              </div>
            )}

            {/* Quick Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Sample Webhook Presets:
              </span>
              <div className="space-y-1.5">
                {presetPayloads.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setJsonText(JSON.stringify(preset.payload, null, 2));
                      setPipelineStep(0);
                    }}
                    className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 text-xs font-semibold text-slate-800 transition-colors flex items-center justify-between"
                  >
                    <span>{preset.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Select</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Pipeline Visualizer & Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline Visualizer Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              LMS Execution Pipeline State
            </h3>

            {/* Pipeline Stage Indicators */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { stage: 1, name: 'Received', desc: 'Payload Ingested' },
                { stage: 2, name: 'Validated', desc: 'Schema Verified' },
                { stage: 3, name: 'Queued', desc: 'Message Buffer' },
                { stage: 4, name: 'Processed', desc: 'WhatsApp Sent' }
              ].map((step) => {
                const isPassed = pipelineStep >= step.stage;
                const isCurrent = pipelineStep === step.stage;

                return (
                  <div
                    key={step.stage}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isPassed
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      {isPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="font-bold text-xs">{step.name}</div>
                    <div className="text-[10px] opacity-75">{step.desc}</div>
                  </div>
                );
              })}
            </div>

            {currentExecution && (
              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2 border border-slate-800">
                <div className="text-emerald-400 font-bold flex items-center justify-between">
                  <span>EXECUTION COMPLETED (ID: {currentExecution.id})</span>
                  <span>{currentExecution.timestamp}</span>
                </div>
                <div className="text-slate-300 text-[11px]">
                  Message: "{currentExecution.payload.message}"
                </div>
                <div className="text-slate-400 text-[10px] flex items-center gap-4 border-t border-slate-800 pt-2">
                  <span>Targets: {currentExecution.totalTargets}</span>
                  <span>Valid Numbers: {currentExecution.validNumbersCount}</span>
                  <span className="text-emerald-400">Status: {currentExecution.status.toUpperCase()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Webhook Execution History Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              LMS Execution History Log ({lmsLogs.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
                    <th className="py-2.5 px-3 font-mono">Log ID</th>
                    <th className="py-2.5 px-3">Message Snippet</th>
                    <th className="py-2.5 px-3 text-center">Recipients</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lmsLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{log.id}</td>
                      <td className="py-2.5 px-3 text-slate-800 max-w-xs truncate font-sans">
                        {log.payload.message}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{log.validNumbersCount}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            log.status === 'processed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 font-mono text-[11px]">
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
