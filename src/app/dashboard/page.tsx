
import { createSupabaseServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { GalleryItem } from '@/components/gallery-item';
import type { Creation } from '@/app/gallery/page';
import { UserNav } from '@/components/user-nav';
import { HeaderLogoIcon } from '@/components/icons';
import Link from 'next/link';

async function getCreationsForUser(userId: string): Promise<Creation[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('creations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user creations:', error);
        return [];
    }
    return data || [];
}


export default async function DashboardPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    const creations = await getCreationsForUser(user.id);

    return (
        <div className="bg-background min-h-screen">
            <header className="fixed top-4 left-0 right-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="floating-header">
                        <Link href="/">
                            <HeaderLogoIcon />
                        </Link>
                        <UserNav user={user} />
                    </div>
                </div>
            </header>

            <main className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
                <div className="pb-8 md:pb-12">
                    <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
                    <p className="mt-2 max-w-2xl text-muted-foreground">
                        Welcome back, {user.email}! Here are your beautiful creations.
                    </p>
                </div>

                {creations.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl">
                        <h2 className="text-2xl font-semibold text-foreground">No Creations Yet</h2>
                        <p className="mt-2 text-muted-foreground">You haven't published any designs. Start creating!</p>
                        <div className="mt-6">
                            <Link href="/generate" className="text-primary hover:underline">
                                Design an Interior
                            </Link>
                             <span className="mx-4 text-muted-foreground">or</span>
                             <Link href="/exterior" className="text-primary hover:underline">
                                Redesign an Exterior
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {creations.map((creation) => (
                            <GalleryItem key={creation.id} creation={creation} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
