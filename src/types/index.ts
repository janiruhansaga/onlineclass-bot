export type NavigationTab = 
  | 'dashboard'
  | 'simulator'
  | 'playground'
  | 'kb'
  | 'escalations'
  | 'lms'
  | 'courses'
  | 'sequences'
  | 'analytics'
  | 'settings'
  | 'logs';

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  lastUpdated: string;
  isGrounded: boolean;
  usageCount: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  sender: 'user' | 'bot' | 'agent';
  senderName?: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  matchedFaqId?: string;
  matchedCategory?: string;
  confidenceScore?: number;
  isGroundingFailure?: boolean;
}

export interface ChatSession {
  id: string;
  customerName: string;
  phoneNumber: string;
  courseName?: string;
  batch?: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  mode: 'ai' | 'human';
  status: 'active' | 'escalated' | 'resolved';
  tags: string[];
  createdAt: string;
}

export interface EscalationTicket {
  id: string;
  chatId: string;
  customerName: string;
  phoneNumber: string;
  userQuery: string;
  reason: 'unknown_faq' | 'user_requested' | 'strictness_failure' | 'sensitive_topic';
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  assignedTo?: string;
  notes?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  instructor: string;
  schedule: string;
  duration: string;
  fee: number;
  enrolledStudents: number;
  status: 'active' | 'upcoming' | 'completed';
  syllabus: string[];
  category: string;
}

export interface LMSWebhookPayload {
  message: string;
  numbers: string[];
  courseId?: string;
  templateName?: string;
}

export interface LMSExecutionLog {
  id: string;
  timestamp: string;
  payload: LMSWebhookPayload;
  status: 'received' | 'validated' | 'queued' | 'processed' | 'failed';
  totalTargets: number;
  validNumbersCount: number;
  error?: string;
  stepDetails: {
    receivedAt: string;
    validatedAt?: string;
    queuedAt?: string;
    processedAt?: string;
  };
}

export interface AutomatedSequence {
  id: string;
  name: string;
  triggerType: 'new_enrollment' | 'missed_class' | 'recording_uploaded' | 'payment_reminder';
  description: string;
  stepsCount: number;
  activeStudents: number;
  status: 'active' | 'paused';
  delay: string;
  templateText: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  type: 'AI_RESPONSE' | 'ESCALATION_CREATED' | 'LMS_TRIGGER' | 'KB_UPDATE' | 'AGENT_TAKEOVER' | 'SETTINGS_CHANGE';
  severity: 'info' | 'warning' | 'error' | 'success';
  title: string;
  description: string;
  userOrPhone?: string;
  metadata?: Record<string, unknown>;
}

export interface GroundingCheckResult {
  query: string;
  matched: boolean;
  faq?: FAQItem;
  confidenceScore: number;
  groundedAnswer: string;
  intentDetected: string;
  isEscalated: boolean;
  escalationReason?: string;
}

export interface SystemSettings {
  botName: string;
  botPhoneNumber?: string;
  aiStrictnessThreshold: number; // e.g. 60%
  defaultGreeting: string;
  outOfScopeResponse: string;
  businessHoursOnly: boolean;
  businessHours: { start: string; end: string };
  metaCloudApiReady: boolean;
  metaPhoneNumberId: string;
  metaAccessTokenMasked: string;
  supabaseIntegrationReady: boolean;
  supabaseUrlPlaceholder: string;
}

export interface WhatsAppWebSession {
  status: 'disconnected' | 'qr_ready' | 'connecting' | 'connected';
  linkedPhone?: string;
  deviceName?: string;
  batteryLevel?: number;
  qrCodeSvg?: string;
  pairingCode?: string;
  connectedAt?: string;
  lastPingAt?: string;
}

