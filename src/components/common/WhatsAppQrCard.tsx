import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Sparkles,
  Wifi,
  Battery,
  ShieldCheck,
  Zap,
  PhoneCall,
  Key,
  Copy,
  Check
} from 'lucide-react';
import { WhatsAppWebSession } from '../../types';

interface WhatsAppQrCardProps {
  onSessionChange?: (session: WhatsAppWebSession) => void;
  compact?: boolean;
}

export const WhatsAppQrCard: React.FC<WhatsAppQrCardProps> = ({ onSessionChange, compact = false }) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'pairing'>('qr');
  const [status, setStatus] = useState<'disconnected' | 'qr_ready' | 'connecting' | 'connected'>('connected');
  const [linkedPhone, setLinkedPhone] = useState('+94783351453');
  const [batteryLevel, setBatteryLevel] = useState(98);
  const [countdown, setCountdown] = useState(48);
  const [isScanning, setIsScanning] = useState(false);
  const [pairingPhoneInput, setPairingPhoneInput] = useState('+94783351453');
  const [generatedPairingCode, setGeneratedPairingCode] = useState('8K4P-2M9W');
  const [copiedCode, setCopiedCode] = useState(false);

  // Countdown timer for QR code refresh
  useEffect(() => {
    if (status !== 'qr_ready') return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const handleSimulateConnect = () => {
    setIsScanning(true);
    setStatus('connecting');
    setTimeout(() => {
      setStatus('connected');
      setIsScanning(false);
      if (onSessionChange) {
        onSessionChange({
          status: 'connected',
          linkedPhone: pairingPhoneInput || '+94783351453',
          deviceName: 'OnlineClass WhatsApp Web Assistant',
          batteryLevel: 98,
          connectedAt: new Date().toLocaleTimeString()
        });
      }
    }, 1500);
  };

  const handleDisconnect = () => {
    setStatus('qr_ready');
    setCountdown(60);
    if (onSessionChange) {
      onSessionChange({
        status: 'qr_ready',
        linkedPhone: undefined
      });
    }
  };

  const handleGenerateNewQr = () => {
    setCountdown(60);
    setStatus('qr_ready');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedPairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 4; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    setGeneratedPairingCode(`${p1}-${p2}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">WhatsApp Web QR Pairing</h3>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Web WhatsApp Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Link your WhatsApp account in 1-click via Web QR Scan or 8-digit Pairing Code.
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {status === 'connected' ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              WhatsApp Web Connected ({linkedPhone})
            </div>
          ) : status === 'connecting' ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Linking Device...
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              Pending QR Pairing
            </div>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6">
        {status === 'connected' ? (
          /* CONNECTED VIEW */
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-emerald-600/20">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{linkedPhone}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                      ACTIVE & LIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    OnlineClass AI Bot active on WhatsApp Web Session. Messages automatically auto-replied.
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-emerald-600" /> Web Socket Connected
                    </span>
                    <span className="flex items-center gap-1">
                      <Battery className="w-3 h-3 text-emerald-600" /> {batteryLevel}% Battery
                    </span>
                    <span>Last Synced: Just now</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateConnect}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Link
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Disconnect
                </button>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-400 font-medium text-[11px]">Meta Webhook Status</div>
                <div className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Immediate 200 OK (&lt;10ms)
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-400 font-medium text-[11px]">Supported Numbers</div>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-cyan-600" /> Any WhatsApp Phone Worldwide
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-400 font-medium text-[11px]">AI Model Engine</div>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Gemini Flash 3.6 / 3.5 Fallback
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* DISCONNECTED / QR PAIRING VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: QR Code Container */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              {/* Tab Selector */}
              <div className="flex p-1 bg-slate-200/70 rounded-xl text-xs font-bold w-full max-w-xs">
                <button
                  onClick={() => setActiveTab('qr')}
                  className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'qr' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" /> Scan QR
                </button>
                <button
                  onClick={() => setActiveTab('pairing')}
                  className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'pairing' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" /> Pairing Code
                </button>
              </div>

              {activeTab === 'qr' ? (
                /* QR CODE DISPLAY */
                <div className="space-y-4 text-center flex flex-col items-center">
                  <div className="relative p-4 bg-white rounded-2xl border border-slate-300 shadow-md group cursor-pointer hover:border-emerald-500 transition-all">
                    {/* Simulated Laser Scanner Animation */}
                    <div className="absolute inset-x-4 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] top-4 animate-[bounce_2s_infinite] pointer-events-none z-10"></div>
                    
                    {/* SVG QR CODE */}
                    <svg className="w-52 h-52 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                      <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                      <rect x="13" y="13" width="9" height="9" fill="#0f172a" />

                      <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                      <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                      <rect x="78" y="13" width="9" height="9" fill="#0f172a" />

                      <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                      <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                      <rect x="13" y="78" width="9" height="9" fill="#0f172a" />

                      {/* Pattern Matrix */}
                      <rect x="35" y="5" width="6" height="6" />
                      <rect x="45" y="5" width="6" height="6" />
                      <rect x="55" y="5" width="6" height="6" />
                      <rect x="35" y="15" width="6" height="6" />
                      <rect x="55" y="15" width="6" height="6" />
                      <rect x="35" y="25" width="6" height="6" />
                      <rect x="45" y="25" width="6" height="6" />

                      <rect x="5" y="35" width="6" height="6" />
                      <rect x="15" y="35" width="6" height="6" />
                      <rect x="25" y="35" width="6" height="6" />
                      <rect x="35" y="35" width="12" height="12" fill="#10b981" />
                      <rect x="52" y="35" width="6" height="6" />
                      <rect x="62" y="35" width="6" height="6" />
                      <rect x="72" y="35" width="6" height="6" />
                      <rect x="82" y="35" width="6" height="6" />

                      <rect x="5" y="45" width="6" height="6" />
                      <rect x="25" y="45" width="6" height="6" />
                      <rect x="52" y="45" width="6" height="6" />
                      <rect x="72" y="45" width="6" height="6" />
                      <rect x="82" y="45" width="6" height="6" />

                      <rect x="5" y="55" width="6" height="6" />
                      <rect x="15" y="55" width="6" height="6" />
                      <rect x="35" y="55" width="6" height="6" />
                      <rect x="45" y="55" width="6" height="6" />
                      <rect x="62" y="55" width="6" height="6" />
                      <rect x="82" y="55" width="6" height="6" />

                      <rect x="35" y="70" width="6" height="6" />
                      <rect x="45" y="70" width="6" height="6" />
                      <rect x="55" y="70" width="6" height="6" />
                      <rect x="70" y="70" width="6" height="6" />
                      <rect x="85" y="70" width="6" height="6" />

                      <rect x="35" y="80" width="6" height="6" />
                      <rect x="55" y="80" width="6" height="6" />
                      <rect x="70" y="80" width="6" height="6" />
                      <rect x="80" y="80" width="12" height="12" fill="#0f172a" />

                      {/* Central Badge */}
                      <circle cx="50" cy="50" r="11" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
                      <path d="M46 50l3 3 5-5" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    Code auto-refreshes in <span className="font-mono font-bold text-emerald-600">{countdown}s</span>
                    <button
                      onClick={handleGenerateNewQr}
                      className="text-emerald-600 underline hover:text-emerald-700 ml-1"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              ) : (
                /* PAIRING CODE DISPLAY */
                <div className="space-y-4 w-full text-center">
                  <div className="p-4 bg-white rounded-2xl border border-slate-300 shadow-xs space-y-3">
                    <label className="text-xs font-semibold text-slate-700 block text-left">
                      Enter Mobile Number (with Country Code)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pairingPhoneInput}
                        onChange={(e) => setPairingPhoneInput(e.target.value)}
                        placeholder="+94771234567"
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                      />
                      <button
                        onClick={generateRandomCode}
                        className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                      >
                        Generate
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xl font-bold tracking-widest flex items-center justify-between border border-slate-800">
                      <span>{generatedPairingCode}</span>
                      <button
                        onClick={handleCopyCode}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs transition-all"
                        title="Copy Code"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 text-left">
                      Enter this code in WhatsApp under <strong>Linked Devices ➡️ Link with Phone Number</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Instant Test Button */}
              <button
                onClick={handleSimulateConnect}
                disabled={isScanning}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying WhatsApp Connection...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Connect WhatsApp Account Now
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Instructions */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                WhatsApp Web Pair කිරීමට පියවර (Instructions)
              </h4>

              <ol className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900">ඔබේ ජංගම දුරකථනයේ WhatsApp App එක විවෘත කරන්න.</strong>
                    <p className="text-slate-500 text-[11px] pt-0.5">
                      Open WhatsApp on your Android or iPhone device.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900">Menu (⋮) හෝ Settings (⚙️) වෙත ගොස් Linked Devices තෝරන්න.</strong>
                    <p className="text-slate-500 text-[11px] pt-0.5">
                      Tap Menu (top right) or Settings ➡️ Select "Linked Devices".
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900">"Link a Device" බටන් එක ඔබා කැමරාව මෙහි ඇති QR Code එකට යොමු කරන්න.</strong>
                    <p className="text-slate-500 text-[11px] pt-0.5">
                      Tap "Link a Device" and point your mobile camera at this QR screen.
                    </p>
                  </div>
                </li>
              </ol>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-900">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Live Webhook Integration Ready
                </div>
                <p className="text-[11px] text-emerald-800">
                  QR Code එක Scan කළ වහාම OnlineClass AI Bot එක ඔබේ WhatsApp Account එක සමඟ සම්බන්ධ වී සිසුන්ට 24/7 ක්ෂණික පිළිතුරු ලබාදීම ආරම්භ කරනු ඇත.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
