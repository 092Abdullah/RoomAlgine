
import RoomAIGineClient from '@/components/room-ai-gine-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function GeneratePage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return <RoomAIGineClient user={user} />;
}
