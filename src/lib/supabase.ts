import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'ofspad-auth-session',
  },
});

export type Role = 'student' | 'teacher' | 'admin';

export type Profile = {
  id: string;
  full_name: string;
  role: Role;
};
