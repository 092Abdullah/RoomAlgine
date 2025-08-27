
import RoomAIGineClient from '@/components/room-ai-gine-client';
import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

async function GeneratePageContent() {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    return <RoomAIGineClient user={user} />;
}

export default function GeneratePage() {
  return (
    <Suspense>
        <GeneratePageContent />
    </Suspense>
  );
}
