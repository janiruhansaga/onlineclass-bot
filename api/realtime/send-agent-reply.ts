const DEFAULT_ACCESS_TOKEN = 'EAAV6PB2bsYYBSRE8FRINCvnQOgCNiT3zU5gfLdpZAdwsPtr6jvMWGGLmY8gD59ntJRtHSOLdH2VHmv33xnU6hGp2mh44nrZCmG7skA0bVrdi3ivkwxYsAMR3en3cSTSjXevd49YKulqhpfbL2Rj3tsArPKedZCXVMyoVQz0Fy2yduyzSrmGpj7WrtXnrUed29lc0BoP7kkSGyIHIcHsRql5vMHQLvs0E5SnKis7TiC8CYHO4GgOHXhdRy9KgHLCxuFOnctyaaomcP0Hn1D6ETjVPvVzNIZBtmKIZD';
const DEFAULT_PHONE_NUMBER_ID = '1314283051764757';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { phoneNumber, text } = body;

      if (!phoneNumber || !text) {
        return res.status(400).json({ error: 'phoneNumber and text are required' });
      }

      const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
      const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || DEFAULT_PHONE_NUMBER_ID;
      const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN || DEFAULT_ACCESS_TOKEN;

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
          text: { body: text }
        })
      });

      const metaJson = await metaRes.json();
      return res.status(200).json({ success: metaRes.ok, data: metaJson });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).send('Method Not Allowed');
}
