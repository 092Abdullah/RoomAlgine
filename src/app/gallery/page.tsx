import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

export const revalidate = 60; // Revalidate data every 60 seconds

type Creation = {
  id: string;
  created_at: string;
  original_image_url: string;
  generated_image_url: string;
  style: string;
  room_type: string | null;
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
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
            <Link href="/generate" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Back to Generator
            </Link>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {creations.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-foreground">The Gallery is Empty</h2>
            <p className="mt-2 text-muted-foreground">Be the first to publish a creation!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creations.map((creation) => (
              <Card key={creation.id} className="overflow-hidden group">
                <div className="w-full aspect-video rounded-t-lg overflow-hidden">
                    <ReactCompareSlider
                        itemOne={<ReactCompareSliderImage src={creation.original_image_url} alt="Before image" />}
                        itemTwo={<ReactCompareSliderImage src={creation.generated_image_url} alt="After image" />}
                    />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{creation.style}</Badge>
                    {creation.room_type && <Badge variant="outline">{creation.room_type}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created {new Date(creation.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
