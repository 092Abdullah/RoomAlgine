
import { createSupabaseServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { GalleryItem } from '@/components/gallery-item';
import type { Creation } from '@/app/gallery/page';
import { UserNav } from '@/components/user-nav';
import { HeaderLogoIcon } from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GalleryThumbnails, LayoutDashboard, Sparkles } from 'lucide-react';
import { DesignTypeSelectionDialog } from '@/components/design-type-selection-dialog';
import { ThemeSwitcher } from '@/components/theme-switcher';

async function getCreationsForUser(userId: string): Promise<Creation[]> {
    const supabase = createSupabaseServerClient();
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
    const supabase = createSupabaseServerClient();
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
                    <nav className="hidden md:flex md:gap-2 items-center">
                        <Link href="/dashboard" className="header-link text-foreground"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
                        <Link href="/gallery" className="header-link"><GalleryThumbnails className="mr-2 h-4 w-4" />Gallery</Link>
                        <ThemeSwitcher />
                        <UserNav user={user} />
                        {/* The DesignTypeSelectionDialog logic is handled on the client-side inside the component it's called from, so we just need a trigger. Let's use a standard button that would open a client-side dialog */}
                        <Button asChild><Link href="/generate"><Sparkles className="mr-2 h-4 w-4" /> Start Designing</Link></Button>
                    </nav>
                    <div className="md:hidden flex items-center gap-2">
                        <ThemeSwitcher />
                        <UserNav user={user} />
                        <Button size="icon" asChild><Link href="/generate"><Sparkles className="h-4 w-4" /></Link></Button>
                    </div>
                </div>
                </div>
            </header>

            <main className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
                <div className="pb-8 md:pb-12">
                    <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
                    <p className="mt-2 max-w-2xl text-muted-foreground">
                        Welcome back, {user.user_metadata.name || user.email}! Here are your creations.
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
