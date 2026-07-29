import 'server-only';

const VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type VerifyResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Verify a Cloudflare Turnstile token server-side.
 *
 * Deliberately fails OPEN when Turnstile itself is misconfigured or
 * unreachable (missing secret, bad secret, network error). This is a memorial
 * site: losing a real submission is worse than letting spam through, and a
 * misconfigured env var should never take submissions offline. Genuine bot
 * signals -- a missing, invalid, or replayed token -- still fail closed.
 */
export async function verifyTurnstile(
  token: unknown,
  remoteIp?: string | null
): Promise<VerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.warn(
      '[turnstile] TURNSTILE_SECRET_KEY is not set - skipping verification'
    );
    return { ok: true };
  }

  if (typeof token !== 'string' || !token.trim()) {
    return { ok: false, reason: 'missing-token' };
  }

  const form = new URLSearchParams({ secret, response: token });
  if (remoteIp) form.set('remoteip', remoteIp);

  let data: { success?: boolean; 'error-codes'?: string[] };
  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body: form,
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    data = await res.json();
  } catch (e) {
    console.error('[turnstile] verification request failed - allowing', e);
    return { ok: true };
  }

  if (data.success) return { ok: true };

  const codes = data['error-codes'] ?? [];

  // Server-side misconfiguration, not a bot. Allow through, but make it loud.
  if (
    codes.includes('invalid-input-secret') ||
    codes.includes('missing-input-secret') ||
    codes.includes('bad-request')
  ) {
    console.error(
      '[turnstile] MISCONFIGURED - check TURNSTILE_SECRET_KEY. Allowing submission.',
      codes
    );
    return { ok: true };
  }

  return { ok: false, reason: codes.join(',') || 'verification-failed' };
}
