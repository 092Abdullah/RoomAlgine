import { GalleryClient } from '@/components/gallery-client';
import { createSupabaseServerClient } from '@/lib/supabase';

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
  const supabase = createSupabaseServerClient();
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
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const creations = await getCreations();

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ✅ Await the searchParams since it's now a Promise
  const resolvedParams = (await searchParams) || {};

  const filter =
    resolvedParams.filter === 'interior' || resolvedParams.filter === 'exterior'
      ? (resolvedParams.filter as string)
      : 'all';

  return <GalleryClient allCreations={creations} initialFilter={filter} user={user}/>;
}
