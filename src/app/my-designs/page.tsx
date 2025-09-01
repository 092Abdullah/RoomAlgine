
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import MyDesignsClient from '@/components/my-designs-client';
import type { Design } from '@/components/my-designs-client';

// This is the default export: a Server Component that fetches data and passes it to the client component.
export default async function MyDesignsPage() {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?next=/my-designs');
    }

    const { data: designs, error } = await supabase
        .from('designs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user designs:', error);
        // In a real app, you might want to show an error page here
    }

    // Explicitly cast to Design[] to resolve type mismatch, ensuring kudos exists.
    const creations: Design[] = (designs || []).map(d => ({ ...d, kudos: d.kudos || 0 }));

    // The Server Component now renders the Client Component and passes data as props.
    return <MyDesignsClient user={user} creations={creations} />;
}
