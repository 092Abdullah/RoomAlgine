
import { GalleryClient } from '@/components/gallery-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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
  searchParams?: any;
};

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const creations = await getCreations();

  const resolvedParams = searchParams || {};
  const filter =
    typeof resolvedParams.filter === 'string' && ['interior', 'exterior'].includes(resolvedParams.filter)
      ? resolvedParams.filter
      : 'all';

  return <GalleryClient allCreations={creations} initialFilter={filter} user={user} />;
}
