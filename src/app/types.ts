import { z } from 'zod';

// This input now only requires the ID of the design to be published.
export const PublishToGalleryInputSchema = z.object({
    designId: z.string().describe("The ID of the design from the user's history to publish."),
});
export type PublishToGalleryInput = z.infer<typeof PublishToGalleryInputSchema>;

export const PublishToGalleryOutputSchema = z.object({
    galleryUrl: z.string().describe("The URL to the newly created gallery entry."),
    creationId: z.string().describe("The unique ID of the created gallery item."),
});
export type PublishToGalleryOutput = z.infer<typeof PublishToGalleryOutputSchema>;
