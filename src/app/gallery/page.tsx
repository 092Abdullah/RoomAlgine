import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { LogoIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { GalleryItem } from '@/components/gallery-item';

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

async function getCreations() {
  const { data, error } = await supabase
    .from('creations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching creations:', error);
    return [];
  }
  return data;
}

export default async function GalleryPage() {
  const creations: Creation[] = await getCreations();

  return (
    <div className="bg-background min-h-screen">
       <header className="sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/">
              <LogoIcon />
            </Link>
            <nav className="hidden md:flex md:gap-8 items-center">
              <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="/#see-the-magic" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Examples</Link>
              <Link href="/#loved-by-creatives" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Reviews</Link>
              <Link href="/gallery" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Gallery</Link>
              <Button asChild>
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
      
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8 md:py-12">
            <h1 className="text-4xl font-bold text-foreground">Inspirational Gallery</h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                Explore real user uploads and see how our community has reimagined their spaces with AI.
            </p>
        </div>

        {creations.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-foreground">The Gallery is Empty</h2>
            <p className="mt-2 text-muted-foreground">Be the first to publish a creation!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creations.map((creation) => (
              <GalleryItem key={creation.id} creation={creation} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
