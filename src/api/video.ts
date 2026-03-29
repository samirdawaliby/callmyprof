/**
 * CallMyProf - Unified Video Service
 *
 * Strategy:
 *   1. Try Daily.co first (privacy, control, branding)
 *   2. Fallback to Jitsi Meet if:
 *      - DAILY_API_KEY not configured
 *      - Daily.co API fails
 *      - Monthly free tier limit reached (2000 min)
 *
 * Anti-poaching measures:
 *   - Daily.co: private rooms, meeting tokens, auto-expiry
 *   - Jitsi: random room names, no persistent links
 *   - Both: tutor never sees student email/phone
 */

import type { Env, VideoRoom, VideoProvider } from '../../shared/types';
import { createDailyRoom, createDailyToken } from './daily';
import { generateId } from '../../shared/utils';

const DAILY_FREE_TIER_LIMIT = 1800; // Conservative: 1800 of 2000 min
const JITSI_BASE_URL = 'https://meet.jit.si';

/**
 * Create a video room for a booking/session
 * Automatically picks Daily.co or Jitsi based on availability
 */
export async function createVideoRoom(
  env: Env,
  options: {
    bookingId: string;
    scheduledDate: string;     // YYYY-MM-DD
    scheduledTime: string;     // HH:MM
    studentName: string;       // First name only (privacy)
    tutorName?: string;        // First name only
    durationMinutes?: number;  // default 60
    maxParticipants?: number;  // default 2
    forceProvider?: VideoProvider; // Override auto-detection
  }
): Promise<VideoRoom> {
  const provider = options.forceProvider || await detectBestProvider(env);

  if (provider === 'daily') {
    return createDailyVideoRoom(env, options);
  }

  return createJitsiVideoRoom(options);
}

/**
 * Detect the best provider based on config and usage
 */
async function detectBestProvider(env: Env): Promise<VideoProvider> {
  // No API key = Jitsi
  if (!env.DAILY_API_KEY) {
    console.log('Video: No DAILY_API_KEY, using Jitsi fallback');
    return 'jitsi';
  }

  // Check usage (cached in a simple way - could be improved with KV)
  // For now, just try Daily.co and fallback on error
  return 'daily';
}

/**
 * Create a Daily.co video room with meeting tokens
 */
async function createDailyVideoRoom(
  env: Env,
  options: {
    bookingId: string;
    scheduledDate: string;
    scheduledTime: string;
    studentName: string;
    tutorName?: string;
    durationMinutes?: number;
    maxParticipants?: number;
  }
): Promise<VideoRoom> {
  const result = await createDailyRoom(env, {
    sessionId: options.bookingId,
    scheduledDate: options.scheduledDate,
    scheduledTime: options.scheduledTime,
    durationMinutes: options.durationMinutes || 60,
    maxParticipants: options.maxParticipants || 2,
  });

  if (!result.success || !result.room) {
    // Fallback to Jitsi on Daily.co failure
    console.warn('Daily.co failed, falling back to Jitsi:', result.error);
    return createJitsiVideoRoom(options);
  }

  // Create student token (non-owner, limited permissions)
  const studentToken = await createDailyToken(env, {
    roomName: result.room.name,
    userName: options.studentName,
    isOwner: false,
  });

  // Create host/admin token (owner, can record, mute, etc.)
  const hostToken = await createDailyToken(env, {
    roomName: result.room.name,
    userName: options.tutorName || 'CallMyProf',
    isOwner: true,
  });

  // Build URLs with embedded tokens
  const studentUrl = studentToken.success && studentToken.token
    ? `${result.room.url}?t=${studentToken.token}`
    : result.room.url;

  const hostUrl = hostToken.success && hostToken.token
    ? `${result.room.url}?t=${hostToken.token}`
    : result.room.url;

  return {
    provider: 'daily',
    room_name: result.room.name,
    room_url: studentUrl,      // Link sent to student
    host_url: hostUrl,         // Link for tutor/admin
    daily_room_id: result.room.id,
    expires_at: undefined,     // Daily.co manages expiry via room config
  };
}

/**
 * Create a Jitsi Meet room (free, no API key needed)
 * Uses random room names to prevent persistent links
 */
function createJitsiVideoRoom(
  options: {
    bookingId: string;
    scheduledDate: string;
    scheduledTime: string;
    studentName: string;
  }
): VideoRoom {
  // Generate a unique, unguessable room name
  const randomSuffix = generateId().slice(0, 12);
  const dateClean = options.scheduledDate.replace(/-/g, '');
  const roomName = `CallMyProf-${dateClean}-${randomSuffix}`;

  // Jitsi URL with config params for branding and privacy
  const configParams = [
    'config.prejoinPageEnabled=true',
    'config.disableDeepLinking=true',
    'config.hideConferenceSubject=true',
    `userInfo.displayName=${encodeURIComponent(options.studentName)}`,
    'config.toolbarButtons=["microphone","camera","chat","desktop","hangup","settings"]',
  ].join('&');

  const roomUrl = `${JITSI_BASE_URL}/${roomName}#${configParams}`;

  // Host URL with moderator config
  const hostParams = [
    'config.prejoinPageEnabled=true',
    'config.disableDeepLinking=true',
    'userInfo.displayName=CallMyProf',
    'config.startWithVideoMuted=false',
  ].join('&');

  const hostUrl = `${JITSI_BASE_URL}/${roomName}#${hostParams}`;

  return {
    provider: 'jitsi',
    room_name: roomName,
    room_url: roomUrl,
    host_url: hostUrl,
  };
}

/**
 * Get provider display info for admin UI
 */
export function getProviderInfo(provider: VideoProvider): { name: string; icon: string; color: string } {
  if (provider === 'daily') {
    return { name: 'Daily.co', icon: '🎥', color: '#4A90D9' };
  }
  return { name: 'Jitsi Meet', icon: '📹', color: '#location' };
}
