import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthResult {
  error: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithUsername: (leetcodeUsername: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

// There's no email/password in this app's UI anymore — the LeetCode
// username *is* the account. Supabase Auth still needs an email+password
// pair under the hood, so we deterministically derive one from the
// username. This isn't meant to be a secret; it just lets the same
// username "log back in" to the same account from any device without
// ever asking for a password.
function credentialsForUsername(leetcodeUsername: string) {
  const normalized = leetcodeUsername.trim().toLowerCase();
  // Email local-parts only reliably allow letters/digits/._-, so strip
  // anything else a LeetCode username could theoretically contain rather
  // than risk Supabase rejecting the synthesized address as invalid.
  const safeLocalPart = normalized.replace(/[^a-z0-9._-]/g, '') || 'user';
  // Supabase's email validation checks that the domain has real mail (MX)
  // records, not just that the address is formatted correctly — a made-up
  // domain like "lc-tracker-users.com" fails that check even though it
  // looks like a normal email. gmail.com definitely has valid MX records,
  // so addresses here always pass validation. No email is ever actually
  // sent to it (confirmation is disabled), it's purely a placeholder
  // Supabase Auth requires internally.
  return {
    email: `lc.tracker.${safeLocalPart}@gmail.com`,
    password: `lc-tracker-${safeLocalPart}-v1`,
  };
}

// Translates a couple of Supabase config-related errors into messages that
// make sense for a username-only flow (the raw messages talk about emails,
// which would be confusing since the user never typed one).
function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('email rate limit exceeded')) {
    return 'Sign-up is temporarily blocked because email confirmation is still turned on for this project. Ask the site owner to turn off "Confirm email" in Supabase → Authentication → Sign In / Up.';
  }
  if (lower.includes('email not confirmed')) {
    return 'This account still needs email confirmation, which shouldn\'t be required here. Ask the site owner to turn off "Confirm email" in Supabase → Authentication → Sign In / Up.';
  }
  return message;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Load whatever session already exists (e.g. from a previous visit).
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    // This listener is the single source of truth for auth state. Every
    // sign-in, sign-out, and token refresh flows through here, so the UI
    // (Navbar, protected routes, etc.) always reflects the real Supabase
    // session instead of a locally-guessed value that can drift out of
    // sync — that drift was why "logout" previously appeared to do
    // nothing until a manual page refresh.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error ? error.message : null };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }, []);

  const signInWithUsername = useCallback(async (leetcodeUsername: string): Promise<AuthResult> => {
    const { email, password } = credentialsForUsername(leetcodeUsername);

    // Try logging in first — this covers a returning user.
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInError) return { error: null };

    const isUnknownAccount = signInError.message.toLowerCase().includes('invalid login credentials');
    if (!isUnknownAccount) {
      // Some other failure (network, rate limit, etc.) — surface it.
      return { error: friendlyAuthError(signInError.message) };
    }

    // No account for this username yet — create one transparently.
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) return { error: friendlyAuthError(signUpError.message) };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // Even if the network call fails, forcibly clear local state so the
      // user isn't stuck "logged in" on a dead session.
      // eslint-disable-next-line no-console
      console.error('Sign out error:', error.message);
    }
    // Don't rely solely on the async onAuthStateChange event to clear the
    // UI — set it synchronously too so the redirect happens immediately.
    setSession(null);
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    signUp,
    signIn,
    signInWithUsername,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
