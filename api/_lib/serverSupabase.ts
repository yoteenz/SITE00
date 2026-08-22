/**
 * Server-side Supabase client options — avoids WebSocket requirement on Node < 22 (Railway default).
 */
import { createClient, type SupabaseClient, type SupabaseClientOptions } from '@supabase/supabase-js';
import WebSocket from 'ws';

let serverOptions: SupabaseClientOptions | null = null;

export function getServerSupabaseOptions(): SupabaseClientOptions {
  if (!serverOptions) {
    serverOptions = {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        WebSocket: WebSocket as unknown as typeof globalThis.WebSocket,
      },
    };
  }
  return serverOptions;
}

export function createServerSupabaseClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, getServerSupabaseOptions());
}

export function createServerSupabaseUserClient(url: string, key: string, accessToken: string): SupabaseClient {
  return createClient(url, key, {
    ...getServerSupabaseOptions(),
    global: {
      ...getServerSupabaseOptions().global,
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
}
