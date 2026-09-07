import type { VercelRequest, VercelResponse } from '@vercel/node';

// Default Meta Credentials Fallback
const DEFAULT_ACCESS_TOKEN = 'EAAV6PB2bsYYBSRzgiXhFaVLZCJl6iynS9LtWwhZBUsvfpoCB5Mz3yGYb5TyrMKxF634agYmksGyXqBZAZCJaRtMHNnzWZAnFuDHWZA6g9MByTudibC3ZBEpZCEaXFeY6oSUzC4fZC0u3e2lllqUQiZCJjmWZA0hRZCZCca4rm1KOTGBUKIfY3Kc5VqyQHoZCn6kgWfcAZDZD';
const DEFAULT_PHONE_NUMBER_ID = '1314283051764757';
const GEMINI_API_KEY = process.env.AI_API_KEY || '';

const SYSTEM_FAQS_CONTEXT = `
You are the official AI Support Assistant for OnlineClass Education Sri Lanka (dash.onlineclass.edu.lk).
Your mission is to understand student inquiries in Sinhala (සිංහල Unicode), Singlish (Sinhala written in English letters, e.g., "zoom link eka koheda", "panti thiyenne kawadada"), and English, and provide extremely polite, clear, accurate, and helpful responses in standard natural Sinhala (සිංහල). If the student writes purely in English, reply in friendly English.

Official Verified Knowledge Base (13 Categories):
1. Registration (ලියාපදිංචිය):
   - dash.onlineclass.edu.lk/student-registration/ වෙත ගොස් Name, Email, Password සහ අදාළ විස්තර ඇතුළත් කර register වන්න.
   - Verification email එකක් ලැබෙන අතර “Verify Email” click කළ පසු වෙබ් අඩවිය භාවිතා කළ හැක.
   - Help Desk හි “වෙබ් අඩවියෙහි ලියාපදිංචි වන ආකාරය” guide එක ඇත.

2. Login & OTP (ප්‍රවේශ වීම):
   - Login වීමේදී identity verification සඳහා registered email එකට OTP එකක් යවනු ලැබේ.
   - First login එකේදී Email/Password පසු OTP එක ඇතුළත් කරන්න. Keep me signed in මගින් නැවත login වීම අඩු කරගත හැක.
   - Relevant Gmail account එකෙන් Google sign-in කළ හැක. Password හෝ OTP කිසිවිටක chatbot එකට ලබානොදෙන්න.

3. Dashboard (ප්‍රධාන පුවරුව):
   - Login වූ පසු Dashboard වෙත යනු ලැබේ. Dashboard Menu → Enrolled Course යටතේ අදාළ class එක open කරගත හැක.
   - dash.onlineclass.edu.lk menu එකේ Help Desk ඇත.

4. Recordings (පටිගත කිරීම්):
   - Recordings බලන්න: Dashboard → Enrolled Course → අදාළ class → Content → Recordings වෙත යන්න.
   - 24/7 access සහ unlimited replays සහිත HD recordings පවතී. Content section එකේ Recordings සහ Zoom links ඇත.

5. Zoom Links (සජීවී පන්ති):
   - Zoom link එක: Enrolled Course → Content → Zoom links වෙත යන්න. One-click join සහ Zoom session reminders support කරයි.

6. Resources & Papers (නිබන්ධන සහ ප්‍රශ්න පත්‍ර):
   - Papers: Enrolled Course → Resources → Papers. Lecture notes, tutes, model papers, PDF downloads support කරයි.

7. Classes (පන්ති විස්තර):
   - Find Online Class page එකේ Title, Subject හෝ Description search කර A/L සහ O/L physical/online classes සෙවිය හැක. WhatsApp promotion option එකෙන් share කළ හැක.

8. Exams & Attendance (විභාග සහ පැමිණීම):
   - Online exams, quizzes, automatic MCQ scoring, instant analytics, auto-attendance සහ live progress reports පවතී.

9. Payments (ගෙවීම් ක්‍රම):
   - Bank deposits හෝ Online Card payments මගින් secure activation සිදු කළ හැක.

10. Pricing & Plans (ගාස්තු සහ පැකේජ):
    - Starter Plan: 7.5% commission (Zoom නැත).
    - Professional Plan: 7.5% + Rs. 1,500/month (Up to 5 Zoom sessions monthly, scheduling, link management & reminders).
    - Enterprise Plan: Custom pricing (Dedicated account manager, custom branding, bulk SMS & custom integrations).

11. Mobile App & Help Desk (ඇප් සහ සහාය මධ්‍යස්ථානය):
    - Dashboard site එකේ OnlineClass App install option එක ඇත.
    - Support Hotlines: LMS inquiries: 078 904 9004 | Teachers Hotline: 078 904 9009.

12. Troubleshooting & Support (ගැටලු විසඳා ගැනීම):
    - Email/OTP නොලැබුණොත් හෝ Class නොපෙනේ නම් inbox/spam පරීක්ෂා කර LMS support / Help Desk (078 904 9004) වෙත සම්බන්ධ වන්න.

13. AI Chatbot Guidelines / System Fallback:
    - Knowledge base එකේ නැති තොරතුරු සඳහා: "මේ ගැන නිවැරදි තොරතුරක් මට දැනට ලබාගත නොහැක. කරුණාකර LMS support වෙත සම්බන්ධ වන්න." ලෙස පවසන්න.
    - කිසිවිටකත් මිල ගණන් හෝ විස්තර මනෝකල්පිතව සාදන්න එපා (Do NOT invent prices/details).

Response Style Guidelines:
- Start Sinhala replies with a warm greeting such as "ආයුබෝවන්!" or "ස්තූතියි අප හා සම්බන්ධ වීම ගැන!".
- Keep the tone polite, professional, encouraging, and friendly.
- Use clear bullet points and appropriate emojis (📚, 🎥, 💳, 🎓, ⏰, 📲) to make WhatsApp messages easy to read on mobile devices.
- Do NOT make up false information outside this knowledge base. If unsure, invite the student to wait for a human agent ("අපගේ නියෝජිතයෙකු ළඟදීම ඔබ හා සම්බන්ධ වනු ඇත").
`;

// Gemini AI LLM Generator with Fallback
async function generateGeminiResponse(userQuery: string): Promise<string> {
  if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('placeholder')) {
    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash'
    ];

    for (const model of candidateModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: SYSTEM_FAQS_CONTEXT },
                  { text: `Student Question: "${userQuery}"` }
                ]
              }
            ]
          })
        });

        clearTimeout(timeoutId);
        const data = await res.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          console.log(`[Gemini AI Success] Generated answer using model: ${model}`);
          return generatedText.trim();
        }
      } catch (geminiErr) {
        console.error(`[Gemini Model ${model} Exception]`, geminiErr);
      }
    }
  }

  // Fallback Local Sinhala/English Matcher
  const q = userQuery.toLowerCase();
  const isSinhalaOrSinglish = /[\u0D80-\u0DFF]|\b(ekata|wenne|kawadada|koheda|pantiya|gewanna|thiyenne|gaththa|puluwanda|denda|sinhala|register|login|recording|paper|notes|fee|plan)\b/i.test(userQuery);

  if (q.includes('zoom') || q.includes('ලින්ක්') || q.includes('link')) {
    return isSinhalaOrSinglish
      ? "ආයුබෝවන්! 📚 සජීවී පන්ති Zoom ලින්ක් එක පන්තිය ආරම්භ වීමට විනාඩි 15 කට පෙර ඔබේ LMS ප්‍රධාන පිටුවේ (Enrolled Course → Content → Zoom links) දර්ශනය වන අතර ඔබේ WhatsApp Group එකටද එවනු ලැබේ."
      : "Live class links appear on your LMS Homepage (Enrolled Course > Content > Zoom links) 15 minutes before the session starts and are automatically sent to your WhatsApp batch group.";
  }
  if (q.includes('installment') || q.includes('fee') || q.includes('ගාස්තු') || q.includes('වාරික') || q.includes('gewanna') || q.includes('plan')) {
    return isSinhalaOrSinglish
      ? "ආයුබෝවන්! 💳 ඔව්, Starter (7.5% commission), Professional (Rs. 1,500/mo) සහ Enterprise පැකේජ පවතී. online card, bank transfer හෝ EZ Cash මගින් ගෙවිය හැක."
      : "Yes! Starter, Professional (Rs. 1,500/mo), and Enterprise plans are available. Card payments and bank deposits are supported.";
  }
  if (q.includes('recording') || q.includes('රෙකෝඩින්')) {
    return isSinhalaOrSinglish
      ? "ආයුබෝවන්! 🎥 පන්තියේ සජීවී වීඩියෝ HD රෙකෝඩින්ග්ස් Dashboard → Enrolled Course → Content → Recordings යටතේ 24/7 unlimited replays සමඟ බලන්න පුළුවන."
      : "Class recordings are processed and available 24/7 on your LMS portal under Enrolled Course > Content > Recordings.";
  }
  if (q.includes('register') || q.includes('ලියාපදිංචි')) {
    return isSinhalaOrSinglish
      ? "ආයුබෝවන්! 📝 dash.onlineclass.edu.lk/student-registration/ වෙත ගොස් Name, Email, Password ඇතුළත් කර register වන්න. Verification email එකක් ලැබෙනු ඇත."
      : "To register, visit dash.onlineclass.edu.lk/student-registration/ and complete the form. A verification email will be sent.";
  }
  if (q.includes('paper') || q.includes('notes') || q.includes('tute') || q.includes('ප්‍රශ්න පත්‍ර')) {
    return isSinhalaOrSinglish
      ? "ආයුබෝවන්! 📄 Past papers, Model papers, Lecture notes සහ PDF downloads Enrolled Course → Resources යටතේ ලබාගත හැක."
      : "Lecture notes, tutes, model papers, and PDF downloads are available under Enrolled Course > Resources > Papers.";
  }
  if (q.includes('hotline') || q.includes('phone') || q.includes('contact') || q.includes('කතා කරන්න')) {
    return isSinhalaOrSinglish
      ? "ආයුබෝවන්! 📞 LMS සහාය සඳහා hotline: 078 904 9004 | ගුරුවරුන්ගේ hotline: 078 904 9009 වෙත අමතන්න."
      : "LMS Support Hotline: 078 904 9004 | Teachers Hotline: 078 904 9009.";
  }

  return isSinhalaOrSinglish
    ? `ආයුබෝවන්! ඔබගේ පණිවිඩය ලැබුණි: "${userQuery}". සියලුම පන්ති විස්තර, Zoom links සහ recordings ඔබේ LMS ගිණුමේ (dash.onlineclass.edu.lk) ඇති අතර, අපගේ නියෝජිතයෙකුද (Hotline: 078 904 9004) ළඟදීම ඔබ හා සම්බන්ධ වනු ඇත.`
    : `Thank you for contacting OnlineClass Support! We received your query: "${userQuery}". All class details, Zoom links, and schedules are available on your student portal (dash.onlineclass.edu.lk). Hotline: 078 904 9004.`;
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
        console.log(`[WhatsApp Incoming REAL] From: ${customerName} (${cleanPhone}) | Query: "${userText}"`);

        // Generate response using Gemini AI LLM / Sinhala Engine
        const answer = await generateGeminiResponse(userText);
        const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || DEFAULT_PHONE_NUMBER_ID;
        const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN || DEFAULT_ACCESS_TOKEN;

        console.log(`[Meta Cloud Outbound] Dispatching Gemini AI Answer to ${cleanPhone}...`);

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

          if (!metaRes.ok && metaJson.error?.code === 131030) {
            console.error(`[Meta Error 131030] Recipient ${cleanPhone} is not in Meta Developer Portal allowed recipient list! Please add ${cleanPhone} to Meta Developer Portal > WhatsApp > API Setup > To field.`);
          } else if (!metaRes.ok && metaJson.error?.code === 131047) {
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
