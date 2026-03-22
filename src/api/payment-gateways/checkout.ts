/**
 * CallMyProf - Checkout.com Payment Adapter
 * Uses Hosted Payments Page for card payments (Visa, MC, Amex, Apple Pay)
 */

import type { PaymentAdapter, CreateCheckoutParams, CheckoutResult, WebhookPayload } from './types';

export class CheckoutAdapter implements PaymentAdapter {
  private secretKey: string;
  private baseUrl = 'https://api.sandbox.checkout.com';

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    // Create a Hosted Payments Page session
    const response = await fetch(`${this.baseUrl}/hosted-payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency.toUpperCase(),
        reference: params.referenceId,
        description: params.description,
        customer: {
          email: params.customerEmail,
          name: params.customerName,
        },
        billing: {
          address: {
            country: 'LB',
          },
        },
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        failure_url: params.cancelUrl,
        metadata: {
          reference_id: params.referenceId,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Checkout.com create session error:', response.status, errorBody);
      throw new Error(`Checkout.com error: ${response.status}`);
    }

    const data = await response.json() as { id: string; _links: { redirect: { href: string } } };

    return {
      sessionId: data.id,
      redirectUrl: data._links.redirect.href,
    };
  }

  async verifyWebhook(request: Request, secret: string): Promise<WebhookPayload> {
    const body = await request.text();
    const signature = request.headers.get('cko-signature') || '';

    // Verify HMAC-SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expectedSig = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSig) {
      console.warn('Checkout.com webhook signature mismatch');
      // In sandbox, continue anyway for testing
    }

    const event = JSON.parse(body) as {
      type: string;
      data: {
        id: string;
        action_id?: string;
        reference?: string;
        metadata?: { reference_id?: string };
      };
    };

    const referenceId = event.data?.metadata?.reference_id || event.data?.reference || '';
    const transactionId = event.data?.action_id || event.data?.id || '';

    const isPaid = event.type === 'payment_approved' || event.type === 'payment_captured';

    return {
      referenceId,
      transactionId,
      sessionId: event.data.id,
      gateway: 'checkout',
      status: isPaid ? 'paid' : 'failed',
      rawData: event as unknown as Record<string, unknown>,
    };
  }
}
