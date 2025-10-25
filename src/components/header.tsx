
"use client";

import { useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { HeaderLogoIcon } from '@/components/icons';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { DesignTypeSelectionDialog } from '@/components/design-type-selection-dialog';
import { Sparkles, GalleryThumbnails } from 'lucide-react';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { cn } from '@/lib/utils';

export function Header({ user, isSliding = false }: { user: User | null, isSliding?: boolean }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const scrollDirection = useScrollDirection();

    const headerClasses = cn(
        "fixed top-4 left-0 right-0 z-50 transition-transform duration-300",
        isSliding && scrollDirection === 'down' ? "-translate-y-24" : "translate-y-0"
    );

    return (
        <>
            <DesignTypeSelectionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
            <header className={headerClasses}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="floating-header">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0">
                            <HeaderLogoIcon />
                        </Link>
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-2 mx-auto">
                        <Link href="/#features" className="header-link">Features</Link>
                        <Link href="/#see-the-magic" className="header-link">Examples</Link>
                        <Link href="/gallery" className="header-link"><GalleryThumbnails className="mr-2 h-4 w-4" />Gallery</Link>
                        <Link href="/#faq" className="header-link">FAQ</Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        <ThemeSwitcher />
                        <Button onClick={() => setIsDialogOpen(true)} className="btn-glare">
                            <Sparkles className="mr-2 h-4 w-4" /> Start Designing
                        </Button>
                    </div>
                </div>
                </div>
            </header>
        </>
    );
}
