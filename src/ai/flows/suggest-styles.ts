'use server';

/**
 * @fileOverview An AI flow to suggest design styles for a room based on an image.
 *
 * - suggestStyles - A function that handles suggesting styles.
 * - SuggestStylesInput - The input type for the suggestStyles function.
 * - SuggestStylesOutput - The return type for the suggestStyles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const designStyles = ["Minimalist", "Luxury", "Cozy", "Industrial", "Bohemian", "Coastal", "Scandinavian", "Eclectic"];

export const SuggestStylesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  roomType: z.string().optional().describe("The type of the room (e.g. Bedroom, Living Room)."),
});
export type SuggestStylesInput = z.infer<typeof SuggestStylesInputSchema>;

export const SuggestStylesOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      style: z.enum(designStyles),
      reason: z.string().describe("A brief reason why this style would suit the room."),
    })
  ).describe("An array of 2-3 suggested design styles with justifications."),
});
export type SuggestStylesOutput = z.infer<typeof SuggestStylesOutputSchema>;


export async function suggestStyles(input: SuggestStylesInput): Promise<SuggestStylesOutput> {
  return suggestStylesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStylesPrompt',
  input: {schema: SuggestStylesInputSchema},
  output: {schema: SuggestStylesOutputSchema},
  prompt: `You are an expert interior designer. Analyze the provided image of a {{roomType}} and suggest 2-3 suitable design styles from the following list: ${designStyles.join(', ')}.

  For each suggestion, provide a brief, one-sentence justification explaining why it would work well for the room in the image.

  Analyze the image for existing architecture, lighting, and general space. Base your suggestions on what would realistically enhance the room.

  Photo: {{media url=photoDataUri}}`,
});

const suggestStylesFlow = ai.defineFlow(
  {
    name: 'suggestStylesFlow',
    inputSchema: SuggestStylesInputSchema,
    outputSchema: SuggestStylesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
