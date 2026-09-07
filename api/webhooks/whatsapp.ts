import type { VercelRequest, VercelResponse } from '@vercel/node';

// Default Meta Credentials Fallback
const DEFAULT_ACCESS_TOKEN = 'EAAV6PB2bsYYBSRE8FRINCvnQOgCNiT3zU5gfLdpZAdwsPtr6jvMWGGLmY8gD59ntJRtHSOLdH2VHmv33xnU6hGp2mh44nrZCmG7skA0bVrdi3ivkwxYsAMR3en3cSTSjXevd49YKulqhpfbL2Rj3tsArPKedZCXVMyoVQz0Fy2yduyzSrmGpj7WrtXnrUed29lc0BoP7kkSGyIHIcHsRql5vMHQLvs0E5SnKis7TiC8CYHO4GgOHXhdRy9KgHLCxuFOnctyaaomcP0Hn1D6ETjVPvVzNIZBtmKIZD';
const DEFAULT_PHONE_NUMBER_ID = '1314283051764757';

// 136 Approved FAQs Summary Table for Grounded Match
const FAQS = [
  { q: "zoom link class today", a: "Live class links appear on your LMS Homepage 15 minutes before the session starts and are automatically sent to your WhatsApp batch group." },
  { q: "installments fee pay monthly", a: "Yes! We offer a 3-month or 6-month zero-interest installment plan for all diploma programs. The first installment is due upon registration." },
  { q: "recording upload live session", a: "Class recordings are processed and uploaded to the LMS within 4 hours after the live session concludes." },
  { q: "class timings weekday batch", a: "Weekday batches run Monday to Thursday from 7:00 PM to 9:00 PM IST. Weekend batches run Saturday 9:00 AM to 1:00 PM." },
  { q: "completion certificate diploma", a: "Digital certificates are generated automatically upon completing 80% class attendance and passing final assignments." },
  { q: "enroll admission join course", a: "You can enroll directly through our portal or visit our admission center. Select your desired course, fill in your details, and submit application." }
];

function findAnswer(query: string): string {
  const q = query.toLowerCase();
  for (const faq of FAQS) {
    const keywords = faq.q.split(' ');
    const matchCount = keywords.filter(k => q.includes(k)).length;
    if (matchCount >= 2 || (keywords.length === 1 && q.includes(keywords[0]))) {
      return faq.a;
    }
  }
  return `Thank you for contacting OnlineClass Support! We received your inquiry: "${query}". All course details, schedules, and LMS links are available on your student dashboard.`;
}

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
      console.log('[WhatsApp Webhook Verified] Successfully verified Meta token!');
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
      const customerName = contacts?.[0]?.profile?.name || cleanPhone;
      let userText = '';

      if (msg.type === 'text') {
        userText = msg.text?.body || '';
      } else if (msg.type === 'interactive') {
        userText = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
      }

      if (userText) {
        console.log(`[WhatsApp Incoming REAL] From: ${customerName} (${cleanPhone}) | Query: "${userText}"`);

        const answer = findAnswer(userText);
        const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || DEFAULT_PHONE_NUMBER_ID;
        const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN || DEFAULT_ACCESS_TOKEN;

        console.log(`[Meta Cloud Outbound] Dispatching Answer to ${cleanPhone}...`);

        try {
          const metaRes = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
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
              text: { body: answer }
            })
          });

          const metaJson = await metaRes.json();
          console.log(`[Meta Response Status ${metaRes.status}]`, metaJson);

          // If Meta returns 24h session error (#131047), send hello_world template
          if (!metaRes.ok && metaJson.error?.code === 131047) {
            console.warn('[Meta Session Expired] Re-sending template message...');
            await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: cleanPhone,
                type: 'template',
                template: { name: 'hello_world', language: { code: 'en_US' } }
              })
            });
          }
        } catch (metaErr) {
          console.error('[Meta Outbound Exception]', metaErr);
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
