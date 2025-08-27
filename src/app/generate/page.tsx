
import RoomAIGineClient from '@/components/room-ai-gine-client';
import { createSupabaseServerClient } from '@/lib/supabase';
import { Suspense } from 'react';

async function GeneratePageContent() {
    const supabase = createSupabaseServerClient();
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
