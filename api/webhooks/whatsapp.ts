import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendWhatsAppTextMessage } from '../../server/services/whatsappService';
import { queryGroundedAI } from '../../src/services/aiEngine';
import { INITIAL_FAQS } from '../../src/data/faqsData';

const VERIFY_TOKEN = process.env.META_WHATSAPP_VERIFY_TOKEN || 'onlineclass_whatsapp_2026';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. GET: Webhook Verification from Meta Developer Console
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log(`[WhatsApp Webhook GET] Mode: ${mode}, Token: ${token}, Challenge: ${challenge}`);

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[WhatsApp Webhook Verified] Successfully verified Meta token!');
      return res.status(200).send(String(challenge));
    } else {
      console.warn('[WhatsApp Webhook Verification Failed] Token mismatch.');
      return res.status(403).send('Forbidden: Token mismatch');
    }
  }

  // 2. POST: Incoming WhatsApp Message Event from Meta Cloud API
  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (!body || !body.object || !body.entry || !body.entry[0]?.changes?.[0]?.value) {
        return res.status(200).send('EVENT_RECEIVED');
      }

      const value = body.entry[0].changes[0].value;
      const messages = value.messages;

      if (!messages || messages.length === 0) {
        return res.status(200).send('EVENT_RECEIVED');
      }

      const msg = messages[0];
      const rawPhone = msg.from;
      let userText = '';

      if (msg.type === 'text') {
        userText = msg.text?.body || '';
      } else if (msg.type === 'interactive') {
        userText = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
      }

      if (userText) {
        console.log(`[WhatsApp Incoming] Phone: ${rawPhone} | Text: "${userText}"`);

        // Query AI Grounded Engine against 136 Approved FAQs
        const aiResult = queryGroundedAI(userText, INITIAL_FAQS, 55);
        const replyAnswer = aiResult.groundedAnswer;

        // Send reply directly back to sender's WhatsApp phone number
        await sendWhatsAppTextMessage(rawPhone, replyAnswer);
      }

      return res.status(200).send('EVENT_RECEIVED');
    } catch (err: any) {
      console.error('[WhatsApp Webhook Error]', err);
      return res.status(500).send('INTERNAL_SERVER_ERROR');
    }
  }

  return res.status(405).send('Method Not Allowed');
}
