import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { queryGroundedAI } from '../../src/services/aiEngine';
import { INITIAL_FAQS } from '../../src/data/faqsData';

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

  // 1. GET Verification for Meta Cloud API
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.META_WHATSAPP_VERIFY_TOKEN || 'onlineclass_whatsapp_2026';

    console.log(`[WhatsApp Webhook GET] Mode: ${mode}, Token: ${token}`);

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[WhatsApp Webhook Verified] Successfully verified token!');
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
      const cleanPhone = rawPhone.replace(/[^\d]/g, '');
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
      const customerName = contacts?.[0]?.profile?.name || formattedPhone;
      let userText = '';

      if (msg.type === 'text') {
        userText = msg.text?.body || '';
      } else if (msg.type === 'interactive') {
        userText = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
      } else {
        userText = `[Unsupported media type: ${msg.type}]`;
      }

      if (userText) {
        console.log(`[WhatsApp Webhook POST] From: ${customerName} (${formattedPhone}) | Text: "${userText}"`);

        // Run AI Grounded Engine against 136 Approved FAQs
        const aiResult = queryGroundedAI(userText, INITIAL_FAQS, 55);
        const replyAnswer = aiResult.groundedAnswer;

        // Save incoming customer message & bot reply to Supabase Database
        if (supabase) {
          try {
            // 1. Get or Create Customer
            let { data: customer } = await supabase
              .from('customers')
              .select('id')
              .eq('phone_number', formattedPhone)
              .maybeSingle();

            if (!customer) {
              const { data: newCust } = await supabase
                .from('customers')
                .insert({ phone_number: formattedPhone, display_name: customerName })
                .select('id')
                .single();
              customer = newCust;
            }

            if (customer) {
              // 2. Get or Create Conversation
              let { data: conv } = await supabase
                .from('conversations')
                .select('id')
                .eq('customer_id', customer.id)
                .maybeSingle();

              if (!conv) {
                const { data: newConv } = await supabase
                  .from('conversations')
                  .insert({
                    customer_id: customer.id,
                    status: aiResult.matched ? 'ai_active' : 'needs_review',
                    ai_enabled: true,
                    last_message_at: new Date().toISOString()
                  })
                  .select('id')
                  .single();
                conv = newConv;
              } else {
                await supabase
                  .from('conversations')
                  .update({ last_message_at: new Date().toISOString() })
                  .eq('id', conv.id);
              }

              if (conv) {
                // 3. Save Student Incoming Message
                await supabase.from('messages').insert({
                  conversation_id: conv.id,
                  external_message_id: msg.id || `MSG-IN-${Date.now()}`,
                  direction: 'incoming',
                  sender_type: 'customer',
                  content: userText,
                  status: 'delivered'
                });

                // 4. Save AI Bot Outgoing Response
                await supabase.from('messages').insert({
                  conversation_id: conv.id,
                  external_message_id: `MSG-OUT-${Date.now()}`,
                  direction: 'outgoing',
                  sender_type: 'ai',
                  content: replyAnswer,
                  status: 'sent'
                });
              }
            }
          } catch (dbErr) {
            console.error('[Supabase Webhook Save Exception]', dbErr);
          }
        }

        // Send WhatsApp reply via Meta Cloud API
        const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || '1314283051764757';
        const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;

        if (accessToken) {
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
              text: { body: replyAnswer }
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
