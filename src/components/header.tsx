
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
                    <Link href="/">
                    <HeaderLogoIcon />
                    </Link>
                    <nav className="hidden md:flex md:gap-2 items-center">
                    {user ? (
                        <>
                            <Link href="/gallery" className="header-link"><GalleryThumbnails className="mr-2 h-4 w-4" />Gallery</Link>
                            <Link href="/my-designs" className="header-link"><Image className="mr-2 h-4 w-4" />My Designs</Link>
                            <Link href="#faq" className="header-link">FAQ</Link>
                            <ThemeSwitcher />
                            <UserNav user={user} />
                            <Button onClick={() => setIsDialogOpen(true)}><Sparkles className="mr-2 h-4 w-4" /> Create Design</Button>
                        </>
                    ) : (
                        <>
                            <Link href="#features" className="header-link">Features</Link>
                            <Link href="#see-the-magic" className="header-link">Examples</Link>
                            <Link href="/gallery" className="header-link">Gallery</Link>
                            <ThemeSwitcher />
                            <Button variant="ghost" asChild><Link href="/auth">Login</Link></Button>
                            <Button onClick={() => setIsDialogOpen(true)}>Get Started</Button>
                        </>
                    )}
                    </nav>
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
