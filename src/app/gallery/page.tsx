
import { GalleryClient } from '@/components/gallery-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export type Creation = {
  id: string;
  created_at: string;
  original_image_url: string;
  generated_image_url: string;
  style: string;
  room_type: string | null;
  kudos: number;
};

const ITEMS_PER_PAGE = 12;

async function getCreations(page: number): Promise<{ creations: Creation[], totalPages: number }> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // Fetch creations for the current page and the total count in parallel
  const { data, error, count } = await supabase
    .from('creations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching creations:', error);
    throw new Error(
      `Failed to fetch creations from the database. Error: ${error.message}`
    );
  }

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);
  return { creations: data || [], totalPages };
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  // No need to fetch user anymore.
  const currentPage = Number(searchParams.page) || 1;
  const { creations, totalPages } = await getCreations(currentPage);

  // Pass user as null to the client component.
  return <GalleryClient allCreations={creations} user={null} totalPages={totalPages} currentPage={currentPage} />;
}
