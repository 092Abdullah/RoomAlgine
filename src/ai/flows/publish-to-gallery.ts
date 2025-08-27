
'use server';

/**
 * @fileOverview A flow to publish a generated room design to a Cloudinary and a Supabase gallery.
 *
 * - publishToGallery - Uploads original and generated images to Cloudinary Storage and saves metadata to a Supabase table.
 */

import { ai } from '@/ai/genkit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { v2 as cloudinary } from 'cloudinary';
import { PublishToGalleryInputSchema, PublishToGalleryOutputSchema, type PublishToGalleryInput, type PublishToGalleryOutput } from '@/app/types';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(dataUri: string): Promise<string> {
    try {
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'room-ai-gine',
            resource_type: 'image'
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary.');
    }
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
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get: (name: string) => {
                        return cookieStore.get(name)?.value
                    },
                },
            }
        );

        const [original_image_url, generated_image_url] = await Promise.all([
            uploadImage(input.originalImageDataUri),
            uploadImage(input.generatedImageDataUri)
        ]);

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error: dbError } = await supabase
            .from('creations')
            .insert({
                original_image_url,
                generated_image_url,
                style: input.style,
                room_type: input.roomType,
                user_id: user?.id
            })
            .select('id')
            .single();
        
        if (dbError) {
            console.error('Supabase DB insert error:', dbError);
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
