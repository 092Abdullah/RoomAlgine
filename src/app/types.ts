
import { z } from 'zod';

// This input now contains all the data needed to create a gallery item from scratch.
export const PublishToGalleryInputSchema = z.object({
    originalImageDataUri: z.string().describe("The original user-uploaded image as a data URI."),
    generatedImageDataUri: z.string().describe("The AI-generated image as a data URI."),
    style: z.string().describe("The design style applied."),
    roomType: z.string().optional().describe("The type of room or exterior space."),
});
export type PublishToGalleryInput = z.infer<typeof PublishToGalleryInputSchema>;

export const PublishToGalleryOutputSchema = z.object({
    galleryUrl: z.string().describe("The URL to the newly created gallery entry."),
    creationId: z.string().describe("The unique ID of the created gallery item."),
});
export type PublishToGalleryOutput = z.infer<typeof PublishToGalleryOutputSchema>;
