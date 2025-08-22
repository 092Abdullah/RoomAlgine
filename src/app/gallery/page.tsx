
"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeaderLogoIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { GalleryClient } from '@/components/gallery-client';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { DesignTypeSelectionDialog } from '@/components/design-type-selection-dialog';

// We fetch creations on the client side now to accommodate the state for the dialog.
// Revalidation can be handled with client-side caching strategies if needed.

export type Creation = {
  id: string;
  created_at: string;
  original_image_url: string;
  generated_image_url: string;
  style: string;
  room_type: string | null;
  kudos: number;
};

async function getCreations(): Promise<Creation[]> {
  const { data, error } = await supabase
    .from('creations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching creations:', error);
    throw new Error(
      `Failed to fetch creations from the database. Error: ${error.message}`
    );
  }
  return data || [];
}

type GalleryPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function GalleryPage({ searchParams }: GalleryPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    getCreations()
      .then(setCreations)
      .catch(console.error)
      .finally(() => setLoading(false));
  });

  const filter =
    searchParams?.filter === 'interior' || searchParams?.filter === 'exterior'
      ? (searchParams.filter as string)
      : 'all';

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
          {loading ? (
             <div className="text-center py-20">
                <h2 className="text-2xl font-semibold text-foreground">Loading Creations...</h2>
             </div>
          ) : (
            <GalleryClient allCreations={creations} initialFilter={filter} />
          )}
        </main>
      </div>
    </>
  );
}
