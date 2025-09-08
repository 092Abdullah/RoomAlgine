
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
    
    // Pass the fetched designs directly to the client component.
    // The Design type in the client component will handle the data structure.
    const creations: Design[] = designs || [];

    // The Server Component now renders the Client Component and passes data as props.
    return <MyDesignsClient user={user} creations={creations} />;
}
