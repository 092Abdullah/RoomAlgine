
import { createSupabaseServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { AuthButton } from '@/components/auth-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeaderLogoIcon } from '@/components/icons';
import Link from 'next/link';

export default async function LoginPage() {
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        redirect('/dashboard');
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/30">
            <Card className="w-full max-w-sm shadow-xl">
                 <CardHeader className="text-center space-y-4">
                    <Link href="/" className="inline-block mx-auto">
                        <HeaderLogoIcon />
                    </Link>
                    <div>
                        <CardTitle>Welcome to RoomAIgine</CardTitle>
                        <CardDescription>Sign in to unlock your creative potential</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                    <AuthButton session={session} />
                </CardContent>
            </Card>
        </div>
    );
}
