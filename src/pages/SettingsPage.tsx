import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Save,
  Key,
  Sliders,
  Database,
  Phone,
  Clock,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SystemSettings } from '../types';
import { WhatsAppQrCard } from '../components/common/WhatsAppQrCard';


export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            System Configuration & Production Readiness
          </div>
          <h1 className="text-xl font-bold text-slate-900">Settings & API Configuration</h1>
          <p className="text-xs text-slate-500">
            Configure AI grounding strictness, automated greetings, Meta WhatsApp Cloud API credentials, and Supabase integration parameters.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings Saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: AI Grounding Strictness */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            AI Grounding & Strictness Threshold
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Strictness Threshold:</span>
              <span className="font-mono text-emerald-600 font-bold text-sm">{formData.aiStrictnessThreshold}%</span>
            </div>
            <input
              type="range"
              min={30}
              max={90}
              value={formData.aiStrictnessThreshold}
              onChange={(e) => setFormData({ ...formData, aiStrictnessThreshold: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Queries matching below {formData.aiStrictnessThreshold}% confidence automatically fail grounding check and trigger Human Escalation.
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Bot Assistant Display Name</label>
              <input
                type="text"
                value={formData.botName}
                onChange={(e) => setFormData({ ...formData, botName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Default Welcome Greeting Message</label>
              <textarea
                rows={2}
                value={formData.defaultGreeting}
                onChange={(e) => setFormData({ ...formData, defaultGreeting: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Out-Of-Scope Escalation Fallback Message</label>
              <textarea
                rows={2}
                value={formData.outOfScopeResponse}
                onChange={(e) => setFormData({ ...formData, outOfScopeResponse: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* WHATSAPP WEB QR PAIRING LINKER */}
        <WhatsAppQrCard />

        {/* Card 2: Meta WhatsApp Cloud API Setup */}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-500" />
              Meta WhatsApp Cloud API & BSUID Readiness
            </h3>
            <span className="text-[10px] bg-slate-100 text-cyan-700 font-mono font-bold px-2 py-0.5 rounded">
              Swappable Service Layer
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Meta Phone Number ID</label>
              <input
                type="text"
                value={formData.metaPhoneNumberId}
                onChange={(e) => setFormData({ ...formData, metaPhoneNumberId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">System User Access Token</label>
              <input
                type="password"
                value={formData.metaAccessTokenMasked}
                onChange={(e) => setFormData({ ...formData, metaAccessTokenMasked: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs space-y-2 border border-slate-800 font-mono">
            <div className="text-emerald-400 font-bold flex items-center justify-between">
              <span>META WEBHOOK CONFIGURATION GUIDELINES</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                Verified Endpoint
              </span>
            </div>
            <div className="space-y-1 text-[11px] pt-1">
              <div><strong className="text-white">Callback URL:</strong> <code className="text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded">https://YOUR_DOMAIN/api/webhooks/whatsapp</code></div>
              <div><strong className="text-white">Verify Token:</strong> <code className="text-emerald-300 bg-slate-800 px-1.5 py-0.5 rounded">onlineclass_whatsapp_2026</code></div>
              <div><strong className="text-white">Subscribed Events:</strong> <span className="text-slate-400">messages, messaging_postbacks</span></div>
            </div>
          </div>
        </div>

        {/* Card 3: Supabase Architecture Ready Placeholder */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            Supabase Backend Integration Placeholder
          </h3>
          <p className="text-xs text-slate-500">
            The app current stores data in local state / localStorage. Fill in your Supabase credentials 
            to seamlessly transition from local storage to a live PostgreSQL backend.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Supabase Project URL</label>
              <input
                type="text"
                value={formData.supabaseUrlPlaceholder}
                onChange={(e) => setFormData({ ...formData, supabaseUrlPlaceholder: e.target.value })}
                placeholder="https://xyz.supabase.co"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Supabase Anon Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save System Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
