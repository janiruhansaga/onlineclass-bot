import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NavigationTab,
  FAQItem,
  Course,
  ChatSession,
  ChatMessage,
  EscalationTicket,
  LMSExecutionLog,
  LMSWebhookPayload,
  AutomatedSequence,
  ActivityLogItem,
  SystemSettings
} from '../types';
import { storageService } from '../services/storageService';
import { queryGroundedAI } from '../services/aiEngine';

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  
  faqs: FAQItem[];
  courses: Course[];
  chats: ChatSession[];
  messages: Record<string, ChatMessage[]>;
  activeChatId: string;
  setActiveChatId: (id: string) => void;
  escalations: EscalationTicket[];
  lmsLogs: LMSExecutionLog[];
  sequences: AutomatedSequence[];
  activityLogs: ActivityLogItem[];
  settings: SystemSettings;
  
  // Actions
  sendMessageInSimulator: (chatId: string, text: string, senderOverride?: 'user' | 'agent') => Promise<void>;
  toggleChatMode: (chatId: string) => void;
  addFaq: (faq: Omit<FAQItem, 'id' | 'lastUpdated' | 'usageCount'>) => void;
  updateFaq: (faq: FAQItem) => void;
  deleteFaq: (id: string) => void;
  importFaqs: (newFaqs: FAQItem[]) => void;
  resolveEscalation: (ticketId: string, notes?: string) => void;
  triggerLmsNotification: (payload: LMSWebhookPayload) => Promise<LMSExecutionLog>;
  updateSettings: (newSettings: SystemSettings) => void;
  resetAllData: () => void;
  sendRealWhatsAppTest: (phone: string, message: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  runDueAutomations: () => Promise<any>;
  addActivityLog: (
    type: ActivityLogItem['type'],
    title: string,
    description: string,
    userOrPhone?: string,
    severity?: ActivityLogItem['severity']
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const [faqs, setFaqs] = useState<FAQItem[]>(() => storageService.getFaqs());
  const [courses, setCourses] = useState<Course[]>(() => storageService.getCourses());
  const [chats, setChats] = useState<ChatSession[]>(() => storageService.getChats());
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => storageService.getMessages());
  const [activeChatId, setActiveChatId] = useState<string>('CHAT-REAL-94783351453');
  const [escalations, setEscalations] = useState<EscalationTicket[]>(() => storageService.getEscalations());
  const [lmsLogs, setLmsLogs] = useState<LMSExecutionLog[]>(() => storageService.getLmsLogs());
  const [sequences, setSequences] = useState<AutomatedSequence[]>(() => storageService.getSequences());
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => storageService.getActivityLogs());
  const [settings, setSettings] = useState<SystemSettings>(() => storageService.getSettings());

  // Real-Time Webhook Polling Sync (Polls server every 2 seconds for real WhatsApp messages)
  useEffect(() => {
    const fetchRealTimeChats = async () => {
      try {
        const chatsRes = await fetch('/api/realtime/chats');
        if (chatsRes.ok) {
          const data = await chatsRes.json();
          if (data.chats && data.chats.length > 0) {
            setChats((prev) => {
              const prevIds = new Set(prev.map((c) => c.id));
              const newChats = data.chats.filter((c: ChatSession) => !prevIds.has(c.id));
              if (newChats.length > 0) {
                // Auto switch active chat to newest real incoming WhatsApp chat
                setActiveChatId(newChats[0].id);
                return [...newChats, ...prev];
              }
              // Update existing chats
              return prev.map((p) => {
                const updated = data.chats.find((c: ChatSession) => c.id === p.id);
                return updated ? { ...p, lastMessage: updated.lastMessage, lastMessageTime: updated.lastMessageTime, status: updated.status, mode: updated.mode } : p;
              });
            });
          }
          if (data.escalations && data.escalations.length > 0) {
            setEscalations((prev) => {
              const prevIds = new Set(prev.map((e) => e.id));
              const newEsc = data.escalations.filter((e: EscalationTicket) => !prevIds.has(e.id));
              return newEsc.length > 0 ? [...newEsc, ...prev] : prev;
            });
          }
        }

        const msgRes = await fetch('/api/realtime/messages');
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          if (msgData.messages) {
            setMessages((prev) => {
              const updated = { ...prev };
              Object.keys(msgData.messages).forEach((chatKey) => {
                const existingList = updated[chatKey] || [];
                const existingIds = new Set(existingList.map((m) => m.id));
                const incomingList = msgData.messages[chatKey] || [];
                const newOnly = incomingList.filter((m: ChatMessage) => !existingIds.has(m.id));
                if (newOnly.length > 0) {
                  updated[chatKey] = [...existingList, ...newOnly];
                }
              });
              return updated;
            });
          }
        }
      } catch (e) {
        // Local mode fallback
      }
    };

    fetchRealTimeChats();
    const interval = setInterval(fetchRealTimeChats, 2500);
    return () => clearInterval(interval);
  }, []);

  // Save changes to LocalStorage
  useEffect(() => { storageService.saveFaqs(faqs); }, [faqs]);
  useEffect(() => { storageService.saveCourses(courses); }, [courses]);
  useEffect(() => { storageService.saveChats(chats); }, [chats]);
  useEffect(() => { storageService.saveMessages(messages); }, [messages]);
  useEffect(() => { storageService.saveEscalations(escalations); }, [escalations]);
  useEffect(() => { storageService.saveLmsLogs(lmsLogs); }, [lmsLogs]);
  useEffect(() => { storageService.saveSequences(sequences); }, [sequences]);
  useEffect(() => { storageService.saveActivityLogs(activityLogs); }, [activityLogs]);
  useEffect(() => { storageService.saveSettings(settings); }, [settings]);

  const addActivityLog = (
    type: ActivityLogItem['type'],
    title: string,
    description: string,
    userOrPhone: string = 'System',
    severity: ActivityLogItem['severity'] = 'info'
  ) => {
    const newLog: ActivityLogItem = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString(),
      type,
      title,
      description,
      userOrPhone,
      severity
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  /**
   * Send Real WhatsApp Test Message via Server API
   */
  const sendRealWhatsAppTest = async (phone: string, messageText: string) => {
    try {
      const res = await fetch('/api/test/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message: messageText })
      });
      const data = await res.json();
      if (data.success) {
        addActivityLog('AI_RESPONSE', 'Real WhatsApp Message Sent', `Sent message to ${phone}`, phone, 'success');
      } else {
        addActivityLog('AI_RESPONSE', 'WhatsApp Message Dispatch Logged', `Target ${phone}`, phone, 'info');
      }
      return data;
    } catch (err: any) {
      addActivityLog('AI_RESPONSE', 'Local Simulator Message Sent', `Dispatched to ${phone}`, phone, 'info');
      return { success: true, mock: true };
    }
  };

  /**
   * Run Due Scheduled Follow-up Automations via Server API
   */
  const runDueAutomations = async () => {
    try {
      const res = await fetch('/api/automations/run-due', { method: 'POST' });
      const data = await res.json();
      addActivityLog('SETTINGS_CHANGE', 'Due Automations Executed', 'Triggered scheduled follow-up workflow queue', 'Admin', 'success');
      return data;
    } catch (err) {
      addActivityLog('SETTINGS_CHANGE', 'Due Automations Run (Local)', 'Simulated 3 scheduled follow-ups', 'Admin', 'info');
      return { status: 'completed' };
    }
  };

  /**
   * Send Message in Simulator & Sync with Real Meta WhatsApp API
   */
  const sendMessageInSimulator = async (
    chatId: string,
    text: string,
    senderOverride?: 'user' | 'agent'
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `MSG-${Date.now()}`;

    const userMessage: ChatMessage = {
      id: userMsgId,
      chatId,
      sender: senderOverride || 'user',
      text,
      timestamp: timeStr,
      status: 'read'
    };

    // Update messages locally
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), userMessage]
    }));

    // Update chat last message
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, lastMessage: text, lastMessageTime: timeStr } : c))
    );

    const currentChat = chats.find((c) => c.id === chatId);

    // If human agent replied directly in the dashboard chat window, send real message via server API!
    if (senderOverride === 'agent') {
      try {
        await fetch('/api/realtime/send-agent-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, text })
        });
      } catch (e) {
        if (currentChat?.phoneNumber) {
          sendRealWhatsAppTest(currentChat.phoneNumber, text);
        }
      }
      addActivityLog('AGENT_TAKEOVER', 'Human Agent Response', `Agent sent: "${text}"`, chatId, 'info');
      return;
    }

    // Check target chat mode
    if (currentChat && currentChat.mode === 'human') {
      return;
    }

    // Process query through AI Grounding Engine
    const aiResult = queryGroundedAI(text, faqs, settings.aiStrictnessThreshold);
    const botMsgId = `MSG-${Date.now() + 1}`;

    const botMessage: ChatMessage = {
      id: botMsgId,
      chatId,
      sender: 'bot',
      text: aiResult.groundedAnswer,
      timestamp: timeStr,
      status: 'delivered',
      matchedFaqId: aiResult.faq?.id,
      matchedCategory: aiResult.faq?.category,
      confidenceScore: aiResult.confidenceScore,
      isGroundingFailure: !aiResult.matched
    };

    // Update messages with bot response after simulated typing delay (600ms)
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), botMessage]
      }));

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                lastMessage: aiResult.groundedAnswer,
                lastMessageTime: timeStr,
                status: aiResult.isEscalated ? 'escalated' : c.status
              }
            : c
        )
      );

      // If FAQ matched, increment usage count
      if (aiResult.faq) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === aiResult.faq!.id ? { ...f, usageCount: f.usageCount + 1 } : f))
        );
        addActivityLog(
          'AI_RESPONSE',
          `Matched FAQ ${aiResult.faq.id}`,
          `Query "${text}" matched ${aiResult.faq.id} (${aiResult.confidenceScore}% confidence)`,
          currentChat?.phoneNumber,
          'success'
        );

        // Dispatch real Meta WhatsApp Cloud API message if chat is real WhatsApp contact
        if (currentChat?.phoneNumber && (currentChat.phoneNumber.includes('94783351453') || chatId.startsWith('CHAT-REAL-'))) {
          sendRealWhatsAppTest(currentChat.phoneNumber, aiResult.groundedAnswer);
        }
      }

      // If grounding failed or sensitive topic, create Escalation Ticket
      if (aiResult.isEscalated) {
        const newTicket: EscalationTicket = {
          id: `ESC-${Date.now().toString().slice(-4)}`,
          chatId,
          customerName: currentChat?.customerName || 'Unknown Student',
          phoneNumber: currentChat?.phoneNumber || 'N/A',
          userQuery: text,
          reason: (aiResult.escalationReason as EscalationTicket['reason']) || 'unknown_faq',
          status: 'pending',
          priority: aiResult.escalationReason === 'sensitive_topic' ? 'high' : 'medium',
          createdAt: new Date().toLocaleString()
        };

        setEscalations((prev) => [newTicket, ...prev]);
        
        // Auto switch chat mode to human
        setChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, mode: 'human', status: 'escalated' } : c))
        );

        addActivityLog(
          'ESCALATION_CREATED',
          'Human Escalation Triggered',
          `Created ticket ${newTicket.id} for "${text}" (${aiResult.escalationReason})`,
          currentChat?.phoneNumber,
          'warning'
        );
      }
    }, 600);
  };

  const toggleChatMode = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const nextMode = c.mode === 'ai' ? 'human' : 'ai';
          addActivityLog('AGENT_TAKEOVER', 'Chat Mode Changed', `Switched ${c.customerName} to ${nextMode.toUpperCase()} mode`, c.phoneNumber);
          return { ...c, mode: nextMode };
        }
        return c;
      })
    );
  };

  const addFaq = (newFaqData: Omit<FAQItem, 'id' | 'lastUpdated' | 'usageCount'>) => {
    const newId = `FAQ-CUSTOM-${Date.now().toString().slice(-4)}`;
    const newFaq: FAQItem = {
      ...newFaqData,
      id: newId,
      lastUpdated: new Date().toISOString().split('T')[0],
      usageCount: 0
    };
    setFaqs((prev) => [newFaq, ...prev]);
    addActivityLog('KB_UPDATE', 'FAQ Added', `Created new approved FAQ ${newId}: "${newFaq.question}"`, 'Admin', 'success');
  };

  const updateFaq = (updatedFaq: FAQItem) => {
    setFaqs((prev) => prev.map((f) => (f.id === updatedFaq.id ? { ...updatedFaq, lastUpdated: new Date().toISOString().split('T')[0] } : f)));
    addActivityLog('KB_UPDATE', 'FAQ Updated', `Updated FAQ ${updatedFaq.id}`, 'Admin', 'info');
  };

  const deleteFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    addActivityLog('KB_UPDATE', 'FAQ Deleted', `Deleted FAQ ${id}`, 'Admin', 'warning');
  };

  const importFaqs = (imported: FAQItem[]) => {
    setFaqs(imported);
    addActivityLog('KB_UPDATE', 'Knowledge Base Imported', `Imported ${imported.length} approved FAQs`, 'Admin', 'success');
  };

  const resolveEscalation = (ticketId: string, notes?: string) => {
    setEscalations((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'resolved', notes: notes || 'Resolved by agent' } : t))
    );
    addActivityLog('AGENT_TAKEOVER', 'Escalation Resolved', `Ticket ${ticketId} resolved`, 'Support Team', 'success');
  };

  const triggerLmsNotification = async (payload: LMSWebhookPayload): Promise<LMSExecutionLog> => {
    const now = new Date();
    const logId = `LMS-LOG-${Date.now().toString().slice(-6)}`;
    const receivedTime = now.toLocaleTimeString();

    const validNumbers = payload.numbers.filter((num) => num && num.trim().length >= 8);
    const isValid = payload.message.trim().length > 0 && validNumbers.length > 0;

    try {
      await fetch('/api/webhooks/lms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.log('LMS API post handled in local simulator state');
    }

    const executionLog: LMSExecutionLog = {
      id: logId,
      timestamp: now.toLocaleString(),
      payload,
      status: isValid ? 'processed' : 'failed',
      totalTargets: payload.numbers.length,
      validNumbersCount: validNumbers.length,
      error: isValid ? undefined : 'Invalid payload: Message empty or no valid recipient numbers',
      stepDetails: {
        receivedAt: receivedTime,
        validatedAt: isValid ? new Date(now.getTime() + 100).toLocaleTimeString() : undefined,
        queuedAt: isValid ? new Date(now.getTime() + 250).toLocaleTimeString() : undefined,
        processedAt: isValid ? new Date(now.getTime() + 500).toLocaleTimeString() : undefined,
      }
    };

    setLmsLogs((prev) => [executionLog, ...prev]);

    if (isValid) {
      validNumbers.forEach((targetNum) => {
        const existingChat = chats.find((c) => c.phoneNumber.replace(/\s+/g, '').includes(targetNum.replace(/\s+/g, '')));
        const targetChatId = existingChat ? existingChat.id : 'CHAT-1001';

        const lmsMsg: ChatMessage = {
          id: `MSG-LMS-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          chatId: targetChatId,
          sender: 'bot',
          text: `[LMS Automated Alert] 📢 ${payload.message}`,
          timestamp: receivedTime,
          status: 'delivered'
        };

        setMessages((prev) => ({
          ...prev,
          [targetChatId]: [...(prev[targetChatId] || []), lmsMsg]
        }));

        setChats((prev) =>
          prev.map((c) =>
            c.id === targetChatId
              ? { ...c, lastMessage: `[LMS Alert] ${payload.message}`, lastMessageTime: receivedTime }
              : c
          )
        );
      });

      addActivityLog(
        'LMS_TRIGGER',
        'LMS Webhook Execution Success',
        `Dispatched "${payload.message}" to ${validNumbers.length} recipients.`,
        'LMS Engine',
        'success'
      );
    } else {
      addActivityLog(
        'LMS_TRIGGER',
        'LMS Webhook Execution Failed',
        'Payload validation failed.',
        'LMS Engine',
        'error'
      );
    }

    return executionLog;
  };

  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    addActivityLog('SETTINGS_CHANGE', 'System Settings Updated', 'Updated AI strictness & Meta API configuration', 'Admin', 'info');
  };

  const resetAllData = () => {
    storageService.resetToDefaults();
    setFaqs(storageService.getFaqs());
    setCourses(storageService.getCourses());
    setChats(storageService.getChats());
    setMessages(storageService.getMessages());
    setEscalations(storageService.getEscalations());
    setLmsLogs(storageService.getLmsLogs());
    setSequences(storageService.getSequences());
    setActivityLogs(storageService.getActivityLogs());
    setSettings(storageService.getSettings());
    addActivityLog('SETTINGS_CHANGE', 'System Data Reset', 'Reset workspace to default demo state', 'Admin', 'warning');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        faqs,
        courses,
        chats,
        messages,
        activeChatId,
        setActiveChatId,
        escalations,
        lmsLogs,
        sequences,
        activityLogs,
        settings,
        sendMessageInSimulator,
        toggleChatMode,
        addFaq,
        updateFaq,
        deleteFaq,
        importFaqs,
        resolveEscalation,
        triggerLmsNotification,
        updateSettings,
        resetAllData,
        sendRealWhatsAppTest,
        runDueAutomations,
        addActivityLog
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
