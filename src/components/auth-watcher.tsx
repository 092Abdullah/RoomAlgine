
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
      // Refresh the page on sign-in or sign-out to update server components.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return null;
}
