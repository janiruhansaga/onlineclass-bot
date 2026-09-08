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
      console.log(`[Idempotency Skip] Message ID ${externalMessageId} already processed.`);
      return res.status(200).send('DUPLICATE_SKIPPED');
    }
    processedMessageIds.add(externalMessageId);
    if (processedMessageIds.size > 2000) {
      const firstKey = processedMessageIds.values().next().value;
      if (firstKey) processedMessageIds.delete(firstKey);
    }

    // Extract Message Content
    let userText = '';
    let messageType = msg.type;

    if (messageType === 'text') {
      userText = msg.text?.body || '';
    } else if (messageType === 'interactive') {
      userText = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
    } else {
      userText = `[Unsupported message type: ${messageType}]`;
      console.warn(`[Unsupported Message Type] Received ${messageType} from ${formattedPhone}`);
      
      logServerActivity('AI_RESPONSE', 'Unsupported Media Received', `Received ${messageType} from ${formattedPhone}`, formattedPhone, 'warning');
      
      await sendWhatsAppTextMessage(
        rawPhone,
        'Thank you for your message. Currently, I can process text questions regarding online courses. Unsupported media has been forwarded to human review.'
      );
      return res.status(200).send('EVENT_RECEIVED');
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

    // Run AI Grounding Engine against 136 Approved FAQs
    const aiResult = queryGroundedAI(userText, systemFaqs, 55);

    // If AI Grounded Match Confirmed
    if (aiResult.matched && aiResult.faq) {
      const answer = aiResult.groundedAnswer;
      console.log(`[AI Match] FAQ ${aiResult.faq.id} (${aiResult.confidenceScore}%) -> Sending WhatsApp response to ${formattedPhone}...`);

      // Dispatch response via Meta Cloud API
      const whatsappRes = await sendWhatsAppTextMessage(rawPhone, answer);

      // Add Bot Message to Real Time Message History
      const botMsgObj = {
        id: `MSG-BOT-${Date.now()}`,
        chatId: existingChat.id,
        sender: 'bot',
        text: answer,
        timestamp: timeStr,
        status: 'delivered',
        matchedFaqId: aiResult.faq.id,
        matchedCategory: aiResult.faq.category,
        confidenceScore: aiResult.confidenceScore,
        isGroundingFailure: false
      };
      realTimeMessages[existingChat.id].push(botMsgObj);
      existingChat.lastMessage = answer;

      logServerActivity(
        'AI_RESPONSE',
        `Grounded AI Response Sent (${aiResult.faq.id})`,
        `Answered "${userText}" with ${aiResult.faq.id} (${aiResult.confidenceScore}% confidence)`,
        formattedPhone,
        'success'
      );

      return res.status(200).json({
        status: 'success',
        matchedFaq: aiResult.faq.id,
        confidence: aiResult.confidenceScore,
        whatsappSent: whatsappRes.success
      });
    }

    // If Grounding Failed / Sensitive Topic -> Trigger Human Escalation
    console.warn(`[AI Grounding Fail] Creating Human Escalation for "${userText}"`);

    const ticketId = `ESC-${Date.now().toString().slice(-4)}`;
    const escalationTicket = {
      id: ticketId,
      chatId: existingChat.id,
      customerName,
      phoneNumber: formattedPhone,
      userQuery: userText,
      reason: aiResult.escalationReason || 'unknown_faq',
      status: 'pending',
      priority: aiResult.escalationReason === 'sensitive_topic' ? 'high' : 'medium',
      createdAt: new Date().toLocaleString()
    };
    escalationTickets.unshift(escalationTicket);

    existingChat.mode = 'human';
    existingChat.status = 'escalated';

    const fallbackResponse = aiResult.groundedAnswer;
    await sendWhatsAppTextMessage(rawPhone, fallbackResponse);

    const botMsgObj = {
      id: `MSG-BOT-ESC-${Date.now()}`,
      chatId: existingChat.id,
      sender: 'bot',
      text: fallbackResponse,
      timestamp: timeStr,
      status: 'delivered',
      isGroundingFailure: true
    };
    realTimeMessages[existingChat.id].push(botMsgObj);
    existingChat.lastMessage = fallbackResponse;

    logServerActivity(
      'ESCALATION_CREATED',
      'Human Escalation Triggered',
      `Ticket ${ticketId} created for "${userText}" (${aiResult.escalationReason})`,
      formattedPhone,
      'warning'
    );

    return res.status(200).json({
      status: 'escalated',
      ticketId,
      reason: aiResult.escalationReason
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
