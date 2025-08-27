
import ExteriorAIGineClient from '@/components/exterior-ai-gine-client';
import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export default async function ExteriorPage() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  return <ExteriorAIGineClient user={user} />;
}
