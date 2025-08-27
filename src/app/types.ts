import { z } from 'zod';

export const PublishToGalleryInputSchema = z.object({
    originalImageDataUri: z.string().describe("The original room photo as a data URI."),
    generatedImageDataUri: z.string().describe("The AI-generated room photo as a data URI."),
    style: z.string(),
    roomType: z.string().optional(),
    // user_id is handled server-side from the session, so it's not needed in the client-facing input schema.
});
export type PublishToGalleryInput = z.infer<typeof PublishToGalleryInputSchema>;

export const PublishToGalleryOutputSchema = z.object({
    galleryUrl: z.string().describe("The URL to the newly created gallery entry."),
    creationId: z.string().describe("The unique ID of the created gallery item."),
});
export type PublishToGalleryOutput = z.infer<typeof PublishToGalleryOutputSchema>;
