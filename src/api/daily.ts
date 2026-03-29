/**
 * CallMyProf - Daily.co API Integration
 * Creates and manages video rooms for tutoring sessions
 *
 * Daily.co gives us:
 * - Unique room per session (no persistent link = anti-poaching)
 * - Room expiration (auto-cleanup after session)
 * - Privacy controls (no student email/phone visible to tutor)
 * - Recording capability (optional, for quality assurance)
 * - 2000 free minutes/month
 */

import type { Env } from '../../shared/types';

const DAILY_API_URL = 'https://api.daily.co/v1';

interface DailyRoomConfig {
  /** Room name (unique, lowercase, no spaces) */
  name: string;
  /** Room expiry timestamp (epoch seconds) */
  nbf?: number;
  /** Room not-after timestamp (epoch seconds) — auto-delete after this */
  exp?: number;
  /** Max participants (2 for individual, 6 for group) */
  max_participants?: number;
  /** Enable recording */
  enable_recording?: boolean;
  /** Enable chat */
  enable_chat?: boolean;
  /** Enable screenshare */
  enable_screenshare?: boolean;
  /** Privacy: require knock to enter */
  enable_knocking?: boolean;
  /** Start with video off */
  start_video_off?: boolean;
}

interface DailyRoom {
  id: string;
  name: string;
  url: string;
  created_at: string;
  config: Record<string, unknown>;
}

interface DailyMeetingToken {
  token: string;
}

/**
 * Create a Daily.co room for a tutoring session
 * Room auto-expires 2 hours after scheduled end time
 */
export async function createDailyRoom(
  env: Env,
  options: {
    sessionId: string;
    scheduledDate: string;    // YYYY-MM-DD
    scheduledTime: string;    // HH:MM
    durationMinutes?: number; // default 60
    maxParticipants?: number; // default 2 (individual)
    enableRecording?: boolean;
  }
): Promise<{ success: boolean; room?: DailyRoom; error?: string }> {
  if (!env.DAILY_API_KEY) {
    return { success: false, error: 'DAILY_API_KEY not configured' };
  }

  try {
    // Build room name: cmp-{short-session-id}-{date}
    const shortId = options.sessionId.slice(0, 8);
    const dateClean = options.scheduledDate.replace(/-/g, '');
    const roomName = `cmp-${shortId}-${dateClean}`;

    // Calculate expiry: session time + duration + 2h buffer
    const sessionStart = new Date(`${options.scheduledDate}T${options.scheduledTime}:00Z`);
    const durationMs = (options.durationMinutes || 60) * 60 * 1000;
    const bufferMs = 2 * 60 * 60 * 1000; // 2 hours after session
    const expiryDate = new Date(sessionStart.getTime() + durationMs + bufferMs);

    // Not-before: 15 min before session start
    const nbfDate = new Date(sessionStart.getTime() - 15 * 60 * 1000);

    const roomConfig: Record<string, unknown> = {
      name: roomName,
      privacy: 'private', // Require meeting token to join
      properties: {
        nbf: Math.floor(nbfDate.getTime() / 1000),
        exp: Math.floor(expiryDate.getTime() / 1000),
        max_participants: options.maxParticipants || 2,
        enable_chat: true,
        enable_screenshare: true,
        enable_knocking: false,
        start_video_off: false,
        enable_recording: options.enableRecording ? 'cloud' : undefined,
        // Branding
        lang: 'fr',
      },
    };

    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roomConfig),
    });

    const data = await response.json() as DailyRoom & { error?: string; info?: string };

    if (!response.ok) {
      console.error('Daily.co create room error:', data);
      return { success: false, error: (data as any).info || (data as any).error || 'Failed to create room' };
    }

    return { success: true, room: data };
  } catch (error) {
    console.error('Daily.co API error:', error);
    return { success: false, error: 'Network error creating video room' };
  }
}

/**
 * Create a meeting token for a participant
 * This controls who can join and with what permissions
 */
export async function createDailyToken(
  env: Env,
  options: {
    roomName: string;
    userName: string;
    isOwner?: boolean;         // true for admin/tutor
    expirySeconds?: number;    // token validity in seconds
  }
): Promise<{ success: boolean; token?: string; error?: string }> {
  if (!env.DAILY_API_KEY) {
    return { success: false, error: 'DAILY_API_KEY not configured' };
  }

  try {
    const tokenConfig = {
      properties: {
        room_name: options.roomName,
        user_name: options.userName,
        is_owner: options.isOwner || false,
        // Token expires in 24h by default
        exp: Math.floor(Date.now() / 1000) + (options.expirySeconds || 86400),
        // Owners can mute/remove others, start recording
        enable_recording: options.isOwner ? 'cloud' : undefined,
      },
    };

    const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenConfig),
    });

    const data = await response.json() as DailyMeetingToken & { error?: string };

    if (!response.ok) {
      console.error('Daily.co token error:', data);
      return { success: false, error: 'Failed to create meeting token' };
    }

    return { success: true, token: data.token };
  } catch (error) {
    console.error('Daily.co token API error:', error);
    return { success: false, error: 'Network error creating meeting token' };
  }
}

/**
 * Delete a Daily.co room (cleanup)
 */
export async function deleteDailyRoom(
  env: Env,
  roomName: string
): Promise<{ success: boolean; error?: string }> {
  if (!env.DAILY_API_KEY) {
    return { success: false, error: 'DAILY_API_KEY not configured' };
  }

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${env.DAILY_API_KEY}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      return { success: false, error: 'Failed to delete room' };
    }

    return { success: true };
  } catch (error) {
    console.error('Daily.co delete error:', error);
    return { success: false, error: 'Network error deleting room' };
  }
}

/**
 * Get Daily.co usage stats (to monitor free tier: 2000 min/month)
 */
export async function getDailyUsage(
  env: Env
): Promise<{ success: boolean; totalMinutes?: number; error?: string }> {
  if (!env.DAILY_API_KEY) {
    return { success: false, error: 'DAILY_API_KEY not configured' };
  }

  try {
    // Get usage for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const response = await fetch(
      `${DAILY_API_URL}/meetings?starting_after=${startOfMonth.toISOString()}&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${env.DAILY_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to fetch usage' };
    }

    const data = await response.json() as { data: Array<{ duration: number }> };
    const totalSeconds = (data.data || []).reduce((sum, m) => sum + (m.duration || 0), 0);
    const totalMinutes = Math.round(totalSeconds / 60);

    return { success: true, totalMinutes };
  } catch (error) {
    return { success: false, error: 'Network error fetching usage' };
  }
}
