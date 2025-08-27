import LandingPage from "@/components/landing-page";
import { createSupabaseServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  return <LandingPage user={user} />;
}
