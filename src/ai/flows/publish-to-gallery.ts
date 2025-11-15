
'use server';

/**
 * @fileOverview A flow to publish a design from the client to the public gallery.
 * This flow now handles uploading images to Cloudinary and then saving the
 * resulting URLs to the Supabase 'creations' table.
 *
 * - publishToGallery - Handles the entire publication process.
 */

import { ai } from '@/ai/genkit';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PublishToGalleryInputSchema, PublishToGalleryOutputSchema, type PublishToGalleryInput, type PublishToGalleryOutput } from '@/app/types';
import { cookies } from 'next/headers';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function publishToGallery(input: PublishToGalleryInput): Promise<PublishToGalleryOutput> {
    return publishToGalleryFlow(input);
}

const publishToGalleryFlow = ai.defineFlow(
    {
        name: 'publishToGalleryFlow',
        inputSchema: PublishToGalleryInputSchema,
        outputSchema: PublishToGalleryOutputSchema,
    },
    async (input) => {
        const cookieStore = await cookies();
        const supabase = createSupabaseServerClient(cookieStore);
        
        // 1. Upload images to Cloudinary
        const [originalImageUploadResult, generatedImageUploadResult] = await Promise.allSettled([
            uploadToCloudinary(input.originalImageDataUri, 'roomaigine_originals'),
            uploadToCloudinary(input.generatedImageDataUri, 'roomaigine_generated')
        ]);
        
        if (originalImageUploadResult.status === 'rejected' || generatedImageUploadResult.status === 'rejected') {
            console.error("Failed to upload one or both images to Cloudinary.", { originalImageUploadResult, generatedImageUploadResult });
            throw new Error("Could not prepare images for the public gallery. Please try again.");
        }
        
        const originalImageUrl = originalImageUploadResult.value;
        const generatedImageUrl = generatedImageUploadResult.value;

        // 2. Insert the data into the public 'creations' table with the NEW image URLs
        const { data, error: dbError } = await supabase
            .from('creations')
            .insert({
                original_image_url: originalImageUrl,
                generated_image_url: generatedImageUrl,
                style: input.style,
                room_type: input.roomType,
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
