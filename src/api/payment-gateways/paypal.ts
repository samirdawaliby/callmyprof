/**
 * CallMyProf - PayPal Payment Adapter
 * Uses PayPal Orders API v2 with redirect-based checkout
 */

import type { PaymentAdapter, CreateCheckoutParams, CheckoutResult, WebhookPayload } from './types';

export class PayPalAdapter implements PaymentAdapter {
  private clientId: string;
  private secret: string;
  private baseUrl: string;

  constructor(clientId: string, secret: string, sandbox = true) {
    this.clientId = clientId;
    this.secret = secret;
    this.baseUrl = sandbox
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    const credentials = btoa(`${this.clientId}:${this.secret}`);
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`PayPal auth failed: ${response.status}`);
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const accessToken = await this.getAccessToken();

    // PayPal amounts are in major units (not cents)
    const amountStr = (params.amount / 100).toFixed(2);

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: params.referenceId,
          custom_id: params.referenceId,
          description: params.description,
          amount: {
            currency_code: params.currency.toUpperCase(),
            value: amountStr,
          },
        }],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
              brand_name: 'CallMyProf',
              locale: 'fr-FR',
              landing_page: 'LOGIN',
              user_action: 'PAY_NOW',
              return_url: params.successUrl,
              cancel_url: params.cancelUrl,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('PayPal create order error:', response.status, errorBody);
      throw new Error(`PayPal error: ${response.status}`);
    }

    const data = await response.json() as {
      id: string;
      links: Array<{ rel: string; href: string }>;
    };

    const approveLink = data.links.find(l => l.rel === 'payer-action')
      || data.links.find(l => l.rel === 'approve');

    if (!approveLink) {
      throw new Error('PayPal: no approval URL in response');
    }

    return {
      sessionId: data.id,
      redirectUrl: approveLink.href,
    };
  }

  async verifyWebhook(request: Request, _secret: string): Promise<WebhookPayload> {
    const body = await request.text();
    const event = JSON.parse(body) as {
      event_type: string;
      resource: {
        id: string;
        purchase_units?: Array<{
          custom_id?: string;
          reference_id?: string;
          payments?: { captures?: Array<{ id: string }> };
        }>;
      };
    };

    const purchaseUnit = event.resource?.purchase_units?.[0];
    const referenceId = purchaseUnit?.custom_id || purchaseUnit?.reference_id || '';
    const captureId = purchaseUnit?.payments?.captures?.[0]?.id || event.resource.id;

    const isPaid =
      event.event_type === 'PAYMENT.CAPTURE.COMPLETED' ||
      event.event_type === 'CHECKOUT.ORDER.APPROVED';

    return {
      referenceId,
      transactionId: captureId,
      sessionId: event.resource.id,
      gateway: 'paypal',
      status: isPaid ? 'paid' : 'failed',
      rawData: event as unknown as Record<string, unknown>,
    };
  }
}
