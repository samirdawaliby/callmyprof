/**
 * CallMyProf - Payment Gateway Factory
 */

import type { PaymentAdapter } from './types';
import { CheckoutAdapter } from './checkout';
import { PayPalAdapter } from './paypal';

export type { PaymentAdapter, CreateCheckoutParams, CheckoutResult, WebhookPayload } from './types';

export type PaymentGateway = 'checkout' | 'paypal';

interface GatewayEnv {
  CHECKOUT_SECRET_KEY?: string;
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_SECRET?: string;
  PAYPAL_SANDBOX?: string;
}

export function getPaymentAdapter(gateway: PaymentGateway, env: GatewayEnv): PaymentAdapter {
  switch (gateway) {
    case 'checkout': {
      if (!env.CHECKOUT_SECRET_KEY) throw new Error('CHECKOUT_SECRET_KEY not configured');
      return new CheckoutAdapter(env.CHECKOUT_SECRET_KEY);
    }
    case 'paypal': {
      if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_SECRET) throw new Error('PayPal credentials not configured');
      const sandbox = env.PAYPAL_SANDBOX !== 'false';
      return new PayPalAdapter(env.PAYPAL_CLIENT_ID, env.PAYPAL_SECRET, sandbox);
    }
    default:
      throw new Error(`Unknown payment gateway: ${gateway}`);
  }
}
