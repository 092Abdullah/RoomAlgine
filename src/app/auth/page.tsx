
import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthButton } from '@/components/auth-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeaderLogoIcon } from '@/components/icons';
import Link from 'next/link';

export default async function LoginPage() {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        redirect('/');
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
