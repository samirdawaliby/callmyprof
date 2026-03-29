/**
 * CallMyProf - AI Chatbot API
 * Workers AI powered chatbot for visitor questions
 */

import { jsonResponse, errorResponse } from '../../shared/utils';
import type { Env } from '../../shared/types';

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const SYSTEM_PROMPT = `You are CallMyProf's friendly assistant. CallMyProf is an international tutoring platform that connects students with qualified tutors.

Key information:
- Pricing starts from $15/hour for individual sessions, $8/hour for group classes, $12/hour for online sessions
- Tutors are based in Lebanon and are carefully vetted with background checks
- All tutors sign non-compete agreements to ensure professional service
- We offer tutoring in Mathematics, Sciences, Languages, Business, Technology, Arts, Test Prep, and more
- Students/parents fill out a form and we call them back within 24 hours
- We offer individual (1-on-1), group (up to 6 students), and online sessions
- Payment methods: Stripe, PayPal, cash, bank transfer

How to respond:
- Be concise, friendly, and helpful
- If a question is about pricing, give the starting rates
- If a question is about subjects, list the main categories
- If a question is about how it works, explain: 1) Fill the form 2) We call you 3) We match you with a tutor 4) Start learning
- If a question is complex or about specific scheduling, suggest they fill the contact form or call
- Respond in the same language the user writes in (English, French, or Arabic)
- Keep responses under 150 words
- Don't make up information you don't have`;

// ============================================================================
// CHAT ENDPOINT
// ============================================================================

export async function handleChat(env: Env, request: Request): Promise<Response> {
  try {
    const data = await request.json() as { message: string; history?: Array<{ role: string; content: string }> };

    if (!data.message?.trim()) {
      return errorResponse('Message is required.');
    }

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history (last 6 messages max)
    if (data.history && Array.isArray(data.history)) {
      const recent = data.history.slice(-6);
      for (const msg of recent) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    // Add current message
    messages.push({ role: 'user', content: data.message.trim() });

    // Call Workers AI
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
      messages,
      max_tokens: 300,
      temperature: 0.7,
    }) as { response: string };

    return jsonResponse({
      success: true,
      reply: response.response || "I'm sorry, I couldn't process your question. Please try again or fill out our contact form for personalized help!",
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return jsonResponse({
      success: true,
      reply: "I'm having trouble right now. Please fill out the contact form above and our team will get back to you within 24 hours!",
    });
  }
}
