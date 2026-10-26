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

    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const s = data.session;
      if (s) {
        setSession({ userId: s.user.id, email: s.user.email });
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('id', s.user.id)
          .maybeSingle();
        if (mounted) setProfile(prof as Profile | null);
      }
      setLoading(false);
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      (async () => {
        if (event === 'SIGNED_OUT' || !s) {
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        setSession({ userId: s.user.id, email: s.user.email });
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('id', s.user.id)
          .maybeSingle();
        setProfile(prof as Profile | null);
        setLoading(false);
      })();
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
