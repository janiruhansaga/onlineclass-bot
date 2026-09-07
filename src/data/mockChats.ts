import { ChatSession, ChatMessage } from '../types';

export const INITIAL_CHATS: ChatSession[] = [
  {
    id: 'CHAT-REAL-94783351453',
    customerName: '+94 78 335 1453',
    phoneNumber: '+94783351453',
    courseName: 'Online Class Student',
    batch: 'Meta Cloud API Live Channel',
    avatar: 'https://ui-avatars.com/api/?name=%2B94783351453&background=25D366&color=fff',
    lastMessage: 'hi',
    lastMessageTime: '11:35 PM',
    unreadCount: 0,
    mode: 'ai',
    status: 'active',
    tags: ['Real WhatsApp', 'Meta Cloud API'],
    createdAt: '2026-09-07'
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
    },
    {
      id: 'MSG-REAL-INIT-2',
      chatId: 'CHAT-REAL-94783351453',
      sender: 'user',
      text: 'hi',
      timestamp: '11:35 PM',
      status: 'read'
    }
  ]
};
