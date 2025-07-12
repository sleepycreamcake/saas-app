// This file initializes the Supabase client for use in Next.js components
'use client'

import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);