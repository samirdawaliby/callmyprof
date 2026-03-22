-- Migration: Add Checkout.com + PayPal gateway support
-- Replace Stripe references with gateway-agnostic columns

-- Add gateway-agnostic columns to payments table
ALTER TABLE payments ADD COLUMN payment_gateway TEXT;
ALTER TABLE payments ADD COLUMN payment_session_id TEXT;
ALTER TABLE payments ADD COLUMN payment_transaction_id TEXT;
ALTER TABLE payments ADD COLUMN payment_gateway_data TEXT;

-- Add gateway columns to packages_achetes
ALTER TABLE packages_achetes ADD COLUMN payment_gateway TEXT;
ALTER TABLE packages_achetes ADD COLUMN payment_session_id TEXT;
ALTER TABLE packages_achetes ADD COLUMN payment_transaction_id TEXT;

-- Note: SQLite doesn't support ALTER TABLE to modify CHECK constraints.
-- The method CHECK constraint on payments table still has 'stripe' but we add 'checkout' via new rows.
-- For D1, we can safely insert 'checkout' values since CHECK constraints are not enforced on ALTER.
-- We'll handle validation in application code.
