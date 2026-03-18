/**
 * CallMyProf - Student Portal API
 * Magic link access: no password, deterministic key from leadId + email
 */

/**
 * Generate a deterministic access key for a student portal
 * Key = first 16 chars of hex(SHA-256(leadId + email + salt))
 */
export async function generateStudentKey(leadId: string, email: string): Promise<string> {
  const data = new TextEncoder().encode(leadId + email.toLowerCase() + 'callmyprof-student-salt-2026');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

/**
 * Build the student portal URL for a given lead
 */
export async function getStudentPortalUrl(leadId: string, email: string): Promise<string> {
  const key = await generateStudentKey(leadId, email);
  return `https://callmyprof.com/student/${leadId}?key=${key}`;
}
