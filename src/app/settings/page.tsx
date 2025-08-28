
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HeaderLogoIcon } from '@/components/icons';
import Link from 'next/link';
import { UserNav } from '@/components/user-nav';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SettingsForm } from '@/components/settings-form';
import {
    LayoutGrid,
    Home,
    Building,
    GalleryThumbnails,
    Settings,
} from 'lucide-react';

export default async function SettingsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <HeaderLogoIcon />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto sidebar-scroll">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <LayoutGrid className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link
                                href="/generate"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Home className="h-4 w-4" />
                                New Interior Design
                            </Link>
                            <Link
                                href="/exterior"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Building className="h-4 w-4" />
                                New Exterior Design
                            </Link>
                            <Link
                                href="/gallery"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <GalleryThumbnails className="h-4 w-4" />
                                Gallery
                            </Link>
                             <Link
                                href="/settings"
                                className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2 text-primary transition-all hover:text-primary"
                            >
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-auto p-4 border-t">
                       <UserNav user={user} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col">
                 <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <div className="md:hidden">
                        <Link href="/dashboard">
                            <HeaderLogoIcon />
                        </Link>
                    </div>
                    <div className="w-full flex-1">
                         {/* Can be used for a search bar later */}
                    </div>
                    <ThemeSwitcher />
                </header>
                <main className="flex-1 p-4 sm:px-6 sm:py-6 bg-muted/40 overflow-y-auto">
                     <div>
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-muted-foreground">
                            Manage your account settings and preferences.
                        </p>
                    </div>
                    <div className="py-6">
                       <SettingsForm user={user} />
                    </div>
                </main>
            </div>
        </div>
    );
}
