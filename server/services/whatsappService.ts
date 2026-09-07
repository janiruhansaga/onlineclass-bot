import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const GRAPH_API_VERSION = 'v20.0';

/**
 * Format phone number to international format without + or spaces
 * Example: "+94 77 123 4567" -> "94771234567"
 */
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

/**
 * Get Meta Cloud API Credentials from server environment
 */
function getMetaCredentials() {
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || '1314283051764757';
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;

  if (!accessToken) {
    console.warn('[WhatsApp Service] Warning: META_WHATSAPP_ACCESS_TOKEN is missing in environment variables.');
  }

  return {
    phoneNumberId,
    accessToken,
    endpoint: `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`
  };
}

/**
 * Send Text Message via Meta WhatsApp Cloud API
 */
export async function sendWhatsAppTextMessage(
  recipientPhone: string,
  messageText: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const { accessToken, endpoint } = getMetaCredentials();
  const cleanPhone = formatPhoneNumber(recipientPhone);

  if (!accessToken) {
    console.log(`[WhatsApp API Mock Log] To: ${cleanPhone} | Message: "${messageText}"`);
    return {
      success: true,
      data: { mock: true, recipient: cleanPhone, message: messageText }
    };
  }

  try {
    const response = await fetch(endpoint, {
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
        text: {
          preview_url: false,
          body: messageText
        }
      })
    });

    const resData = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp Cloud API Error]', resData);
      return {
        success: false,
        error: resData.error?.message || 'Failed to send WhatsApp message'
      };
    }

    console.log(`[WhatsApp API Success] Message sent to ${cleanPhone} (ID: ${resData.messages?.[0]?.id})`);
    return { success: true, data: resData };
  } catch (err: any) {
    console.error('[WhatsApp Network Exception]', err);
    return { success: false, error: err.message || 'Network request failed' };
  }
}

/**
 * Send Approved Template Message via Meta WhatsApp Cloud API
 */
export async function sendWhatsAppTemplateMessage(
  recipientPhone: string,
  templateName: string = 'hello_world',
  languageCode: string = 'en_US',
  components: any[] = []
): Promise<{ success: boolean; data?: any; error?: string }> {
  const { accessToken, endpoint } = getMetaCredentials();
  const cleanPhone = formatPhoneNumber(recipientPhone);

  if (!accessToken) {
    return { success: true, data: { mock: true, template: templateName } };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components
        }
      })
    });

    const resData = await response.json();
    return response.ok ? { success: true, data: resData } : { success: false, error: resData.error?.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Send Interactive Quick Reply Buttons
 */
export async function sendWhatsAppInteractiveMessage(
  recipientPhone: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
): Promise<{ success: boolean; data?: any; error?: string }> {
  const { accessToken, endpoint } = getMetaCredentials();
  const cleanPhone = formatPhoneNumber(recipientPhone);

  if (!accessToken) return { success: true, data: { mock: true } };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: {
            buttons: buttons.map((b) => ({
              type: 'reply',
              reply: { id: b.id, title: b.title.slice(0, 20) }
            }))
          }
        }
      })
    });

    const resData = await response.json();
    return response.ok ? { success: true, data: resData } : { success: false, error: resData.error?.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
