import { createClientComponentClient } from '@supabase/ssr'

// This is the client-side client for use in client components
export const createSupabaseClient = () => createClientComponentClient();
