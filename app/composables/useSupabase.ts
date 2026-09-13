import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

/**
 * Returns a singleton Supabase client using runtime config.
 * Use this instead of calling createClient() directly in pages/components.
 */
export function useSupabase(): SupabaseClient {
  if (_client) return _client

  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  const key = config.public.supabaseKey as string

  if (!url || !key) {
    throw new Error(
      'Supabase URL or Key is missing. Check SUPABASE_URL and SUPABASE_KEY in your .env file.',
    )
  }

  _client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return _client
}
