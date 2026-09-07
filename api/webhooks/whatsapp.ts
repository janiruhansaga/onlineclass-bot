import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client if credentials are present
const supabaseUrl = process.env.SUPABASE_URL || 'https://ybylbiycwhyqihdhjgqb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = (supabaseUrl && supabaseKey && !supabaseUrl.includes('xyzcompany'))
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET Webhook Verification for Meta Cloud API Setup
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.META_WHATSAPP_VERIFY_TOKEN || 'onlineclass_whatsapp_2026';

    console.log(`[WhatsApp Webhook GET] Mode: ${mode}, Token: ${token}`);

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[WhatsApp Webhook Verified] Verification successful!');
      return res.status(200).send(String(challenge));
    } else {
      console.warn('[WhatsApp Webhook Verification Failed] Token mismatch.');
      return res.status(403).send('Forbidden: Token mismatch');
    }
  }

  // 2. POST Incoming WhatsApp Message Event from Meta Cloud API
  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (!body || !body.object || !body.entry || !body.entry[0]?.changes?.[0]?.value) {
        return res.status(200).send('EVENT_RECEIVED');
      }

      const value = body.entry[0].changes[0].value;
      const messages = value.messages;
      const contacts = value.contacts;

      if (!messages || messages.length === 0) {
        return res.status(200).send('EVENT_RECEIVED');
      }

      const msg = messages[0];
      const rawPhone = msg.from;
      const formattedPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
      const customerName = contacts?.[0]?.profile?.name || formattedPhone;
      let userText = '';

      if (msg.type === 'text') {
        userText = msg.text?.body || '';
      } else if (msg.type === 'interactive') {
        userText = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
      }

      if (userText) {
        console.log(`[WhatsApp Incoming REAL] From: ${customerName} (${formattedPhone}) | Text: "${userText}"`);

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const chatId = `CHAT-REAL-${rawPhone.replace(/[^\d]/g, '')}`;

        // Grounding Response (Default template or AI answer)
        const replyText = `Hello! Thank you for contacting OnlineClass Support. We received your query: "${userText}". All class schedules, Zoom links, and course details are available on your student dashboard.`;

        // Save incoming customer message & bot reply to Supabase if connected
        if (supabase) {
          try {
            // Upsert Customer
            const { data: customerData } = await supabase
              .from('customers')
              .upsert({ phone_number: formattedPhone, display_name: customerName }, { onConflict: 'phone_number' })
              .select('id')
              .single();

            const customerId = customerData?.id;

            // Upsert Conversation
            const { data: convData } = await supabase
              .from('conversations')
              .upsert(
                {
                  id: chatId.length === 36 ? chatId : undefined,
                  status: 'ai_active',
                  last_message_at: new Date().toISOString()
                },
                { onConflict: 'id' }
              )
              .select('id')
              .single();

            const conversationId = convData?.id || chatId;

            // Insert Incoming Customer Message
            await supabase.from('messages').insert({
              conversation_id: conversationId,
              external_message_id: msg.id || `MSG-IN-${Date.now()}`,
              direction: 'incoming',
              sender_type: 'customer',
              content: userText,
              status: 'delivered'
            });

            // Insert Outgoing AI Bot Message
            await supabase.from('messages').insert({
              conversation_id: conversationId,
              external_message_id: `MSG-OUT-${Date.now()}`,
              direction: 'outgoing',
              sender_type: 'ai',
              content: replyText,
              status: 'sent'
            });
          } catch (dbErr) {
            console.error('[Supabase Save Exception]', dbErr);
          }
        }

        // Dispatch reply to WhatsApp via Meta Cloud API
        const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || '1314283051764757';
        const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;

        if (accessToken) {
          const cleanPhone = rawPhone.replace(/[^\d]/g, '');
          await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: cleanPhone,
              type: 'text',
              text: { body: replyText }
            })
          });
        }
      }

      return res.status(200).send('EVENT_RECEIVED');
    } catch (err: any) {
      console.error('[WhatsApp Webhook Error]', err);
      return res.status(200).send('EVENT_RECEIVED');
    }
  }

  return res.status(200).send('OK');
}
