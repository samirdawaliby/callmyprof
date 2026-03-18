/**
 * CallMyProf - Video Session Page (public)
 * Embeds Daily.co or Jitsi Meet in a branded callmyprof.com page
 * URL: /session/:bookingId?t=token (token for Daily.co private rooms)
 */

const SESSION_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0f172a;
    color: #fff;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .session-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
  }
  .session-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #fff;
    text-decoration: none;
  }
  .session-logo-icon { font-size: 22px; }
  .session-info {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 13px;
    color: #94a3b8;
  }
  .session-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .badge-live {
    background: rgba(220, 38, 38, 0.15);
    color: #ef4444;
    animation: pulse-badge 2s ease-in-out infinite;
  }
  .badge-daily { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
  .badge-jitsi { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
  @keyframes pulse-badge {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  .session-frame {
    flex: 1;
    width: 100%;
    border: none;
  }
  .session-frame iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  .session-error {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px;
  }
  .session-error-icon { font-size: 64px; margin-bottom: 16px; }
  .session-error h2 { font-size: 24px; margin-bottom: 8px; color: #f1f5f9; }
  .session-error p { font-size: 15px; color: #94a3b8; max-width: 400px; line-height: 1.6; }
  .session-error a {
    display: inline-block;
    margin-top: 24px;
    padding: 12px 28px;
    background: linear-gradient(135deg, #DC2626, #ef4444);
    color: #fff;
    text-decoration: none;
    border-radius: 10px;
    font-weight: 700;
    transition: transform 0.2s;
  }
  .session-error a:hover { transform: translateY(-2px); }
  .session-waiting {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px;
  }
  .session-waiting-icon { font-size: 72px; margin-bottom: 20px; animation: float 3s ease-in-out infinite; }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  .session-waiting h2 { font-size: 22px; margin-bottom: 8px; }
  .session-waiting p { color: #94a3b8; font-size: 15px; }
  .session-waiting .countdown { font-size: 36px; font-weight: 800; color: #DC2626; margin: 20px 0; font-variant-numeric: tabular-nums; }
`;

/**
 * Render the video session page with embedded iframe
 */
export function renderSessionPage(data: {
  bookingId: string;
  provider: 'daily' | 'jitsi';
  roomUrl: string;
  token?: string;
  studentName?: string;
  date?: string;
  time?: string;
}): string {
  const providerLabel = data.provider === 'daily' ? 'HD Video' : 'Video';
  const providerBadgeClass = data.provider === 'daily' ? 'badge-daily' : 'badge-jitsi';

  // Build the iframe URL
  let iframeUrl: string;
  if (data.provider === 'daily') {
    iframeUrl = data.token ? `${data.roomUrl}?t=${data.token}` : data.roomUrl;
  } else {
    // Jitsi Meet embed with config
    const roomName = data.roomUrl.split('/').pop() || data.bookingId;
    iframeUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=true&config.disableDeepLinking=true&config.brandingRoomAlias=CallMyProf&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_BRAND_WATERMARK=false&interfaceConfig.BRAND_WATERMARK_LINK=https://callmyprof.com&interfaceConfig.APP_NAME=CallMyProf&interfaceConfig.NATIVE_APP_NAME=CallMyProf&interfaceConfig.PROVIDER_NAME=CallMyProf&interfaceConfig.DEFAULT_LOGO_URL=`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CallMyProf - Video Session</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${SESSION_CSS}</style>
</head>
<body>
  <div class="session-header">
    <a href="https://callmyprof.com" class="session-logo" target="_blank">
      <span class="session-logo-icon">&#128222;</span>
      <span>CallMyProf</span>
    </a>
    <div class="session-info">
      ${data.studentName ? `<span>&#128100; ${data.studentName}</span>` : ''}
      ${data.date ? `<span>&#128197; ${data.date}</span>` : ''}
      ${data.time ? `<span>&#128348; ${data.time}</span>` : ''}
      <span class="session-badge badge-live">&#128308; Live</span>
      <span class="session-badge ${providerBadgeClass}">${providerLabel}</span>
    </div>
  </div>
  <div class="session-frame">
    <iframe
      src="${iframeUrl}"
      allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
      allowfullscreen
    ></iframe>
  </div>
</body>
</html>`;
}

/**
 * Session expired or not found page
 */
export function renderSessionExpired(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CallMyProf - Session Expired</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${SESSION_CSS}</style>
</head>
<body>
  <div class="session-header">
    <a href="https://callmyprof.com" class="session-logo" target="_blank">
      <span class="session-logo-icon">&#128222;</span>
      <span>CallMyProf</span>
    </a>
  </div>
  <div class="session-error">
    <div class="session-error-icon">&#9203;</div>
    <h2>Session Expired</h2>
    <p>This video session has ended or the link is no longer valid. Please contact us if you need to reschedule.</p>
    <a href="https://callmyprof.com">&#127968; Back to CallMyProf</a>
  </div>
</body>
</html>`;
}
