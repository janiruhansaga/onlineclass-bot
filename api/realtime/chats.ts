import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ybylbiycwhyqihdhjgqb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = (supabaseUrl && supabaseKey && !supabaseUrl.includes('xyzcompany'))
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const DEFAULT_CHATS = [
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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (supabase) {
    try {
      const { data: dbConvs } = await supabase
        .from('conversations')
        .select(`
          id,
          status,
          ai_enabled,
          last_message_at,
          customer:customers (
            phone_number,
            display_name
          )
        `)
        .order('last_message_at', { ascending: false });

      if (dbConvs && dbConvs.length > 0) {
        const chatsFromDb = dbConvs.map((conv: any) => {
          const phone = conv.customer?.phone_number || '+94783351453';
          const name = conv.customer?.display_name || phone;
          return {
            id: conv.id,
            customerName: name,
            phoneNumber: phone,
            courseName: 'Online Class Student',
            batch: 'Meta Cloud API Live Channel',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`,
            lastMessage: 'Active Meta WhatsApp Session',
            lastMessageTime: new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unreadCount: 0,
            mode: conv.ai_enabled ? 'ai' : 'human',
            status: conv.status || 'active',
            tags: ['Real WhatsApp', 'Meta Cloud API'],
            createdAt: new Date(conv.last_message_at).toISOString().split('T')[0]
          };
        });

        return res.status(200).json({ chats: chatsFromDb, escalations: [] });
      }
    } catch (err) {
      console.error('[Chats Endpoint Error]', err);
    }
  }

  return res.status(200).json({ chats: DEFAULT_CHATS, escalations: [] });
}
