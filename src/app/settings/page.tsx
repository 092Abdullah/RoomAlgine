
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsForm } from '@/components/settings-form';
import { Header } from '@/components/header';
import { cookies } from 'next/headers';

export default async function SettingsPage() {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    return (
        <div className="bg-background min-h-screen">
            <Header user={user} />
            <main className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
                 <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-muted-foreground">
                            Manage your account settings and preferences.
                        </p>
                    </div>
                    <div className="py-6">
                       <SettingsForm user={user} />
                    </div>
                 </div>
            </main>
        </div>
    );
}
