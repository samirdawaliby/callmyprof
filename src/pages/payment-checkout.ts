/**
 * CallMyProf - Payment Page (SSR)
 * Checkout.com Frames (inline card form) + PayPal tab
 */

export function renderPaymentSelection(opts: {
  referenceId: string;
  referenceType: 'package' | 'payment';
  amount: number;
  currency: string;
  description: string;
  publicKey: string;
  locale?: string;
}): string {
  const { referenceId, referenceType, amount, currency, description, publicKey, locale } = opts;
  const amountDisplay = (amount / 100).toFixed(2);
  const currencySymbol = currency === 'EUR' ? '\u20AC' : currency === 'GBP' ? '\u00A3' : '$';

  const t = locale === 'fr' ? {
    title: 'Paiement',
    card: 'Carte bancaire',
    paypal: 'PayPal',
    cardNumber: 'Num\u00e9ro de carte',
    expiry: 'Date d\'expiration',
    cvv: 'CVV',
    payBtn: 'Payer',
    paypalBtn: 'Payer avec PayPal',
    processing: 'Traitement en cours...',
    secure: 'Paiement s\u00e9curis\u00e9 et chiffr\u00e9',
    error: 'Une erreur est survenue. Veuillez r\u00e9essayer.',
    cardIcons: 'Visa, Mastercard, Amex, Apple Pay',
  } : {
    title: 'Payment',
    card: 'Card',
    paypal: 'PayPal',
    cardNumber: 'Card number',
    expiry: 'Expiry date',
    cvv: 'CVV',
    payBtn: 'Pay',
    paypalBtn: 'Pay with PayPal',
    processing: 'Processing...',
    secure: 'Secure and encrypted payment',
    error: 'An error occurred. Please try again.',
    cardIcons: 'Visa, Mastercard, Amex, Apple Pay',
  };

  return `<!DOCTYPE html>
<html lang="${locale || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title} - CallMyProf</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.checkout.com/js/framesv2.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .pay-card {
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
      max-width: 460px;
      width: 100%;
      overflow: hidden;
      animation: slideUp 0.4s ease both;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .pay-header {
      background: linear-gradient(135deg, #0d3865 0%, #1a5276 100%);
      padding: 28px 32px;
      color: #fff;
      text-align: center;
    }
    .pay-header h1 { font-size: 15px; font-weight: 600; opacity: 0.8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .pay-amount { font-size: 36px; font-weight: 800; letter-spacing: -1px; }
    .pay-desc { font-size: 14px; opacity: 0.7; margin-top: 4px; }

    /* Body */
    .pay-body { padding: 28px 32px 32px; }

    /* Divider */
    .divider {
      display: flex;
      align-items: center;
      gap: 14px;
      margin: 24px 0;
    }
    .divider-line {
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }
    .divider-text {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Card form */
    .form-group {
      margin-bottom: 18px;
    }
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 6px;
    }
    .frame-container {
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      padding: 0;
      transition: border-color 0.2s;
      background: #fafbfc;
      height: 50px;
      overflow: hidden;
    }
    .frame-container iframe {
      width: 100% !important;
      height: 50px !important;
    }
    .frame-container:focus-within,
    .frame-container.frame--focus {
      border-color: #0d3865;
      box-shadow: 0 0 0 3px rgba(13,56,101,0.1);
    }
    .frame-container.frame--invalid {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
    }
    .row {
      display: flex;
      gap: 14px;
    }
    .row .form-group { flex: 1; }
    .card-brands {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      align-items: center;
    }
    .card-brands img {
      height: 24px;
      opacity: 0.5;
      transition: opacity 0.2s;
    }
    .card-brands img.active { opacity: 1; }

    /* Pay button */
    .pay-btn {
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #0d3865, #1a5276);
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
    }
    .pay-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(13,56,101,0.3);
    }
    .pay-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .pay-btn.paypal-btn {
      background: linear-gradient(135deg, #ffc439, #f0b020);
      color: #253b80;
    }
    .pay-btn.paypal-btn:hover:not(:disabled) {
      box-shadow: 0 8px 24px rgba(255,196,57,0.4);
    }

    /* Spinner */
    .btn-spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: none;
    }
    .paypal-btn .btn-spinner {
      border-color: rgba(37,59,128,0.3);
      border-top-color: #253b80;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Error */
    .error-msg {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 16px;
      display: none;
    }

    /* Secure badge */
    .secure-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 16px;
      font-size: 12px;
      color: #94a3b8;
    }

  </style>
</head>
<body>
  <div class="pay-card">
    <div class="pay-header">
      <h1>CallMyProf</h1>
      <div class="pay-amount">${currencySymbol}${amountDisplay}</div>
      <div class="pay-desc">${description}</div>
    </div>

    <div class="pay-body">
      <div id="error" class="error-msg"></div>

      <!-- Card Form -->
      <div class="form-group">
        <label class="form-label">${t.cardNumber}</label>
        <div class="frame-container card-number-frame"></div>
        <div class="card-brands">
          <svg width="40" height="26" viewBox="0 0 40 26" id="brand-visa" style="opacity:0.4">
            <rect width="40" height="26" rx="4" fill="#1A1F71"/>
            <text x="20" y="16" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold" font-family="Inter,sans-serif">VISA</text>
          </svg>
          <svg width="40" height="26" viewBox="0 0 40 26" id="brand-mc" style="opacity:0.4">
            <rect width="40" height="26" rx="4" fill="#2B2B2B"/>
            <circle cx="16" cy="13" r="8" fill="#EB001B" opacity="0.9"/>
            <circle cx="24" cy="13" r="8" fill="#F79E1B" opacity="0.9"/>
          </svg>
          <svg width="40" height="26" viewBox="0 0 40 26" id="brand-amex" style="opacity:0.4">
            <rect width="40" height="26" rx="4" fill="#006FCF"/>
            <text x="20" y="16" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold" font-family="Inter,sans-serif">AMEX</text>
          </svg>
        </div>
      </div>

      <div class="row">
        <div class="form-group">
          <label class="form-label">${t.expiry}</label>
          <div class="frame-container expiry-date-frame"></div>
        </div>
        <div class="form-group">
          <label class="form-label">${t.cvv}</label>
          <div class="frame-container cvv-frame"></div>
        </div>
      </div>

      <button class="pay-btn" id="pay-card-btn" onclick="payCard()" disabled>
        <span id="pay-card-text">${t.payBtn} ${currencySymbol}${amountDisplay}</span>
        <div class="btn-spinner" id="card-spinner"></div>
      </button>

      <!-- Divider -->
      <div class="divider">
        <div class="divider-line"></div>
        <span class="divider-text">${locale === 'fr' ? 'ou' : 'or'}</span>
        <div class="divider-line"></div>
      </div>

      <!-- PayPal Button -->
      <button class="pay-btn paypal-btn" id="pay-paypal-btn" onclick="payPaypal()">
        <span id="pay-paypal-text">${t.paypalBtn}</span>
        <div class="btn-spinner" id="paypal-spinner"></div>
      </button>

      <div class="secure-badge">
        <span>&#128274;</span> ${t.secure}
      </div>
    </div>
  </div>

  <script>
    function showError(msg) {
      var el = document.getElementById('error');
      el.textContent = msg;
      el.style.display = 'block';
    }
    function hideError() {
      document.getElementById('error').style.display = 'none';
    }

    // Checkout.com Frames — wait for DOM
    var cardValid = false;
    var expiryValid = false;
    var cvvValid = false;

    document.addEventListener('DOMContentLoaded', function() {

    Frames.init({
      publicKey: '${publicKey}',
      style: {
        base: {
          fontSize: '15px',
          fontFamily: 'Inter, -apple-system, sans-serif',
          color: '#0f172a',
          padding: '14px',
          letterSpacing: '0.5px',
        },
        focus: {
          color: '#0f172a',
        },
        placeholder: {
          base: {
            color: '#a0aec0',
            fontStyle: 'normal',
          },
        },
        invalid: {
          color: '#ef4444',
        },
      },
      localization: {
        cardNumberPlaceholder: '1234 1234 1234 1234',
        expiryMonthPlaceholder: 'MM',
        expiryYearPlaceholder: 'YY',
        cvvPlaceholder: 'CVV',
      },
    });

    Frames.addEventHandler(Frames.Events.FRAME_VALIDATION_CHANGED, function(event) {
      var el = document.querySelector('.' + event.element + '-frame');
      if (event.isValid) {
        el.classList.remove('frame--invalid');
        el.classList.add('frame--valid');
      } else if (event.isEmpty) {
        el.classList.remove('frame--invalid');
        el.classList.remove('frame--valid');
      } else {
        el.classList.add('frame--invalid');
      }

      if (event.element === 'card-number') cardValid = event.isValid;
      if (event.element === 'expiry-date') expiryValid = event.isValid;
      if (event.element === 'cvv') cvvValid = event.isValid;

      document.getElementById('pay-card-btn').disabled = !(cardValid && expiryValid && cvvValid);
    });

    Frames.addEventHandler(Frames.Events.CARD_TOKENIZATION_FAILED, function(event) {
      showError('${t.error}');
      document.getElementById('pay-card-btn').disabled = false;
      document.getElementById('card-spinner').style.display = 'none';
      document.getElementById('pay-card-text').style.visibility = 'visible';
    });

    // Highlight matching card brand
    Frames.addEventHandler(Frames.Events.PAYMENT_METHOD_CHANGED, function(event) {
      var brands = { Visa: 'brand-visa', Mastercard: 'brand-mc', 'American Express': 'brand-amex' };
      // Reset all
      document.querySelectorAll('.card-brands svg').forEach(function(s) { s.style.opacity = '0.4'; });
      if (event.paymentMethod && brands[event.paymentMethod]) {
        document.getElementById(brands[event.paymentMethod]).style.opacity = '1';
      }
    });

    // Pay with card (tokenize then send to backend)
    window.payCard = async function() {
      hideError();
      var btn = document.getElementById('pay-card-btn');
      btn.disabled = true;
      document.getElementById('card-spinner').style.display = 'inline-block';
      document.getElementById('pay-card-text').style.visibility = 'hidden';

      try {
        var tokenResult = await Frames.submitCard();

        // Send token to backend
        var res = await fetch('/api/payment/process-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: tokenResult.token,
            reference_id: '${referenceId}',
            reference_type: '${referenceType}',
          })
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.error || '${t.error}');

        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else if (data.success) {
          window.location.href = '/payment/success?ref=${referenceId}';
        }
      } catch (err) {
        showError(err.message || '${t.error}');
        btn.disabled = false;
        document.getElementById('card-spinner').style.display = 'none';
        document.getElementById('pay-card-text').style.visibility = 'visible';
      }
    }

    // Pay with PayPal (redirect)
    window.payPaypal = async function() {
      hideError();
      var btn = document.getElementById('pay-paypal-btn');
      btn.disabled = true;
      document.getElementById('paypal-spinner').style.display = 'inline-block';
      document.getElementById('pay-paypal-text').style.visibility = 'hidden';

      try {
        var res = await fetch('/api/payment/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference_id: '${referenceId}',
            reference_type: '${referenceType}',
            gateway: 'paypal'
          })
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.error || '${t.error}');
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      } catch (err) {
        showError(err.message || '${t.error}');
        btn.disabled = false;
        document.getElementById('paypal-spinner').style.display = 'none';
        document.getElementById('pay-paypal-text').style.visibility = 'visible';
      }
    }

    }); // end DOMContentLoaded
  </script>
</body>
</html>`;
}

export function renderPaymentSuccess(locale?: string): string {
  const t = locale === 'fr' ? {
    title: 'Paiement confirm\u00e9',
    msg: 'Votre paiement a \u00e9t\u00e9 trait\u00e9 avec succ\u00e8s. Vous recevrez un email de confirmation sous peu.',
    back: 'Retour',
  } : {
    title: 'Payment confirmed',
    msg: 'Your payment has been processed successfully. You will receive a confirmation email shortly.',
    back: 'Back',
  };

  return `<!DOCTYPE html>
<html lang="${locale || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title} - CallMyProf</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f0f4f8;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      max-width: 440px;
      width: 100%;
      padding: 40px 32px;
      text-align: center;
      animation: slideUp 0.4s ease both;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .check { font-size: 64px; margin-bottom: 16px; display: block; }
    h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    p { font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
    a {
      display: inline-block;
      padding: 12px 28px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0d3865, #1a4f8a);
      color: #fff;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
    }
    a:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,56,101,0.3); }
  </style>
</head>
<body>
  <div class="card">
    <span class="check">&#9989;</span>
    <h1>${t.title}</h1>
    <p>${t.msg}</p>
    <a href="/">${t.back}</a>
  </div>
</body>
</html>`;
}

export function renderPaymentCancelled(locale?: string): string {
  const t = locale === 'fr' ? {
    title: 'Paiement annul\u00e9',
    msg: 'Votre paiement a \u00e9t\u00e9 annul\u00e9. Vous pouvez r\u00e9essayer \u00e0 tout moment.',
    retry: 'R\u00e9essayer',
    back: 'Retour',
  } : {
    title: 'Payment cancelled',
    msg: 'Your payment was cancelled. You can try again at any time.',
    retry: 'Retry',
    back: 'Back',
  };

  return `<!DOCTYPE html>
<html lang="${locale || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title} - CallMyProf</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f0f4f8;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      max-width: 440px;
      width: 100%;
      padding: 40px 32px;
      text-align: center;
      animation: slideUp 0.4s ease both;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .icon { font-size: 64px; margin-bottom: 16px; display: block; }
    h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    p { font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
    a {
      display: inline-block;
      padding: 12px 28px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0d3865, #1a4f8a);
      color: #fff;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
      margin: 0 6px;
    }
    a:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,56,101,0.3); }
    a.secondary { background: #e2e8f0; color: #475569; }
    a.secondary:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="card">
    <span class="icon">&#10060;</span>
    <h1>${t.title}</h1>
    <p>${t.msg}</p>
    <a href="javascript:history.back()">${t.retry}</a>
    <a href="/" class="secondary">${t.back}</a>
  </div>
</body>
</html>`;
}
