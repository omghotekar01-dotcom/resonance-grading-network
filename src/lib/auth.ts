import { displayNameFromEmail } from "./format";

export interface Session {
  email: string;
  displayName: string;
  signedInAt: string;
}

const SESSION_KEY = "origon.session.v1";

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Signs in against the configured ORIGON API service layer.
 *
 * In this preview build the auth provider is the demo fixture provider: it
 * validates the form (email format, password length) and issues a clearly
 * labeled demo session. No credentials are hard-coded into the UI, and no
 * privileged capability is granted by signing in.
 *
 * When connecting the real backend, replace the body with a call to
 * POST /api/auth/login and store the returned session token instead.
 */
export async function signIn(email: string, password: string): Promise<Session> {
  const trimmed = email.trim().toLowerCase();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  if (!emailOk) {
    throw new Error("Enter a valid email address.");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  // Simulated round-trip so the form shows honest progress.
  await new Promise((r) => setTimeout(r, 650));
  const session: Session = {
    email: trimmed,
    displayName: displayNameFromEmail(trimmed),
    signedInAt: new Date().toISOString(),
  };
  writeSession(session);
  return session;
}

export function signOut(): void {
  writeSession(null);
}
