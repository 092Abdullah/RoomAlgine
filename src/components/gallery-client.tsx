
"use client";

import { useState } from 'react';
import { Folder, Home, Building } from 'lucide-react';
import type { Creation } from '@/app/gallery/page';
import { GalleryItem } from './gallery-item';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import type { User } from '@supabase/supabase-js';
import { Header } from './header';


export function GalleryClient({ allCreations, user }: { allCreations: Creation[], user: User | null }) {
    const [filter, setFilter] = useState('all');

    const handleFilterChange = (value: string) => {
        setFilter(value);
    };

    const filteredCreations = allCreations.filter(creation => {
        if (filter === 'interior') return !!creation.room_type;
        if (filter === 'exterior') return !creation.room_type;
        return true;
    });

    return (
        <div className="bg-background min-h-screen">
          <Header user={user} />
          <main className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center py-8 md:py-12">
                <h1 className="text-4xl font-bold text-foreground">Inspirational Gallery</h1>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                    See how our community has reimagined their spaces with AI.
                </p>
            </div>
            
            <div className="flex justify-center mb-8">
                <Tabs value={filter} onValueChange={handleFilterChange}>
                    <TabsList>
                        <TabsTrigger value="all">
                            <Folder className="h-4 w-4 mr-2" />
                            All
                        </TabsTrigger>
                        <TabsTrigger value="interior">
                            <Home className="h-4 w-4 mr-2" />
                            Interior
                        </TabsTrigger>
                        <TabsTrigger value="exterior">
                            <Building className="h-4 w-4 mr-2" />
                            Exterior
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {filteredCreations.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold text-foreground">No Creations Found</h2>
                    <p className="mt-2 text-muted-foreground">Try a different filter or be the first to publish!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredCreations.map((creation) => (
                        <GalleryItem key={creation.id} creation={creation} />
                    ))}
                </div>
            )}
          </main>
        </div>
    )
}
