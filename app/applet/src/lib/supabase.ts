import { createClient } from '@supabase/supabase-js';

function cleanSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return 'https://tmthwoalxnvibqshdots.supabase.co';
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

const rawUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (import.meta as any).env?.SUPABASE_URL ||
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL : undefined) ||
  'https://tmthwoalxnvibqshdots.supabase.co';

const SUPABASE_URL = cleanSupabaseUrl(rawUrl);

const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any).env?.SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY : undefined) ||
  'sb_publishable_tAwYtrpIHyTwLBJJBB9CdA_ZWu8En3S';

// Reusable official Supabase client for the entire frontend
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export { SUPABASE_URL, SUPABASE_ANON_KEY };

// User Profile interface corresponding to Supabase 'profiles' table
export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'owner';
  created_at?: string;
}

// Get current Supabase Auth user
export async function getAuthUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.warn('Error fetching auth user:', err);
    return null;
  }
}

// Get user profile from 'profiles' table
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return data as UserProfile;
  } catch (err) {
    console.warn('Error fetching profile:', err);
    return null;
  }
}

// Check if current user is owner
export async function checkIsOwner(): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;
  const profile = await getUserProfile(user.id);
  return profile?.role === 'owner';
}
