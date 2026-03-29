/**
 * CallMyProf - WhatsApp Business API Integration
 * Webhook for receiving messages + auto-replies
 */

import { jsonResponse, errorResponse } from '../../shared/utils';
import type { Env } from '../../shared/types';

// ============================================================================
// WEBHOOK VERIFICATION (GET)
// ============================================================================

export function verifyWhatsAppWebhook(url: URL): Response {
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  // WhatsApp sends a verification request on webhook setup
  if (mode === 'subscribe' && token === 'callmyprof_verify') {
    return new Response(challenge || '', { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

// ============================================================================
// INCOMING MESSAGE WEBHOOK (POST)
// ============================================================================

export async function handleWhatsAppWebhook(env: Env, request: Request): Promise<Response> {
  try {
    const body = await request.json() as any;

    // Extract message from WhatsApp webhook payload
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.[0]) {
      // Not a message event (could be status update)
      return jsonResponse({ success: true });
    }

    const message = value.messages[0];
    const from = message.from; // Phone number
    const text = message.text?.body || '';
    const contactName = value.contacts?.[0]?.profile?.name || '';

    if (!text.trim()) {
      return jsonResponse({ success: true });
    }

    // Auto-reply with AI if configured
    if (env.WHATSAPP_TOKEN && env.WHATSAPP_PHONE_ID) {
      let replyText: string;

      try {
        // Use Workers AI for smart reply
        const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
          messages: [
            {
              role: 'system',
              content: `You are CallMyProf's WhatsApp assistant. Be brief (under 100 words). Help with: pricing ($15/h individual, $8/h group), subjects, how it works. If complex, tell them to visit callmyprof.com or ask for a callback. Respond in the user's language.`
            },
            { role: 'user', content: text }
          ],
          max_tokens: 200,
          temperature: 0.7,
        }) as { response: string };

        replyText = aiResponse.response || getDefaultReply(text);
      } catch {
        replyText = getDefaultReply(text);
      }

      // Send reply via WhatsApp Cloud API
      await sendWhatsAppMessage(env, from, replyText);
    }

    // Log the message in DB (optional - for CRM tracking)
    try {
      await env.DB.prepare(`
        INSERT INTO chat_conversations (id, channel, external_id, contact_name, contact_phone, last_message, last_message_at, created_at)
        VALUES (lower(hex(randomblob(16))), 'whatsapp', ?, ?, ?, ?, datetime('now'), datetime('now'))
        ON CONFLICT(channel, external_id) DO UPDATE SET
          last_message = excluded.last_message,
          last_message_at = datetime('now'),
          message_count = message_count + 1
      `).bind(from, contactName, from, text).run();
    } catch (e) {
      console.error('Error logging WhatsApp message:', e);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return jsonResponse({ success: true }); // Always return 200 to WhatsApp
  }
}

// ============================================================================
// SEND MESSAGE
// ============================================================================

async function sendWhatsAppMessage(env: Env, to: string, text: string): Promise<void> {
  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_ID) return;

  await fetch(`https://graph.facebook.com/v18.0/${env.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
}

// ============================================================================
// DEFAULT REPLIES
// ============================================================================

function getDefaultReply(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('price') || lower.includes('prix') || lower.includes('cost') || lower.includes('tarif')) {
    return "Our rates start from $15/hour for individual sessions, $8/hour for group classes, and $12/hour for online tutoring. Visit callmyprof.com for more details! \ud83d\udcda";
  }

  if (lower.includes('subject') || lower.includes('matiere') || lower.includes('cours')) {
    return "We offer tutoring in Math, Sciences, Languages, Business, Technology, Arts, Test Prep and more! Fill out our form at callmyprof.com and we'll match you with the perfect tutor. \ud83c\udf93";
  }

  return "Hi! Thanks for contacting CallMyProf \ud83d\udcde\n\nWe offer personalized tutoring from $15/hour. Fill out the form at callmyprof.com and we'll call you back within 24 hours to understand your needs and match you with the perfect tutor!\n\nOr reply with your question and I'll help. \ud83d\ude0a";
}
