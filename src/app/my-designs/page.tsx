
'use client';

import { useState } from 'react';
import { GalleryItem } from '@/components/gallery-item';
import type { Creation } from '@/app/gallery/page';
import { Button } from '@/components/ui/button';
import { ArrowRight, Image } from 'lucide-react';
import { Header } from '@/components/header';
import { DesignTypeSelectionDialog } from '@/components/design-type-selection-dialog';
import type { User } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

type MyDesignsPageProps = {
    user: User | null;
    creations: Creation[];
};

// This is the Client Component
function MyDesignsClient({ user, creations }: MyDesignsPageProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <DesignTypeSelectionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} user={user} />
            <div className="bg-background min-h-screen">
              <Header user={user} />
              <main className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
                <div className="text-center py-8 md:py-12">
                    <h1 className="text-4xl font-bold text-foreground">My Designs</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        Here are all the wonderful spaces you've created.
                    </p>
                </div>
                
                {creations.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl">
                        <Image className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="mt-6 text-xl font-semibold text-foreground">No Designs Yet</h2>
                        <p className="mt-2 text-muted-foreground">You haven't created any designs. Let's change that!</p>
                        <Button onClick={() => setIsDialogOpen(true)} className="mt-6">
                            Create your first design <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {creations.map((creation) => (
                            <GalleryItem key={creation.id} creation={creation} isDashboardItem={true} />
                        ))}
                    </div>
                )}
              </main>
            </div>
        </>
    );
}

// This will be the default export, a Server Component that fetches data.
export default async function MyDesignsPageWrapper() {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // This part runs on the server. If no user, redirect immediately.
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

    // Explicitly cast to Creation[] to resolve type mismatch, ensuring kudos exists.
    const creations: Creation[] = (designs || []).map(d => ({ ...d, kudos: d.kudos || 0 }));

    // The Server Component now renders the Client Component and passes data as props.
    return <MyDesignsClient user={user} creations={creations} />;
}
