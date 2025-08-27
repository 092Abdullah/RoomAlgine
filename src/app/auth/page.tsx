
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <Card className="w-full max-w-sm">
                 <CardHeader className="text-center">
                    <Link href="/" className="inline-block mx-auto mb-4">
                        <HeaderLogoIcon />
                    </Link>
                    <CardTitle>Welcome to RoomAIgine</CardTitle>
                    <CardDescription>Sign in to continue to your dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <AuthButton session={session} />
                </CardContent>
            </Card>
        </div>
    );
}
