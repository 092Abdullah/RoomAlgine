
'use server';

/**
 * @fileOverview An AI flow to detect the type of room from a user-uploaded photo.
 *
 * - detectRoomType - A function that handles the room type detection.
 * - DetectRoomTypeInput - The input type for the detectRoomType function.
 * - DetectRoomTypeOutput - The return type for the detectRoomType function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectRoomTypeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectRoomTypeInput = z.infer<typeof DetectRoomTypeInputSchema>;

const roomTypes = ["Bedroom", "Living Room", "Kitchen", "Bathroom", "Office", "Dining Room", "Other"] as const;

const DetectRoomTypeOutputSchema = z.object({
  roomType: z.enum(roomTypes).describe("The detected type of the room."),
});
export type DetectRoomTypeOutput = z.infer<typeof DetectRoomTypeOutputSchema>;

export async function detectRoomType(input: DetectRoomTypeInput): Promise<DetectRoomTypeOutput> {
  return detectRoomTypeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectRoomTypePrompt',
  input: {schema: DetectRoomTypeInputSchema},
  output: {schema: DetectRoomTypeOutputSchema},
  model: 'googleai/gemini-1.5-flash-preview',
  prompt: `You are an expert in interior design and room classification. Analyze the provided image and determine the type of room.

  The possible room types are: ${roomTypes.join(', ')}.

  If the room type is not clear or doesn't fit into the categories, classify it as 'Other'.

  Respond with only the detected room type in the specified output format.

  Photo: {{media url=photoDataUri}}`,
});

const detectRoomTypeFlow = ai.defineFlow(
  {
    name: 'detectRoomTypeFlow',
    inputSchema: DetectRoomTypeInputSchema,
    outputSchema: DetectRoomTypeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
