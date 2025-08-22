
"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Building, Folder, Home } from 'lucide-react';

import type { Creation } from '@/app/gallery/page';
import { GalleryItem } from './gallery-item';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { HeaderLogoIcon } from './icons';
import { Button } from './ui/button';
import { ThemeSwitcher } from './theme-switcher';
import { DesignTypeSelectionDialog } from './design-type-selection-dialog';


export function GalleryClient({ allCreations, initialFilter }: { allCreations: Creation[], initialFilter: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [filter, setFilter] = useState(initialFilter);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false); // Initially no loading as data is pre-fetched

    useEffect(() => {
        const currentFilter = searchParams.get('filter');
        if (currentFilter && currentFilter !== filter) {
            setFilter(currentFilter);
        } else if (!currentFilter && filter !== 'all') {
            setFilter('all');
        }
    }, [searchParams, filter]);

    const handleFilterChange = (value: string) => {
        setFilter(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
            params.delete('filter');
        } else {
            params.set('filter', value);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const filteredCreations = allCreations.filter(creation => {
        if (filter === 'interior') return !!creation.room_type;
        if (filter === 'exterior') return !creation.room_type;
        return true;
    });

    return (
        <>
        <DesignTypeSelectionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        <div className="bg-background min-h-screen">
          <header className="fixed top-4 left-0 right-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="floating-header">
                <Link href="/">
                  <HeaderLogoIcon />
                </Link>
                <nav className="hidden md:flex md:gap-2 items-center">
                  <Link href="/#features" className="header-link">Features</Link>
                  <Link href="#see-the-magic" className="header-link">Examples</Link>
                  <Link href="#loved-by-creatives" className="header-link">Reviews</Link>
                  <Link href="/gallery" className="header-link text-foreground">Gallery</Link>
                  <ThemeSwitcher />
                  <Button onClick={() => setIsDialogOpen(true)} variant="secondary" className="bg-white text-black hover:bg-gray-200">
                    Try for Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </nav>
                <div className="md:hidden">
                  <Button onClick={() => setIsDialogOpen(true)}>
                    Start Designing
                  </Button>
                </div>
              </div>
            </div>
          </header>
  
          <main className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center py-8 md:py-12">
                <h1 className="text-4xl font-bold text-foreground">Inspirational Gallery</h1>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                    See how our community has reimagined their spaces with AI.
                </p>
            </div>
            
            <div className="flex justify-center mb-8">
                <Tabs value={filter} onValueChange={handleFilterChange}>
                    <TabsList>
                        <TabsTrigger value="all">
                            <Folder className="h-4 w-4 mr-2" />
                            All
                        </TabsTrigger>
                        <TabsTrigger value="interior">
                            <Home className="h-4 w-4 mr-2" />
                            Interior
                        </TabsTrigger>
                        <TabsTrigger value="exterior">
                            <Building className="h-4 w-4 mr-2" />
                            Exterior
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold text-foreground">Loading Creations...</h2>
                </div>
            ) : filteredCreations.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold text-foreground">No Creations Found</h2>
                    <p className="mt-2 text-muted-foreground">Try a different filter or be the first to publish!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredCreations.map((creation) => (
                        <GalleryItem key={creation.id} creation={creation} />
                    ))}
                </div>
            )}
          </main>
        </div>
      </>
    )
}
