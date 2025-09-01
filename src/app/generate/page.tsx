
import RoomAIGineClient from '@/components/room-ai-gine-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function GeneratePage() {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    return <RoomAIGineClient user={user} />;
}
