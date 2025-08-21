
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeaderLogoIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { GalleryItem } from '@/components/gallery-item';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { GalleryClient } from '@/components/gallery-client';

export const revalidate = 60; 

export type Creation = {
  id: string;
  created_at: string;
  original_image_url: string;
  generated_image_url: string;
  style: string;
  room_type: string | null;
  kudos: number;
};

async function getCreations(filter?: 'interior' | 'exterior') {
  let query = supabase
    .from('creations')
    .select('*')
    .order('created_at', { ascending: false });

  if (filter === 'interior') {
    query = query.not('room_type', 'is', null);
  } else if (filter === 'exterior') {
    query = query.is('room_type', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching creations:', error);
    return [];
  }
  return data;
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const filter = searchParams?.filter === 'interior' || searchParams?.filter === 'exterior'
    ? searchParams.filter
    : undefined;
  
  const creations: Creation[] = await getCreations(filter);

  return (
    <div className="bg-background min-h-screen">
       <header className="fixed top-4 left-0 right-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="floating-header">
            <Link href="/">
              <HeaderLogoIcon />
            </Link>
            <nav className="hidden md:flex md:gap-2 items-center">
              <Link href="/#features" className="header-link">Features</Link>
              <Link href="/#see-the-magic" className="header-link">Examples</Link>
              <Link href="/#loved-by-creatives" className="header-link">Reviews</Link>
              <Link href="/gallery" className="header-link text-foreground">Gallery</Link>
              <ThemeSwitcher />
              <Button asChild variant="secondary" className="bg-white text-black hover:bg-gray-200">
                  <Link href="/generate">
                    Try for Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
              </Button>
            </nav>
             <div className="md:hidden">
               <Button asChild>
                  <Link href="/generate">
                    Start Designing
                  </Link>
                </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <GalleryClient creations={creations} />
      </main>
    </div>
  );
}
