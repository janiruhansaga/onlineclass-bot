import type { VercelRequest, VercelResponse } from '@vercel/node';

// Default Meta Credentials Fallback
const DEFAULT_ACCESS_TOKEN = 'EAAV6PB2bsYYBSRE8FRINCvnQOgCNiT3zU5gfLdpZAdwsPtr6jvMWGGLmY8gD59ntJRtHSOLdH2VHmv33xnU6hGp2mh44nrZCmG7skA0bVrdi3ivkwxYsAMR3en3cSTSjXevd49YKulqhpfbL2Rj3tsArPKedZCXVMyoVQz0Fy2yduyzSrmGpj7WrtXnrUed29lc0BoP7kkSGyIHIcHsRql5vMHQLvs0E5SnKis7TiC8CYHO4GgOHXhdRy9KgHLCxuFOnctyaaomcP0Hn1D6ETjVPvVzNIZBtmKIZD';
const DEFAULT_PHONE_NUMBER_ID = '1314283051764757';

interface MultilingualFAQ {
  id: string;
  category: string;
  keywords: string[];
  enAnswer: string;
  siAnswer: string;
}

const FAQS: MultilingualFAQ[] = [
  {
    id: 'FAQ-SCH-009',
    category: 'Zoom Links & Live Sessions',
    keywords: ['zoom', 'link', 'ලින්ක්', 'ලින්ක් එක', 'ජූම්', 'class link', 'live class', 'panthi link', 'zoom link', 'koheda', 'thiyenne'],
    enAnswer: 'Live class links appear on your LMS Homepage 15 minutes before the session starts and are automatically sent to your WhatsApp batch group.',
    siAnswer: 'සජීවී පන්ති Zoom ලින්ක් එක පන්තිය ආරම්භ වීමට විනාඩි 15 කට පෙර ඔබේ LMS ප්‍රධාන පිටුවේ දර්ශනය වන අතර ඔබේ WhatsApp Group එකටද ස්වයංක්‍රීයව එවනු ලැබේ.'
  },
  {
    id: 'FAQ-FEE-002',
    category: 'Fees & Installments',
    keywords: ['installment', 'installments', 'fee', 'pay', 'monthly', 'වාරික', 'ගෙවීම්', 'ගාස්තු', 'gewanna', 'warika', 'masikawama', 'gaththa'],
    enAnswer: 'Yes! We offer a 3-month or 6-month zero-interest installment plan for all diploma programs. The first installment is due upon registration.',
    siAnswer: 'ඔව්! සියලුම ඩිප්ලෝමා පාඨමාලා සඳහා මාස 3 ක හෝ මාස 6 ක පොලී රහිත වාරික ගෙවීමේ ක්‍රම පවතී. පළමු වාරිකය ලියාපදිංචි වීමේදී ගෙවිය යුතුය.'
  },
  {
    id: 'FAQ-REC-001',
    category: 'Class Recordings',
    keywords: ['recording', 'recordings', 'upload', 'missed class', 'රෙකෝඩින්', 'වීඩියෝ', 'recordings upload', 'miss una', 'recordings'],
    enAnswer: 'Class recordings are processed and uploaded to the LMS within 4 hours after the live session concludes.',
    siAnswer: 'පන්තියේ සජීවී වීඩියෝ රෙකෝඩින්ග්ස් පන්තිය අවසන් වී පැය 4 ක් ඇතුළත ඔබේ LMS ගිණුමට අප්ලෝඩ් කරනු ලැබේ.'
  },
  {
    id: 'FAQ-SCH-001',
    category: 'Class Timings',
    keywords: ['timing', 'timings', 'time', 'schedule', 'welawa', 'welawal', 'වේලාව', 'පන්ති වෙලාව', 'කවදාද', 'kawadada', 'days', 'pantiya'],
    enAnswer: 'Weekday batches run Monday to Thursday from 7:00 PM to 9:00 PM IST. Weekend batches run Saturday 9:00 AM to 1:00 PM.',
    siAnswer: 'සතිදින පන්ති සඳුදා සිට බ්‍රහස්පතින්දා දක්වා රාත්‍රී 7:00 සිට 9:00 දක්වා පැවැත්වේ. සතිඅන්ත පන්ති සෙනසුරාදා උදෑසන 9:00 සිට පස්වරු 1:00 දක්වා පැවැත්වේ.'
  },
  {
    id: 'FAQ-CRT-001',
    category: 'Certificates',
    keywords: ['certificate', 'diploma', 'graduation', 'සහතිකය', 'සර්ටිෆිකට්', 'certificate eka', 'graduated', 'sahathikaya'],
    enAnswer: 'Digital certificates are generated automatically upon completing 80% class attendance and passing final assignments.',
    siAnswer: 'පන්ති පැමිණීම 80% ක් සම්පූර්ණ කර අවසාන පරීක්ෂණ සාර්ථකව නිම කිරීමෙන් පසු ඩිජිටල් සහතිකය (Digital Certificate) ස්වයංක්‍රීයව නිකුත් කෙරේ.'
  },
  {
    id: 'FAQ-ADM-001',
    category: 'Enrollment & Admission',
    keywords: ['enroll', 'admission', 'apply', 'registration', 'join', 'ලියාපදිංචි', 'ඇතුලත්', 'liyapadinchi', 'reg wenne', 'join wenne', 'pantiya'],
    enAnswer: 'You can enroll directly through our portal at onlineclass.edu/enroll or visit our admission center. Select your desired course, fill in your details, and submit application.',
    siAnswer: 'ඔබට අපගේ onlineclass.edu/enroll වෙබ් අඩවිය හරහා සෘජුවම ලියාපදිංචි විය හැක. ඔබ කැමති පාඨමාලාව තෝරා තොරතුරු ඇතුළත් කර අයදුම්පත යොමු කරන්න.'
  }
];

function detectLanguage(text: string): 'sinhala' | 'singlish' | 'english' {
  // Check for Sinhala Unicode character range [\u0D80-\u0DFF]
  const sinhalaRegex = /[\u0D80-\u0DFF]/;
  if (sinhalaRegex.test(text)) {
    return 'sinhala';
  }

  // Check for common Singlish patterns
  const singlishRegex = /\b(ekata|wenne|kawadada|koheda|pantiya|gewanna|thiyenne|karanne|gaththa|puluwanda|harida|ganne|koha)\b/i;
  if (singlishRegex.test(text)) {
    return 'singlish';
  }

  return 'english';
}

function findMultilingualAnswer(query: string): string {
  if (!query) {
    return "ආයුබෝවන්! OnlineClass සහාය වෙත සාදරයෙන් පිළිගනිමු. ඔබට උපකාර කරන්නේ කෙසේද?";
  }

  const lang = detectLanguage(query);
  const qLower = query.toLowerCase();

  let bestMatch: MultilingualFAQ | null = null;
  let maxScore = 0;

  for (const faq of FAQS) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (qLower.includes(kw.toLowerCase())) {
        score += kw.length > 3 ? 2 : 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && maxScore > 0) {
    return (lang === 'sinhala' || lang === 'singlish') ? bestMatch.siAnswer : bestMatch.enAnswer;
  }

  // Out of scope default response
  if (lang === 'sinhala' || lang === 'singlish') {
    return `ස්තුතියි! ඔබගේ පණිවිඩය ලැබුණි: "${query}". පාඨමාලා විස්තර, Zoom ලින්ක් සහ කාලසටහන් ඔබේ LMS ශිෂ්‍ය ගිණුමේ ඇති අතර, අපගේ නියෝජිතයෙකුද ළඟදීම ඔබ හා සම්බන්ධ වනු ඇත.`;
  }

  return `Thank you for contacting OnlineClass Support! We received your inquiry: "${query}". All course details, Zoom links, and class schedules are available on your LMS student portal.`;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET Verification for Meta Cloud API
  if (req.method === 'GET') {
    const mode = req.query?.['hub.mode'];
    const token = req.query?.['hub.verify_token'];
    const challenge = req.query?.['hub.challenge'];

    const VERIFY_TOKEN = process.env.META_WHATSAPP_VERIFY_TOKEN || 'onlineclass_whatsapp_2026';

    console.log(`[WhatsApp Webhook GET] Mode: ${mode}, Token: ${token}`);

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[WhatsApp Webhook Verified] Token matched!');
      return res.status(200).send(String(challenge));
    } else {
      console.warn('[WhatsApp Webhook Verification Failed] Token mismatch.');
      return res.status(403).send('Forbidden: Token mismatch');
    }
  }

  // 2. POST Incoming WhatsApp Message Event from Meta Cloud API
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
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
      const rawPhone = msg.from || '';
      const cleanPhone = rawPhone.replace(/[^\d]/g, '');
      const customerName = contacts?.[0]?.profile?.name || cleanPhone;
      let userText = '';

      if (msg.type === 'text') {
        userText = msg.text?.body || '';
      } else if (msg.type === 'interactive') {
        userText = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
      }

      if (userText && cleanPhone) {
        const lang = detectLanguage(userText);
        console.log(`[WhatsApp Incoming REAL] From: ${customerName} (${cleanPhone}) | Lang: ${lang} | Query: "${userText}"`);

        const answer = findMultilingualAnswer(userText);
        const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || DEFAULT_PHONE_NUMBER_ID;
        const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN || DEFAULT_ACCESS_TOKEN;

        console.log(`[Meta Outbound] Dispatching Answer (${lang}) to ${cleanPhone}...`);

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
