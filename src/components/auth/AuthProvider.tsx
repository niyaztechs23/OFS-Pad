import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type Role, type Profile } from '@/lib/supabase';

type Session = {
  userId: string;
  email: string | undefined;
} | null;

type AuthContextValue = {
  session: Session;
  profile: Profile | null;
  loading: boolean;
  role: Role | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  profile: null,
  loading: true,
  role: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const applySession = async (s: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      if (!mounted) return;
      if (!s) {
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setSession({ userId: s.user.id, email: s.user.email });
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', s.user.id)
        .maybeSingle();

      if (!mounted) return;
      if (error) {
        console.error('Unable to load the signed-in profile', error);
        setProfile(null);
      } else {
        setProfile(prof as Profile | null);
      }
      setLoading(false);
    };

    const load = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error('Unable to restore the OFS Pad session', error);
      await applySession(data.session);
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT' || !s) {
        void applySession(null);
        return;
      }

      // SIGNED_IN covers Google/password callbacks; TOKEN_REFRESHED keeps the
      // role/profile in sync after a long-lived session is renewed. Supabase's
      // browser storage and BroadcastChannel synchronize these events across tabs.
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void applySession(s);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, role: profile?.role ?? null, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
