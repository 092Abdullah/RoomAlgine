
import ExteriorAIGineClient from '@/components/exterior-ai-gine-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function ExteriorPage() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  return <ExteriorAIGineClient user={user} />;
}
