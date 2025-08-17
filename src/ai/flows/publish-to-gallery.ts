'use server';

/**
 * @fileOverview A flow to publish a generated room design to a Supabase gallery.
 *
 * - publishToGallery - Uploads original and generated images to Supabase Storage and saves metadata to a Supabase table.
 * - PublishToGalleryInput - The input type for the publishToGallery function.
 * - PublishToGalleryOutput - The return type for the publishToGallery function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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


export const PublishToGalleryInputSchema = z.object({
    originalImageDataUri: z.string().describe("The original room photo as a data URI."),
    generatedImageDataUri: z.string().describe("The AI-generated room photo as a data URI."),
    style: z.string(),
    roomType: z.string().optional(),
    colors: z.array(z.string()).optional(),
    mood: z.string().optional(),
});
export type PublishToGalleryInput = z.infer<typeof PublishToGalleryInputSchema>;

export const PublishToGalleryOutputSchema = z.object({
    galleryUrl: z.string().describe("The URL to the newly created gallery entry."),
});
export type PublishToGalleryOutput = z.infer<typeof PublishToGalleryOutputSchema>;


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
