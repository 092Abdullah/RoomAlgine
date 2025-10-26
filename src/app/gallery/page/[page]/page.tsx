
import { GalleryClient } from '@/components/gallery-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

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
  if (isNaN(page) || page < 1) {
    return { creations: [], totalPages: 0 };
  }
    
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

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

export default async function GalleryPaginatedPage({ params }: { params: any }) {
  // Awaiting params as per the error message and environment requirements.
  const awaitedParams = await params;
  const currentPage = Number(awaitedParams?.page || '1');
  
  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  const { creations, totalPages } = await getCreations(currentPage);

  if (currentPage > totalPages && totalPages > 0) {
    notFound();
  }

  return <GalleryClient allCreations={creations} user={null} totalPages={totalPages} currentPage={currentPage} />;
}
