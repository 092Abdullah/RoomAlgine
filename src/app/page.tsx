
import LandingPage from "@/components/landing-page";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // The landing page is now the default for everyone.
  // The header component will show different links based on the user's auth state.
  return <LandingPage user={user} />;
}
