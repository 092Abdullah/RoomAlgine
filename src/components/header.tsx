
"use client";

import { useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { HeaderLogoIcon } from '@/components/icons';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { UserNav } from '@/components/user-nav';
import { DesignTypeSelectionDialog } from '@/components/design-type-selection-dialog';
import { Sparkles, Image, GalleryThumbnails } from 'lucide-react';

export function Header({ user }: { user: User | null }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <DesignTypeSelectionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} user={user} />
            <header className="fixed top-4 left-0 right-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="floating-header">
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <HeaderLogoIcon />
                        </Link>
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-2 mx-auto">
                    {user ? (
                        <>
                            <Link href="/gallery" className="header-link"><GalleryThumbnails className="mr-2 h-4 w-4" />Gallery</Link>
                            <Link href="/my-designs" className="header-link"><Image className="mr-2 h-4 w-4" />My Designs</Link>
                            <Link href="/#faq" className="header-link">FAQ</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/#features" className="header-link">Features</Link>
                            <Link href="/#see-the-magic" className="header-link">Examples</Link>
                            <Link href="/gallery" className="header-link">Gallery</Link>
                        </>
                    )}
                    </nav>

                    <div className="hidden md:flex items-center gap-2">
                    {user ? (
                        <>
                            <ThemeSwitcher />
                            <UserNav user={user} />
                            <Button onClick={() => setIsDialogOpen(true)}><Sparkles className="mr-2 h-4 w-4" /> Create Design</Button>
                        </>
                    ) : (
                        <>
                            <ThemeSwitcher />
                            <Button variant="ghost" asChild><Link href="/auth">Login</Link></Button>
                            <Button onClick={() => setIsDialogOpen(true)}>Get Started</Button>
                        </>
                    )}
                    </div>

                    <div className="md:hidden flex items-center gap-2">
                        <ThemeSwitcher />
                        {user ? <UserNav user={user} /> : <Button variant="ghost" asChild><Link href="/auth">Login</Link></Button>}
                        <Button size="icon" onClick={() => setIsDialogOpen(true)}><Sparkles className="h-4 w-4" /></Button>
                    </div>
                </div>
                </div>
            </header>
        </>
    );
}
