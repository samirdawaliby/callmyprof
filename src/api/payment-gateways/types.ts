/**
 * CallMyProf - Payment Gateway Types
 * Gateway-agnostic interfaces for Checkout.com and PayPal
 */

export interface CreateCheckoutParams {
  /** Internal reference (package or payment ID) */
  referenceId: string;
  /** Amount in smallest currency unit (cents) */
  amount: number;
  /** ISO 4217 currency code: EUR, GBP, USD */
  currency: string;
  customerEmail: string;
  customerName: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  sessionId: string;
  redirectUrl: string;
}

export interface WebhookPayload {
  referenceId: string;
  transactionId: string;
  sessionId: string;
  gateway: 'checkout' | 'paypal';
  status: 'paid' | 'failed';
  rawData: Record<string, unknown>;
}

export interface PaymentAdapter {
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
  verifyWebhook(request: Request, secret: string): Promise<WebhookPayload>;
}
