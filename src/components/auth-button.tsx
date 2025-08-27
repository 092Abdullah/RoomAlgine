
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function AuthButton({ session }: { session: any }) {
    const supabase = createClientComponentClient();
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    return session ? (
        <Button onClick={handleSignOut} variant="outline">Logout</Button>
    ) : (
        <div className="flex items-center gap-2">
            <Button onClick={handleGoogleSignIn}>
                Login with Google
            </Button>
        </div>
    );
}
