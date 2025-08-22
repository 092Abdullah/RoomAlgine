
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { HeaderLogoIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { GalleryClient } from '@/components/gallery-client';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { DesignTypeSelectionDialog } from '@/components/design-type-selection-dialog';

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

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const creations = await getCreations();
  
  const filter =
    searchParams?.filter === 'interior' || searchParams?.filter === 'exterior'
      ? (searchParams.filter as string)
      : 'all';

  return (
    <GalleryClient allCreations={creations} initialFilter={filter} />
  );
}
