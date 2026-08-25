import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_SUPABASE_URL_KEY = 'minimal_pm_supabase_url';
const STORAGE_SUPABASE_KEY_KEY = 'minimal_pm_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(STORAGE_SUPABASE_URL_KEY) || envUrl;
  const storedKey = localStorage.getItem(STORAGE_SUPABASE_KEY_KEY) || envKey;

  return {
    url: storedUrl.trim(),
    anonKey: storedKey.trim(),
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  if (config.url) {
    localStorage.setItem(STORAGE_SUPABASE_URL_KEY, config.url.trim());
  } else {
    localStorage.removeItem(STORAGE_SUPABASE_URL_KEY);
  }

  if (config.anonKey) {
    localStorage.setItem(STORAGE_SUPABASE_KEY_KEY, config.anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_SUPABASE_KEY_KEY);
  }
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_SUPABASE_URL_KEY);
  localStorage.removeItem(STORAGE_SUPABASE_KEY_KEY);
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();

  if (!url || !anonKey) {
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey);
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'Supabase URL and Anon Key are required.' };
  }

  try {
    const testClient = createClient(url.trim(), anonKey.trim());
    // Try to query the projects table or check auth
    const { error } = await testClient.from('projects').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "projects" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! (Note: "projects" table not found yet. Please run the SQL schema script).',
        };
      }
      return { success: false, message: `Connection error: ${error.message}` };
    }

    return { success: true, message: 'Successfully connected to Supabase Database!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to Supabase.' };
  }
}
