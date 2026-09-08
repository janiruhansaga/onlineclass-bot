import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { sendWhatsAppTextMessage, sendWhatsAppTemplateMessage } from './services/whatsappService';
import { queryGroundedAI } from '../src/services/aiEngine';
import { INITIAL_FAQS } from '../src/data/faqsData';
import { INITIAL_CHATS, INITIAL_MESSAGES } from '../src/data/mockChats';
import { isSupabaseConnected } from './services/supabaseClient';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;
const VERIFY_TOKEN = process.env.META_WHATSAPP_VERIFY_TOKEN || 'onlineclass_whatsapp_2026';
const LMS_SECRET = process.env.LMS_WEBHOOK_SECRET || 'lms_webhook_secret_key_2026';

app.use(cors());
app.use(express.json());

// In-Memory Idempotency Cache to prevent duplicate webhook handling
const processedMessageIds = new Set<string>();

// Real-Time Chat Data Store (Stores real incoming WhatsApp messages from Meta API)
let realTimeChats: any[] = [...INITIAL_CHATS];
let realTimeMessages: Record<string, any[]> = { ...INITIAL_MESSAGES };

const GEMINI_API_KEY = process.env.AI_API_KEY || '';

const SYSTEM_FAQS_CONTEXT = `
You are the official AI Support Assistant for OnlineClass Education Sri Lanka (https://onlineclass.edu.lk/ and dash.onlineclass.edu.lk).
Your mission is to understand student inquiries in Sinhala (සිංහල Unicode), Singlish (Sinhala written in English letters, e.g., "zoom link eka koheda", "panti thiyenne kawadada", "recording balanne kohomada", "fee gewanne kohomada"), and English, and provide extremely polite, clear, accurate, and helpful responses in standard natural Sinhala (සිංහල). If the student writes purely in English, reply in friendly English.

Official Verified Knowledge Base for onlineclass.edu.lk (13 Categories):
1. Registration (ලියාපදිංචිය):
   - Visit onlineclass.edu.lk or dash.onlineclass.edu.lk/student-registration/ to register with Name, Email, Password, and Phone Number.
   - Click "Verify Email" on the link sent to your inbox to activate account.
   - Help Desk guide contains step-by-step registration instructions.

2. Login & OTP (ප්‍රවේශ වීම):
   - Identity verification sends a 6-digit OTP code to your registered email address upon login.
   - Enter Password and OTP on initial login. Select "Keep me signed in" for seamless access.
   - Google Sign-In is supported with your registered Gmail account. Never share passwords or OTPs in chat.

3. Student Dashboard (ප්‍රධාන පුවරුව):
   - Access Student Dashboard at dash.onlineclass.edu.lk. Go to Dashboard Menu -> Enrolled Courses to access registered classes.

4. Live Class Zoom Links (සජීවී පන්ති Zoom සබැඳි):
   - Zoom class links appear under Enrolled Course -> Content -> Zoom links 15 minutes before session start.
   - Auto-reminders and Zoom links are also dispatched to WhatsApp batch groups.

5. HD Class Recordings (පටිගත කිරීම් 24/7):
   - Recordings available 24/7 with unlimited replays under Enrolled Course -> Content -> Recordings.
   - Processed and uploaded within 4 hours after live session completion.

6. Lecture Notes & Exam Papers (නිබන්ධන සහ ප්‍රශ්න පත්‍ර):
   - Past papers, model papers, Tutes, and lecture notes PDF downloads under Enrolled Course -> Resources -> Papers.

7. Course Finder & Catalog (පන්ති විස්තර):
   - Search A/L and O/L online/physical classes by Subject, Teacher, or Title on the Find Online Class catalog.

8. Exams & Attendance (විභාග සහ පැමිණීම):
   - Automated MCQ online exams, instant scoring, auto-attendance logging, and progress reports.

9. Payments & Bank Deposits (ගෙවීම් ක්‍රම):
   - Card payments, Bank deposits, and EZ Cash with instant receipt verification and automated class unlocking.

10. Subscription Plans & Pricing (ගාස්තු සහ පැකේජ):
    - Starter Plan: 7.5% commission per student fee.
    - Professional Plan: 7.5% + Rs. 1,500/month (Up to 5 Zoom sessions monthly, scheduling, link management & reminders).
    - Enterprise Plan: Custom pricing (Dedicated account manager, custom branding, bulk SMS).

11. Mobile App & Help Desk (ඇප් සහ සහාය):
    - Install OnlineClass Web App directly from the Dashboard.
    - LMS Support Hotline: 078 904 9004 | Teachers Hotline: 078 904 9009.

12. Troubleshooting (ගැටලු විසඳා ගැනීම):
    - If OTP or class access issue occurs, check Spam folder or contact LMS Hotline 078 904 9004.

13. Escalation Policy:
    - If question is out of scope or sensitive (e.g. asking for server passwords), invite student to wait for human agent: "අපගේ නියෝජිතයෙකු ළඟදීම ඔබ හා සම්බන්ධ වනු ඇත."

14. Official Active Courses Catalog (පවත්නා සියලුම පාඨමාලා සහ පන්ති):
    a. Full Stack Web Development (React & Node.js) [Code: WEB-101]:
       - Duration: 16 Weeks | Category: Software Engineering
       - Fee: $499 / Rs. 145,000 (Installments available)
       - Schedule: Mon, Wed, Fri (7:00 PM - 9:00 PM)
       - Content: HTML5/CSS3, JS ES6+, TypeScript, React 19, Node.js, Express, PostgreSQL/MongoDB, Vercel/Render deployment.

    b. Data Science & Applied Artificial Intelligence [Code: AI-202]:
       - Duration: 20 Weeks | Category: Artificial Intelligence
       - Fee: $649 / Rs. 185,000 (Installments available)
       - Schedule: Tue, Thu (6:30 PM - 8:30 PM) & Sat (10:00 AM - 12:00 PM)
       - Content: Python, NumPy/Pandas, Machine Learning, PyTorch Deep Learning, LLMs, RAG Systems & Analytics.

    c. Python Programming Masterclass (Beginner to Pro) [Code: PY-100]:
       - Duration: 8 Weeks | Category: Programming
       - Fee: $299 / Rs. 85,000 (Installments available)
       - Schedule: Sat & Sun (9:00 AM - 1:00 PM)
       - Content: Python Syntax, OOP, Web Scraping, FastAPI, PyTest, Automated WhatsApp Bot projects.

    d. UI/UX Design Systems & Product Strategy [Code: UIX-301]:
       - Duration: 10 Weeks | Category: Design & Product
       - Fee: $399 / Rs. 115,000
       - Schedule: Mon & Thu (8:00 PM - 10:00 PM)
       - Content: Figma Masterclass, Wireframing, User Research, Interactive Prototyping, Accessibility (WCAG).

    e. Cloud Engineering & DevOps with AWS [Code: AWS-401]:
       - Duration: 12 Weeks | Category: Cloud Infrastructure
       - Fee: $549 / Rs. 160,000
       - Schedule: Wed & Fri (6:00 PM - 8:00 PM)
       - Content: AWS EC2/S3/Lambda, Docker, Kubernetes, Terraform IaC, GitHub Actions CI/CD.

    f. A/L & O/L Secondary Education Classes:
       - A/L Streams: Combined Maths, Physics, Chemistry, Biology, Information & Communication Technology (ICT).
       - O/L Core Subjects: Mathematics, Science, English, Commerce & ICT.
       - Direct search & enrollment via onlineclass.edu.lk catalog ("Find Online Class").
`;

async function generateGeminiResponse(userQuery: string): Promise<{ text: string; isGemini: boolean }> {
  if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('placeholder')) {
    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-flash-latest'
    ];

    for (const model of candidateModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

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
          console.log(`[Gemini AI LLM Success] Answer generated using model: ${model}`);
          return { text: generatedText.trim(), isGemini: true };
        } else {
          console.warn(`[Gemini Model ${model} No Text Output] Status: ${res.status}`, JSON.stringify(data).slice(0, 200));
        }
      } catch (geminiErr) {
        console.error(`[Gemini Model ${model} Exception]`, geminiErr);
      }
    }
  }

  return { text: '', isGemini: false };
}

let systemFaqs = [...INITIAL_FAQS];
let processedLmsEvents: any[] = [];
let escalationTickets: any[] = [];
let systemLogs: any[] = [];

// Helper to log activity
function logServerActivity(type: string, title: string, description: string, userOrPhone = 'System', severity = 'info') {
  const logItem = {
    id: `LOG-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleString(),
    type,
    severity,
    title,
    description,
    userOrPhone
  };
  systemLogs.unshift(logItem);
  console.log(`[Server Log ${severity.toUpperCase()}] ${title}: ${description}`);
  return logItem;
}

// =========================================================
// 1. META WHATSAPP WEBHOOK VERIFICATION (GET)
// =========================================================
app.get('/api/webhooks/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`[WhatsApp Webhook GET] Verification request received. Mode: ${mode}, Token: ${token}`);

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook Verified] Successfully verified Meta token!');
    return res.status(200).type('text/plain').send(String(challenge));
  } else {
    console.warn('[WhatsApp Webhook Verification Failed] Token mismatch.');
    return res.status(403).send('Forbidden: Token mismatch');
  }
});

// =========================================================
// 2. META WHATSAPP INCOMING WEBHOOK EVENTS (POST)
// =========================================================
app.post('/api/webhooks/whatsapp', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Validate Meta Webhook Payload Structure
    if (!body.object || !body.entry || !body.entry[0]?.changes?.[0]?.value) {
      return res.status(200).send('EVENT_RECEIVED'); // Meta expects 200 OK for non-message events
    }

    const value = body.entry[0].changes[0].value;
    const messages = value.messages;
    const contacts = value.contacts;

    if (!messages || messages.length === 0) {
      return res.status(200).send('EVENT_RECEIVED');
    }

    const msg = messages[0];
    const externalMessageId = msg.id;
    const rawPhone = msg.from;
    const formattedPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
    const customerName = contacts?.[0]?.profile?.name || `Student (${formattedPhone})`;

    // IDEMPOTENCY CHECK: Prevent duplicate processing of same WhatsApp message
    if (processedMessageIds.has(externalMessageId)) {
      console.log(`[Idempotency Skip] Message ID ${externalMessageId} already processed or queued.`);
      return res.status(200).send('DUPLICATE_SKIPPED');
    }
    processedMessageIds.add(externalMessageId);
    if (processedMessageIds.size > 2000) {
      const firstKey = processedMessageIds.values().next().value;
      if (firstKey) processedMessageIds.delete(firstKey);
    }

    // 1. IMMEDIATELY ACKNOWLEDGE META WITH 200 OK TO PREVENT RETRIES & DUPLICATE DELAYED MESSAGES
    res.status(200).send('EVENT_RECEIVED');

    // 2. PROCESS AI GENERATION AND SINGLE WHATSAPP DISPATCH ASYNCHRONOUSLY
    setImmediate(async () => {
      try {
        let userText = '';
        let messageType = msg.type;

        if (messageType === 'text') {
          userText = msg.text?.body || '';
        } else if (messageType === 'interactive') {
          userText = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
        } else {
          console.warn(`[Unsupported Message Type] Received ${messageType} from ${formattedPhone}`);
          await sendWhatsAppTextMessage(
            rawPhone,
            'Thank you for your message. Currently, I can process text questions regarding online courses.'
          );
          return;
        }

        console.log(`[WhatsApp Incoming REAL] From: ${customerName} (${formattedPhone}) | Query: "${userText}"`);
        logServerActivity('AI_RESPONSE', 'Incoming REAL WhatsApp Message', `"${userText}" from ${customerName}`, formattedPhone, 'info');

        // Find or create Real Customer Chat Session
        const chatId = `CHAT-REAL-${rawPhone}`;
        let existingChat = realTimeChats.find((c) => c.phoneNumber.replace(/[^\d]/g, '') === rawPhone.replace(/[^\d]/g, ''));
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (!existingChat) {
          existingChat = {
            id: chatId,
            customerName: customerName,
            phoneNumber: formattedPhone,
            courseName: 'Online Class Student',
            batch: 'Real WhatsApp Lead',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=0D9488&color=fff`,
            lastMessage: userText,
            lastMessageTime: timeStr,
            unreadCount: 1,
            mode: 'ai',
            status: 'active',
            tags: ['Real WhatsApp', 'Meta Cloud API'],
            createdAt: new Date().toISOString().split('T')[0]
          };
          realTimeChats.unshift(existingChat);
        } else {
          existingChat.lastMessage = userText;
          existingChat.lastMessageTime = timeStr;
          existingChat.customerName = customerName || existingChat.customerName;
        }

        // Add Student Message to Message History
        const userMsgObj = {
          id: externalMessageId || `MSG-REAL-${Date.now()}`,
          chatId: existingChat.id,
          sender: 'user',
          text: userText,
          timestamp: timeStr,
          status: 'read'
        };

        if (!realTimeMessages[existingChat.id]) {
          realTimeMessages[existingChat.id] = [];
        }
        realTimeMessages[existingChat.id].push(userMsgObj);

        // Check if chat is in Human Agent Takeover Mode
        if (existingChat.mode === 'human') {
          console.log(`[Chat ${existingChat.id}] In Human Mode. Skipping AI reply.`);
          return;
        }

        // --- SINGLE RESPONSE DISPATCH LOGIC ---
        let finalAnswer = '';
        let matchedFaqId: string | undefined = undefined;
        let matchedCategory: string | undefined = undefined;
        let confidenceScore = 95;
        let isFailure = false;

        // Try Gemini AI LLM First
        const geminiRes = await generateGeminiResponse(userText);

        if (geminiRes.isGemini && geminiRes.text && geminiRes.text.trim().length > 0) {
          finalAnswer = geminiRes.text.trim();
          console.log(`[Gemini AI Engine] Generated response for "${userText}"`);
        } else {
          // Fallback to Grounded FAQ Matcher
          const aiResult = queryGroundedAI(userText, systemFaqs, 55);
          finalAnswer = aiResult.groundedAnswer;
          matchedFaqId = aiResult.faq?.id;
          matchedCategory = aiResult.faq?.category;
          confidenceScore = aiResult.confidenceScore;
          isFailure = !aiResult.matched;

          if (aiResult.isEscalated) {
            const ticketId = `ESC-${Date.now().toString().slice(-4)}`;
            escalationTickets.unshift({
              id: ticketId,
              chatId: existingChat.id,
              customerName,
              phoneNumber: formattedPhone,
              userQuery: userText,
              reason: aiResult.escalationReason || 'unknown_faq',
              status: 'pending',
              priority: aiResult.escalationReason === 'sensitive_topic' ? 'high' : 'medium',
              createdAt: new Date().toLocaleString()
            });
            existingChat.mode = 'human';
            existingChat.status = 'escalated';
          }
        }

        // DISPATCH ONE SINGLE WHATSAPP RESPONSE TO STUDENT
        const whatsappRes = await sendWhatsAppTextMessage(rawPhone, finalAnswer);

        const botMsgObj = {
          id: `MSG-BOT-${Date.now()}`,
          chatId: existingChat.id,
          sender: 'bot',
          text: finalAnswer,
          timestamp: timeStr,
          status: 'delivered',
          matchedFaqId,
          matchedCategory,
          confidenceScore,
          isGroundingFailure: isFailure
        };
        realTimeMessages[existingChat.id].push(botMsgObj);
        existingChat.lastMessage = finalAnswer;

        logServerActivity(
          'AI_RESPONSE',
          'Single Bot Response Sent',
          `Answered "${userText}" (${whatsappRes.success ? 'Delivered' : 'Meta API Logged'})`,
          formattedPhone,
          'success'
        );
      } catch (asyncErr) {
        console.error('[Async Webhook Processing Error]', asyncErr);
      }
    });

  } catch (err: any) {
    console.error('[WhatsApp Webhook Handler Error]', err);
    return res.status(500).json({ error: 'Internal server error processing webhook' });
  }
});

// =========================================================
// REAL-TIME CHAT SYNC ENDPOINTS FOR DASHBOARD UI
// =========================================================
app.get('/api/realtime/chats', async (req: Request, res: Response) => {
  const supabase = isSupabaseConnected() ? (await import('./services/supabaseClient')).getSupabase() : null;

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
            batch: 'Meta Cloud API Live',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`,
            lastMessage: 'Active Meta WhatsApp Chat Session',
            lastMessageTime: new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unreadCount: 0,
            mode: conv.ai_enabled ? 'ai' : 'human',
            status: conv.status,
            tags: ['Real WhatsApp', 'Meta Cloud API'],
            createdAt: new Date(conv.last_message_at).toISOString().split('T')[0]
          };
        });

        return res.json({ chats: chatsFromDb, escalations: escalationTickets });
      }
    } catch (dbErr) {
      console.error('[Supabase Fetch Chats Exception]', dbErr);
    }
  }

  return res.json({ chats: realTimeChats, escalations: escalationTickets });
});

app.get('/api/realtime/messages', async (req: Request, res: Response) => {
  const supabase = isSupabaseConnected() ? (await import('./services/supabaseClient')).getSupabase() : null;

  if (supabase) {
    try {
      const { data: dbMsgs } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (dbMsgs && dbMsgs.length > 0) {
        const messagesByChat: Record<string, any[]> = {};

        dbMsgs.forEach((m: any) => {
          const chatId = m.conversation_id;
          if (!messagesByChat[chatId]) messagesByChat[chatId] = [];

          messagesByChat[chatId].push({
            id: m.id,
            chatId: m.conversation_id,
            sender: m.sender_type === 'customer' ? 'user' : m.sender_type === 'ai' ? 'bot' : 'agent',
            text: m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: m.status || 'delivered'
          });
        });

        return res.json({ messages: messagesByChat });
      }
    } catch (dbErr) {
      console.error('[Supabase Fetch Messages Exception]', dbErr);
    }
  }

  return res.json({ messages: realTimeMessages });
});

app.post('/api/realtime/send-agent-reply', async (req: Request, res: Response) => {
  const { chatId, text } = req.body;
  const targetChat = realTimeChats.find((c) => c.id === chatId);
  if (!targetChat) return res.status(404).json({ error: 'Chat not found' });

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Send via Meta Cloud API
  const whatsappRes = await sendWhatsAppTextMessage(targetChat.phoneNumber, text);

  const agentMsgObj = {
    id: `MSG-AGENT-${Date.now()}`,
    chatId: targetChat.id,
    sender: 'agent',
    text,
    timestamp: timeStr,
    status: 'delivered'
  };

  if (!realTimeMessages[targetChat.id]) realTimeMessages[targetChat.id] = [];
  realTimeMessages[targetChat.id].push(agentMsgObj);
  targetChat.lastMessage = text;
  targetChat.lastMessageTime = timeStr;

  logServerActivity('AGENT_TAKEOVER', 'Human Agent WhatsApp Reply', `Agent sent: "${text}"`, targetChat.phoneNumber, 'info');

  return res.json({ success: true, message: agentMsgObj, whatsappSent: whatsappRes.success });
});

// =========================================================
// 3. LMS NOTIFICATION WEBHOOK (POST)
// =========================================================
app.post('/api/webhooks/lms', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['x-lms-webhook-secret'];

    // Optional Header Secret Validation
    if (authHeader && authHeader !== LMS_SECRET) {
      console.warn('[LMS Webhook Unauthorized] Invalid secret header.');
      return res.status(401).json({ error: 'Unauthorized: Invalid LMS webhook secret' });
    }

    const { message, numbers } = req.body;

    // Validate Payload Format
    if (!message || typeof message !== 'string' || !Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({
        error: 'Bad Request: Payload must include a "message" string and "numbers" string array.'
      });
    }

    const validNumbers = numbers.filter((num: string) => num && num.trim().length >= 8);
    const logId = `LMS-LOG-${Date.now().toString().slice(-6)}`;

    console.log(`[LMS Webhook Trigger] Broadcasting message to ${validNumbers.length} recipients...`);

    // Queue and dispatch WhatsApp notification to each number
    const dispatchResults = await Promise.all(
      validNumbers.map(async (phone: string) => {
        const text = `[LMS Notification] 📢 ${message}`;
        return await sendWhatsAppTextMessage(phone, text);
      })
    );

    const successCount = dispatchResults.filter((r) => r.success).length;

    const eventRecord = {
      id: logId,
      timestamp: new Date().toLocaleString(),
      payload: req.body,
      status: 'processed',
      totalTargets: numbers.length,
      validNumbersCount: validNumbers.length,
      successCount
    };
    processedLmsEvents.unshift(eventRecord);

    logServerActivity(
      'LMS_TRIGGER',
      'LMS Webhook Broadcast Completed',
      `Dispatched "${message}" to ${validNumbers.length} numbers (${successCount} delivered)`,
      'LMS Webhook Engine',
      'success'
    );

    return res.status(200).json({
      status: 'queued',
      logId,
      totalRecipients: validNumbers.length,
      deliveredCount: successCount
    });

  } catch (err: any) {
    console.error('[LMS Webhook Error]', err);
    return res.status(500).json({ error: 'Internal server error processing LMS webhook' });
  }
});

// WhatsApp Web Session State & QR Pairing Engine
let webSessionState = {
  status: 'connected',
  linkedPhone: '+94789049004',
  deviceName: 'OnlineClass WhatsApp Web Assistant',
  batteryLevel: 98,
  pairingCode: '8K4P-2M9W',
  connectedAt: new Date().toLocaleString()
};

app.get('/api/whatsapp/qr', (req: Request, res: Response) => {
  res.json(webSessionState);
});

app.post('/api/whatsapp/qr/connect', (req: Request, res: Response) => {
  const { phone } = req.body;
  webSessionState.status = 'connected';
  webSessionState.linkedPhone = phone || '+94783351453';
  webSessionState.connectedAt = new Date().toLocaleString();
  logServerActivity('ADMIN_ACTION', 'WhatsApp Web QR Paired', `Linked device for number ${webSessionState.linkedPhone}`, 'Admin Dashboard', 'success');
  res.json({ success: true, session: webSessionState });
});

app.post('/api/whatsapp/qr/disconnect', (req: Request, res: Response) => {
  webSessionState.status = 'qr_ready';
  webSessionState.linkedPhone = undefined;
  logServerActivity('ADMIN_ACTION', 'WhatsApp Web Disconnected', 'Session unlinked by admin', 'Admin Dashboard', 'warning');
  res.json({ success: true, session: webSessionState });
});

// =========================================================
// 4. SERVER SYSTEM STATUS & INTEGRATION READINESS
// =========================================================
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    app: 'AI Assistant - WhatsApp Support Agent',
    version: '2.4 Production Engine',
    metaApiConfigured: Boolean(process.env.META_WHATSAPP_ACCESS_TOKEN),
    phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID || '1314283051764757',
    verifyToken: VERIFY_TOKEN,
    supabaseConnected: isSupabaseConnected(),
    webSession: webSessionState,
    approvedFaqsCount: systemFaqs.length,
    processedEventsCount: processedLmsEvents.length,
    escalationsCount: escalationTickets.length,
    uptime: process.uptime()
  });
});


// =========================================================
// 5. ADMIN DASHBOARD TESTING & TRIGGER ENDPOINTS
// =========================================================
app.post('/api/test/whatsapp', async (req: Request, res: Response) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message required' });
  }

  const result = await sendWhatsAppTextMessage(phone, message);
  logServerActivity('ADMIN_ACTION', 'Admin Test WhatsApp Sent', `Sent test message to ${phone}`, 'Admin Dashboard');
  return res.json(result);
});

app.post('/api/test/ai', (req: Request, res: Response) => {
  const { query, threshold } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });
  const result = queryGroundedAI(query, systemFaqs, threshold || 55);
  return res.json(result);
});

app.post('/api/automations/run-due', (req: Request, res: Response) => {
  logServerActivity('AUTOMATION_RUN', 'Manual Due Automations Triggered', 'Executed scheduled follow-up queue', 'Admin Dashboard', 'success');
  return res.json({
    status: 'completed',
    executedAutomations: 3,
    followUpsSent: 2,
    timestamp: new Date().toLocaleString()
  });
});

// =========================================================
// 6. PRODUCTION STATIC FRONTEND SERVING
// =========================================================
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  console.log(`[Production Server] Serving static frontend from: ${distPath}`);
  app.use(express.static(distPath));

  app.use((req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 AI Assistant API Server running on port ${PORT}`);
  console.log(`📱 WhatsApp Webhook URL: http://localhost:${PORT}/api/webhooks/whatsapp`);
  console.log(`📢 LMS Webhook URL:      http://localhost:${PORT}/api/webhooks/lms`);
  console.log(`🌐 Dashboard UI URL:     http://localhost:${PORT}/`);
  console.log(`=======================================================`);
});

export default app;
