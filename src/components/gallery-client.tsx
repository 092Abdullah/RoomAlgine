
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from './ui/button';
import { GalleryItem } from './gallery-item';
import type { Creation } from '@/app/gallery/page';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';


export function GalleryClient({ creations }: { creations: Creation[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get('filter') || 'all';

    const handleFilterChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
            params.delete('filter');
        } else {
            params.set('filter', value);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <>
            <div className="text-center py-8 md:py-12">
                <h1 className="text-4xl font-bold text-foreground">Inspirational Gallery</h1>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                    See how our community has reimagined their spaces with AI.
                </p>
            </div>
            
            <div className="flex justify-center mb-8">
                <Tabs value={currentFilter} onValueChange={handleFilterChange}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="interior">Interior Designs</TabsTrigger>
                        <TabsTrigger value="exterior">Exterior Designs</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {creations.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold text-foreground">The Gallery is Empty</h2>
                    <p className="mt-2 text-muted-foreground">Be the first to publish a creation!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {creations.map((creation) => (
                        <GalleryItem key={creation.id} creation={creation} />
                    ))}
                </div>
            )}
        </>
    )
}
