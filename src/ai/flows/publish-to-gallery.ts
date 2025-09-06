
'use server';

/**
 * @fileOverview A flow to publish a design from a user's history to the public gallery.
 * This flow now copies the images to a separate "gallery" folder in Cloudinary
 * to prevent them from being deleted if the user deletes the original design.
 *
 * - publishToGallery - Copies a design and its images to the public gallery.
 */

import { ai } from '@/ai/genkit';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PublishToGalleryInputSchema, PublishToGalleryOutputSchema, type PublishToGalleryInput, type PublishToGalleryOutput } from '@/app/types';
import { cookies } from 'next/headers';
import { copyCloudinaryImage } from '@/lib/cloudinary';

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
        const cookieStore = await cookies();
        const supabase = createSupabaseServerClient(cookieStore);

        // RLS ensures only authenticated users can insert. We need the user to fetch their private design.
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User must be logged in to publish to the gallery.');
        }

        // 1. Fetch the design from the private 'designs' table
        const { data: design, error: fetchError } = await supabase
            .from('designs')
            .select('*')
            .eq('id', designId)
            .eq('user_id', user.id)
            .single();
        
        if (fetchError || !design) {
            console.error('Error fetching design or design not found:', fetchError);
            throw new Error('Could not find the specified design to publish.');
        }

        // 2. Copy images to a protected "gallery" folder in Cloudinary
        const [originalImageCopyResult, generatedImageCopyResult] = await Promise.allSettled([
            copyCloudinaryImage(design.original_image_url, 'roomaigine_gallery'),
            copyCloudinaryImage(design.generated_image_url, 'roomaigine_gallery')
        ]);
        
        if (originalImageCopyResult.status === 'rejected' || generatedImageCopyResult.status === 'rejected') {
            console.error("Failed to copy one or both images to the gallery folder.", { originalImageCopyResult, generatedImageCopyResult });
            throw new Error("Could not prepare images for the public gallery. Please try again.");
        }
        
        const newOriginalImageUrl = originalImageCopyResult.value;
        const newGeneratedImageUrl = generatedImageCopyResult.value;

        // 3. Insert the data into the public 'creations' table with the NEW image URLs
        const { data, error: dbError } = await supabase
            .from('creations')
            .insert({
                original_image_url: newOriginalImageUrl,
                generated_image_url: newGeneratedImageUrl,
                style: design.style,
                room_type: design.room_type,
            })
            .select('id')
            .single();
        
        if (dbError) {
            console.error('Supabase DB insert error:', dbError);
            if (dbError.code === '23505') { 
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
