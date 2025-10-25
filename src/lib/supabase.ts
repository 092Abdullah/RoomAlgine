import { createBrowserClient } from '@supabase/ssr'

// This is the client-side client for use in client components
// It is now only used for storage and database, not auth.
export const createSupabaseClient = () => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
