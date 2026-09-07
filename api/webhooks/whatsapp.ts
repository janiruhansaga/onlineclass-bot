import type { VercelRequest, VercelResponse } from '@vercel/node';

// Default Meta Credentials Fallback
const DEFAULT_ACCESS_TOKEN = 'EAAV6PB2bsYYBSRE8FRINCvnQOgCNiT3zU5gfLdpZAdwsPtr6jvMWGGLmY8gD59ntJRtHSOLdH2VHmv33xnU6hGp2mh44nrZCmG7skA0bVrdi3ivkwxYsAMR3en3cSTSjXevd49YKulqhpfbL2Rj3tsArPKedZCXVMyoVQz0Fy2yduyzSrmGpj7WrtXnrUed29lc0BoP7kkSGyIHIcHsRql5vMHQLvs0E5SnKis7TiC8CYHO4GgOHXhdRy9KgHLCxuFOnctyaaomcP0Hn1D6ETjVPvVzNIZBtmKIZD';
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
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const data = await res.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        return generatedText.trim();
      }
    } catch (geminiErr) {
      console.error('[Gemini API Exception]', geminiErr);
    }
  }

  // Fallback Local Sinhala/English Matcher
  const q = userQuery.toLowerCase();
  const isSinhalaOrSinglish = /[\u0D80-\u0DFF]|\b(ekata|wenne|kawadada|koheda|pantiya|gewanna|thiyenne|gaththa|puluwanda|denda|sinhala)\b/i.test(userQuery);

  if (q.includes('zoom') || q.includes('ලින්ක්') || q.includes('link')) {
    return isSinhalaOrSinglish
      ? "ආයුබෝවන්! 📚 සජීවී පන්ති Zoom ලින්ක් එක පන්තිය ආරම්භ වීමට විනාඩි 15 කට පෙර ඔබේ LMS ප්‍රධාන පිටුවේ දර්ශනය වන අතර ඔබේ WhatsApp Group එකටද එවනු ලැබේ."
      : "Live class links appear on your LMS Homepage 15 minutes before the session starts and are automatically sent to your WhatsApp batch group.";
  }
  if (q.includes('installment') || q.includes('fee') || q.includes('ගාස්තු') || q.includes('වාරික') || q.includes('gewanna')) {
    return isSinhalaOrSinglish
      ? "ආයුබෝවන්! 💳 ඔව්, සියලුම ඩිප්ලෝමා පාඨමාලා සඳහා මාස 3 ක හෝ මාස 6 ක පොලී රහිත වාරික ගෙවීමේ ක්‍රම පවතී. online card, bank transfer හෝ EZ Cash මගින් ගෙවිය හැක."
      : "Yes! We offer a 3-month or 6-month zero-interest installment plan for all diploma programs.";
  }
  if (q.includes('recording') || q.includes('රෙකෝඩින්')) {
    return isSinhalaOrSinglish
      ? "ආයුබෝවන්! 🎥 පන්තියේ සජීවී වීඩියෝ රෙකෝඩින්ග්ස් පන්තිය අවසන් වී පැය 4 ක් ඇතුළත ඔබේ LMS ගිණුමට අප්ලෝඩ් කරනු ලැබේ. එය වසර 1 ක් පුරා නැරඹිය හැක."
      : "Class recordings are processed and uploaded to the LMS within 4 hours after the live session concludes.";
  }

  return isSinhalaOrSinglish
    ? `ආයුබෝවන්! ඔබගේ පණිවිඩය ලැබුණි: "${userQuery}". පාඨමාලා විස්තර සහ කාලසටහන් ඔබේ LMS ගිණුමේ ඇති අතර, අපගේ නියෝජිතයෙකුද ළඟදීම ඔබ හා සම්බන්ධ වනු ඇත.`
    : `Thank you for contacting OnlineClass Support! We received your query: "${userQuery}". All class details, Zoom links, and schedules are available on your student portal.`;
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
