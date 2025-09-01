
import { GalleryClient } from '@/components/gallery-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
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

export default async function GalleryPage() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const creations = await getCreations();

  return <GalleryClient allCreations={creations} user={user} />;
}
