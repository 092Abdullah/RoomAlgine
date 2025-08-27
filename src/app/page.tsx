
import LandingPage from "@/components/landing-page";
import { createSupabaseServerClient } from "@/lib/supabase";

export default async function Home() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <LandingPage user={user} />;
}
