'use server';

/**
 * @fileOverview A flow to publish a generated room design to a Supabase gallery.
 *
 * - publishToGallery - Uploads original and generated images to Supabase Storage and saves metadata to a Supabase table.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import type { PublishToGalleryInput, PublishToGalleryOutput } from '@/app/actions';
import { PublishToGalleryInputSchema, PublishToGalleryOutputSchema } from '@/app/actions';

// Helper function to decode data URI and convert to Buffer
function dataUriToBuffer(dataUri: string): Buffer {
    const base64 = dataUri.split(',')[1];
    if (!base64) {
        throw new Error('Invalid data URI');
    }
    return Buffer.from(base64, 'base64');
}

// Helper function to upload an image buffer to Supabase Storage
async function uploadImage(imageBuffer: Buffer, fileExtension: string = 'png'): Promise<string> {
    const fileName = `${uuidv4()}.${fileExtension}`;
    const { data, error } = await supabase.storage
        .from('gallery_images')
        .upload(fileName, imageBuffer, {
            contentType: `image/${fileExtension}`,
            upsert: false,
        });

    if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Failed to upload image to Supabase Storage: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage.from('gallery_images').getPublicUrl(data.path);
    return publicUrl;
}

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

        const originalImageBuffer = dataUriToBuffer(input.originalImageDataUri);
        const generatedImageBuffer = dataUriToBuffer(input.generatedImageDataUri);

        const [original_image_url, generated_image_url] = await Promise.all([
            uploadImage(originalImageBuffer),
            uploadImage(generatedImageBuffer)
        ]);

        const { error: dbError } = await supabase
            .from('creations')
            .insert({
                original_image_url,
                generated_image_url,
                style: input.style,
                room_type: input.roomType,
                colors: input.colors,
                mood: input.mood
            });
        
        if (dbError) {
            console.error('Supabase DB insert error:', dbError);
            throw new Error(`Failed to save creation to database: ${dbError.message}`);
        }

        // For now, we can just return a success message or the main gallery URL
        // In a real app, you might return the URL for the specific new creation
        return {
            galleryUrl: '/gallery' 
        };
    }
);
