
import LandingPage from "@/components/landing-page";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return <LandingPage user={user} />;
}
