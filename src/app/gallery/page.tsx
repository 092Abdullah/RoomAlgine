
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeaderLogoIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { GalleryClient } from '@/components/gallery-client';
import { ThemeSwitcher } from '@/components/theme-switcher';

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

async function getCreations(): Promise<Creation[]> {
  const { data, error } = await supabase
    .from('creations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching creations:', error);
    // Throw a more descriptive error to be caught by an error boundary
    throw new Error(`Failed to fetch creations from the database. Please check your Supabase connection and configuration. Error: ${error.message}`);
  }
  return data || [];
}

type GalleryPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const creations: Creation[] = await getCreations();
  const filter = searchParams?.filter === 'interior' || searchParams?.filter === 'exterior'
    ? searchParams.filter as string
    : 'all';

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
              <Link href="#see-the-magic" className="header-link">Examples</Link>
              <Link href="#loved-by-creatives" className="header-link">Reviews</Link>
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
        <GalleryClient allCreations={creations} initialFilter={filter} />
      </main>
    </div>
  );
}
