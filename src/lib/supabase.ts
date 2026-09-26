function cleanSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return 'https://tmthwoalxnvibqshdots.supabase.co';
  let u = rawUrl.trim();
  if (u.endsWith('/rest/v1/')) u = u.slice(0, -9);
  else if (u.endsWith('/rest/v1')) u = u.slice(0, -8);
  if (u.endsWith('/')) u = u.slice(0, -1);
  return u;
}

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://tmthwoalxnvibqshdots.supabase.co';

const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
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
      .single();
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
