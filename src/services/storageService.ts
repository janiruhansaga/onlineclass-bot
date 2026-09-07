import {
  FAQItem,
  Course,
  ChatSession,
  ChatMessage,
  EscalationTicket,
  LMSExecutionLog,
  AutomatedSequence,
  ActivityLogItem,
  SystemSettings
} from '../types';
import { INITIAL_FAQS } from '../data/faqsData';
import { INITIAL_COURSES } from '../data/coursesData';
import { INITIAL_CHATS, INITIAL_MESSAGES } from '../data/mockChats';
import { INITIAL_SEQUENCES } from '../data/mockSequences';

const KEYS = {
  FAQS: 'onlineclass_faqs_v1',
  COURSES: 'onlineclass_courses_v1',
  CHATS: 'onlineclass_chats_v2',
  MESSAGES: 'onlineclass_messages_v2',
  ESCALATIONS: 'onlineclass_escalations_v1',
  LMS_LOGS: 'onlineclass_lms_logs_v1',
  SEQUENCES: 'onlineclass_sequences_v1',
  ACTIVITY_LOGS: 'onlineclass_activity_logs_v1',
  SETTINGS: 'onlineclass_settings_v1',
};

const DEFAULT_SETTINGS: SystemSettings = {
  botName: 'AI Online Class Assistant',
  aiStrictnessThreshold: 55,
  defaultGreeting: 'Hello! I am your AI Online Class Assistant. How can I help you with courses, schedules, fees, or LMS portal today?',
  outOfScopeResponse: 'I am strictly grounded in the approved Online Class FAQ Knowledge Base. I could not find a verified answer for your question and have escalated this to a human support agent.',
  businessHoursOnly: false,
  businessHours: { start: '08:00', end: '20:00' },
  metaCloudApiReady: false,
  metaPhoneNumberId: '109876543210987',
  metaAccessTokenMasked: 'EAAG*************************************',
  supabaseIntegrationReady: false,
  supabaseUrlPlaceholder: 'https://xyzcompany.supabase.co'
};

const DEFAULT_ESCALATIONS: EscalationTicket[] = [
  {
    id: 'ESC-901',
    chatId: 'CHAT-1003',
    customerName: 'Dinesh Jayawardena',
    phoneNumber: '+94 75 123 9988',
    userQuery: 'Can you grant me admin password access for the server?',
    reason: 'sensitive_topic',
    status: 'pending',
    priority: 'high',
    createdAt: '2026-09-05 11:30 AM',
    notes: 'Requested root/admin server password.'
  }
];

const DEFAULT_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-09-07 02:45 PM',
    type: 'AI_RESPONSE',
    severity: 'info',
    title: 'Grounded FAQ Match',
    description: 'Matched "Zoom Link Location" (FAQ-SCH-009) with 96% confidence.',
    userOrPhone: '+94 77 456 7890'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-09-05 11:30 AM',
    type: 'ESCALATION_CREATED',
    severity: 'warning',
    title: 'Human Escalation Triggered',
    description: 'Sensitive security keyword detected. Ticket ESC-901 created.',
    userOrPhone: '+94 75 123 9988'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-09-04 09:10 AM',
    type: 'LMS_TRIGGER',
    severity: 'success',
    title: 'LMS Broadcast Completed',
    description: 'Dispatched recording alert to 142 batch students.',
    userOrPhone: 'LMS Webhook Engine'
  }
];

export const storageService = {
  getFaqs: (): FAQItem[] => {
    const data = localStorage.getItem(KEYS.FAQS);
    if (!data) {
      localStorage.setItem(KEYS.FAQS, JSON.stringify(INITIAL_FAQS));
      return INITIAL_FAQS;
    }
    return JSON.parse(data);
  },

  saveFaqs: (faqs: FAQItem[]) => {
    localStorage.setItem(KEYS.FAQS, JSON.stringify(faqs));
  },

  getCourses: (): Course[] => {
    const data = localStorage.getItem(KEYS.COURSES);
    if (!data) {
      localStorage.setItem(KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
      return INITIAL_COURSES;
    }
    return JSON.parse(data);
  },

  saveCourses: (courses: Course[]) => {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
  },

  getChats: (): ChatSession[] => {
    const data = localStorage.getItem(KEYS.CHATS);
    if (!data) {
      localStorage.setItem(KEYS.CHATS, JSON.stringify(INITIAL_CHATS));
      return INITIAL_CHATS;
    }
    return JSON.parse(data);
  },

  saveChats: (chats: ChatSession[]) => {
    localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
  },

  getMessages: (): Record<string, ChatMessage[]> => {
    const data = localStorage.getItem(KEYS.MESSAGES);
    if (!data) {
      localStorage.setItem(KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
      return INITIAL_MESSAGES;
    }
    return JSON.parse(data);
  },

  saveMessages: (messages: Record<string, ChatMessage[]>) => {
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
  },

  getEscalations: (): EscalationTicket[] => {
    const data = localStorage.getItem(KEYS.ESCALATIONS);
    if (!data) {
      localStorage.setItem(KEYS.ESCALATIONS, JSON.stringify(DEFAULT_ESCALATIONS));
      return DEFAULT_ESCALATIONS;
    }
    return JSON.parse(data);
  },

  saveEscalations: (escalations: EscalationTicket[]) => {
    localStorage.setItem(KEYS.ESCALATIONS, JSON.stringify(escalations));
  },

  getLmsLogs: (): LMSExecutionLog[] => {
    const data = localStorage.getItem(KEYS.LMS_LOGS);
    return data ? JSON.parse(data) : [];
  },

  saveLmsLogs: (logs: LMSExecutionLog[]) => {
    localStorage.setItem(KEYS.LMS_LOGS, JSON.stringify(logs));
  },

  getSequences: (): AutomatedSequence[] => {
    const data = localStorage.getItem(KEYS.SEQUENCES);
    if (!data) {
      localStorage.setItem(KEYS.SEQUENCES, JSON.stringify(INITIAL_SEQUENCES));
      return INITIAL_SEQUENCES;
    }
    return JSON.parse(data);
  },

  saveSequences: (seqs: AutomatedSequence[]) => {
    localStorage.setItem(KEYS.SEQUENCES, JSON.stringify(seqs));
  },

  getActivityLogs: (): ActivityLogItem[] => {
    const data = localStorage.getItem(KEYS.ACTIVITY_LOGS);
    if (!data) {
      localStorage.setItem(KEYS.ACTIVITY_LOGS, JSON.stringify(DEFAULT_ACTIVITY_LOGS));
      return DEFAULT_ACTIVITY_LOGS;
    }
    return JSON.parse(data);
  },

  saveActivityLogs: (logs: ActivityLogItem[]) => {
    localStorage.setItem(KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
  },

  getSettings: (): SystemSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(data);
  },

  saveSettings: (settings: SystemSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  resetToDefaults: () => {
    localStorage.clear();
  }
};
