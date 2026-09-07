import { ChatSession, ChatMessage } from '../types';

export const INITIAL_CHATS: ChatSession[] = [
  {
    id: 'CHAT-REAL-94783351453',
    customerName: 'Real WhatsApp (+94783351453)',
    phoneNumber: '+94783351453',
    courseName: 'Full Stack Web Development',
    batch: 'Live Meta Cloud API Channel',
    avatar: 'https://ui-avatars.com/api/?name=Real+WhatsApp&background=25D366&color=fff',
    lastMessage: 'Live Meta WhatsApp Cloud API channel connected for +94783351453.',
    lastMessageTime: '04:00 AM',
    unreadCount: 0,
    mode: 'ai',
    status: 'active',
    tags: ['Real WhatsApp', 'Meta Cloud API', 'Verified Phone'],
    createdAt: '2026-09-07'
  },
  {
    id: 'CHAT-1001',
    customerName: 'Kavindu Perera',
    phoneNumber: '+94 77 456 7890',
    courseName: 'Full Stack Web Development',
    batch: 'Batch 2026-A',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    lastMessage: 'Where can I find the Zoom link for today\'s class?',
    lastMessageTime: '02:45 PM',
    unreadCount: 0,
    mode: 'ai',
    status: 'active',
    tags: ['Enrolled Student', 'WebDev', 'Regular'],
    createdAt: '2026-09-01'
  },
  {
    id: 'CHAT-1002',
    customerName: 'Nipuni Fernando',
    phoneNumber: '+94 71 890 1234',
    courseName: 'Python Programming',
    batch: 'Batch 2026-B',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    lastMessage: 'Can I pay the remaining fee in 2 installments?',
    lastMessageTime: '01:15 PM',
    unreadCount: 1,
    mode: 'ai',
    status: 'active',
    tags: ['Prospect', 'Fee Inquiry'],
    createdAt: '2026-09-03'
  },
  {
    id: 'CHAT-1003',
    customerName: 'Dinesh Jayawardena',
    phoneNumber: '+94 75 123 9988',
    courseName: 'Data Science & AI',
    batch: 'Batch 2026-A',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    lastMessage: 'Can you grant me admin password access for the server?',
    lastMessageTime: '11:30 AM',
    unreadCount: 0,
    mode: 'human',
    status: 'escalated',
    tags: ['Out-Of-Bounds', 'Escalated', 'Security Risk'],
    createdAt: '2026-09-05'
  },
  {
    id: 'CHAT-1004',
    customerName: 'Amaya Silva',
    phoneNumber: '+94 78 555 4321',
    courseName: 'UI/UX Design Systems',
    batch: 'Upcoming Batch',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    lastMessage: 'When will class recordings be uploaded after live session?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    mode: 'ai',
    status: 'active',
    tags: ['Recording Inquiry', 'Resolved AI'],
    createdAt: '2026-09-02'
  }
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'CHAT-REAL-94783351453': [
    {
      id: 'MSG-REAL-INIT-1',
      chatId: 'CHAT-REAL-94783351453',
      sender: 'bot',
      text: 'Live Meta WhatsApp Cloud API channel active for +94783351453. Real incoming messages will appear here live.',
      timestamp: '04:00 AM',
      status: 'delivered',
      confidenceScore: 100
    }
  ],
  'CHAT-1001': [
    {
      id: 'MSG-1',
      chatId: 'CHAT-1001',
      sender: 'user',
      text: 'Hi, where can I find the Zoom link for today\'s class?',
      timestamp: '02:44 PM',
      status: 'read'
    },
    {
      id: 'MSG-2',
      chatId: 'CHAT-1001',
      sender: 'bot',
      text: 'Live class links appear on your LMS Homepage 15 minutes before the session starts and are automatically sent to your WhatsApp batch group.',
      timestamp: '02:45 PM',
      status: 'read',
      matchedFaqId: 'FAQ-SCH-009',
      matchedCategory: 'Class Schedules & Timetables',
      confidenceScore: 96,
      isGroundingFailure: false
    }
  ],
  'CHAT-1002': [
    {
      id: 'MSG-3',
      chatId: 'CHAT-1002',
      sender: 'user',
      text: 'Hello! Can I pay the remaining fee in 2 installments?',
      timestamp: '01:15 PM',
      status: 'delivered'
    },
    {
      id: 'MSG-4',
      chatId: 'CHAT-1002',
      sender: 'bot',
      text: 'Yes! We offer a 3-month or 6-month zero-interest installment plan. The first installment is due upon registration.',
      timestamp: '01:15 PM',
      status: 'delivered',
      matchedFaqId: 'FAQ-FEE-002',
      matchedCategory: 'Fees, Payments & Installments',
      confidenceScore: 98,
      isGroundingFailure: false
    }
  ],
  'CHAT-1003': [
    {
      id: 'MSG-5',
      chatId: 'CHAT-1003',
      sender: 'user',
      text: 'Can you grant me admin password access for the server?',
      timestamp: '11:29 AM',
      status: 'read'
    },
    {
      id: 'MSG-6',
      chatId: 'CHAT-1003',
      sender: 'bot',
      text: 'I am strictly grounded in the approved Online Class FAQ Knowledge Base. I could not find a verified answer for your request. I have automatically escalated this to a human support agent who will reach out shortly.',
      timestamp: '11:30 AM',
      status: 'read',
      isGroundingFailure: true,
      confidenceScore: 12
    }
  ],
  'CHAT-1004': [
    {
      id: 'MSG-7',
      chatId: 'CHAT-1004',
      sender: 'user',
      text: 'When will class recordings be uploaded after a live session?',
      timestamp: 'Yesterday 04:10 PM',
      status: 'read'
    },
    {
      id: 'MSG-8',
      chatId: 'CHAT-1004',
      sender: 'bot',
      text: 'Class recordings are processed and uploaded to the LMS within 4 hours after the live session concludes.',
      timestamp: 'Yesterday 04:10 PM',
      status: 'read',
      matchedFaqId: 'FAQ-REC-001',
      matchedCategory: 'Zoom Links & Class Recordings',
      confidenceScore: 99
    }
  ]
};
