
'use server';

/**
 * @fileOverview An AI flow to suggest design styles and color combinations for a room based on an image.
 *
 * - suggestStyles - A function that handles suggesting styles.
 * - SuggestStylesInput - The input type for the suggestStyles function.
 * - SuggestStylesOutput - The return type for the suggestStyles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const designStyles = ["Minimalist", "Luxury", "Cozy", "Industrial", "Bohemian", "Coastal", "Scandinavian", "Eclectic"] as const;

const SuggestStylesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  roomType: z.string().optional().describe("The type of the room (e.g. Bedroom, Living Room)."),
  availableColors: z.array(z.string()).describe("A list of available color names for the AI to choose from."),
});
export type SuggestStylesInput = z.infer<typeof SuggestStylesInputSchema>;

const SuggestStylesOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      style: z.enum(designStyles),
      colorCombo: z.string().describe("A comma-separated string of 2-3 complementary color names (e.g., 'Sage Green, Soft Ivory, Terracotta')."),
    })
  ).max(3).describe("An array of up to 3 suggested design styles with color combinations."),
});
export type SuggestStylesOutput = z.infer<typeof SuggestStylesOutputSchema>;


export async function suggestStyles(input: SuggestStylesInput): Promise<SuggestStylesOutput> {
  return suggestStylesFlow(input);
}

const instructionPrompt = `You are an expert interior designer. Analyze the provided image of a {{roomType}} and suggest up to 3 suitable design styles from the following list: ${designStyles.join(', ')}.

  For each suggestion, provide a style and a corresponding color combination of 2-3 colors. 
  
  IMPORTANT: You MUST ONLY choose colors from this list of available colors: {{#each availableColors}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}.

  Analyze the image for existing architecture, lighting, and general space. Base your suggestions on what would realistically enhance the room.

  Respond only with the structured data as defined. Do not include any extra text or reasoning.`;

const suggestStylesFlow = ai.defineFlow(
  {
    name: 'suggestStylesFlow',
    inputSchema: SuggestStylesInputSchema,
    outputSchema: SuggestStylesOutputSchema,
  },
  async (input) => {
    // This uses the default model which is gemini-1.5-pro-latest, suitable for vision-to-text.
    const { output } = await ai.generate({
      prompt: [
        { text: instructionPrompt },
        { media: { url: input.photoDataUri } }
      ],
      input: {
        roomType: input.roomType,
        availableColors: input.availableColors,
      },
      output: {
        schema: SuggestStylesOutputSchema,
      }
    });
    
    if (!output) {
        throw new Error('AI failed to suggest styles.');
    }
    
    return output;
  }
);
