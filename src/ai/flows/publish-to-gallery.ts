
'use server';

/**
 * @fileOverview A flow to publish a design from a user's history to the public gallery.
 *
 * - publishToGallery - Copies a design from the 'designs' table to the 'creations' table.
 */

import { ai } from '@/ai/genkit';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PublishToGalleryInputSchema, PublishToGalleryOutputSchema, type PublishToGalleryInput, type PublishToGalleryOutput } from '@/app/types';
import { cookies } from 'next/headers';

// Note: The Cloudinary upload logic is removed from here as we assume URLs are already stored.
// If direct data URI upload is still needed, it should be added back.

export async function publishToGallery(input: PublishToGalleryInput): Promise<PublishToGalleryOutput> {
    return publishToGalleryFlow(input);
}

const publishToGalleryFlow = ai.defineFlow(
    {
        name: 'publishToGalleryFlow',
        inputSchema: PublishToGalleryInputSchema,
        outputSchema: PublishToGalleryOutputSchema,
    },
    async ({ designId }) => {
        const cookieStore = cookies();
        const supabase = createSupabaseServerClient(cookieStore);

        // RLS policy on `creations` table now ensures only authenticated users can insert.
        // We still need the user to fetch from their private `designs` table.
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User must be logged in to publish to the gallery.');
        }

        // 1. Fetch the design from the private 'designs' table
        const { data: design, error: fetchError } = await supabase
            .from('designs')
            .select('*')
            .eq('id', designId)
            .eq('user_id', user.id) // Ensure user owns the design
            .single();
        
        if (fetchError || !design) {
            console.error('Error fetching design or design not found:', fetchError);
            throw new Error('Could not find the specified design to publish.');
        }

        // 2. Insert the data into the public 'creations' table, without user_id
        const { data, error: dbError } = await supabase
            .from('creations')
            .insert({
                original_image_url: design.original_image_url,
                generated_image_url: design.generated_image_url,
                style: design.style,
                room_type: design.room_type,
                // user_id is no longer inserted
            })
            .select('id')
            .single();
        
        if (dbError) {
            console.error('Supabase DB insert error:', dbError);
            // Handle potential unique constraint violation if already published
            if (dbError.code === '23505') { // unique_violation
                 throw new Error(`This design may have already been published.`);
            }
            throw new Error(`Failed to save creation to database: ${dbError.message}`);
        }
        
        if (!data) {
            throw new Error('Failed to retrieve creation ID after insert.');
        }

        return {
            galleryUrl: '/gallery',
            creationId: data.id,
        };
    }
);
