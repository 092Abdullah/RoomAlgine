
"use client";
import { createSupabaseClient } from "@/lib/supabase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function AuthWatcher() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Note: We are not redirecting on SIGNED_IN here because the middleware already handles
      // redirecting to the correct page (or the intended 'next' page).
      // Redirecting here could cause a redirect loop or overwrite the intended destination.
      if (event === "SIGNED_OUT") {
        router.push("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return null;
}
