
import ExteriorAIGineClient from '@/components/exterior-ai-gine-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ExteriorPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <ExteriorAIGineClient user={user} />;
}
