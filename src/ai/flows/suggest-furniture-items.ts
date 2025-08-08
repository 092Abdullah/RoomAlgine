'use server';

/**
 * @fileOverview Suggests matching furniture items for a styled room image with direct purchase links.
 *
 * - suggestFurnitureItems - A function that handles the furniture suggestion process.
 * - SuggestFurnitureItemsInput - The input type for the suggestFurnitureItems function.
 * - SuggestFurnitureItemsOutput - The return type for the suggestFurnitureItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFurnitureItemsInputSchema = z.object({
  roomStyle: z
    .string()
    .describe('The style of the room (e.g., minimalist, luxury, cozy, industrial).'),
  imageDescription: z
    .string()
    .describe('A description of the styled room image, including key features.'),
});
export type SuggestFurnitureItemsInput = z.infer<typeof SuggestFurnitureItemsInputSchema>;

const SuggestFurnitureItemsOutputSchema = z.object({
  furnitureSuggestions: z
    .array(z.object({
      itemName: z.string().describe('The name of the furniture item.'),
      itemDescription: z.string().describe('A short description of the furniture item.'),
      purchaseLink: z.string().url().describe('A direct link to purchase the furniture item.'),
      styleKeywords: z.array(z.string()).describe('Keywords related to the style of the furniture item'),
    }))
    .describe('An array of suggested furniture items with purchase links.'),
});
export type SuggestFurnitureItemsOutput = z.infer<typeof SuggestFurnitureItemsOutputSchema>;

export async function suggestFurnitureItems(input: SuggestFurnitureItemsInput): Promise<SuggestFurnitureItemsOutput> {
  return suggestFurnitureItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFurnitureItemsPrompt',
  input: {schema: SuggestFurnitureItemsInputSchema},
  output: {schema: SuggestFurnitureItemsOutputSchema},
  prompt: `You are an expert interior design assistant.

You are provided with the style of a room and a description of the styled room image.
Based on this information, you will suggest matching furniture items with direct purchase links.

Room Style: {{{roomStyle}}}
Image Description: {{{imageDescription}}}

Suggest furniture items that complement the room's style and features.
Include the item name, a short description, a direct purchase link, and keywords related to its style.
Ensure the purchase link is a valid URL.

Follow the schema to populate the output with the suggested furniture items.
`,
});

const suggestFurnitureItemsFlow = ai.defineFlow(
  {
    name: 'suggestFurnitureItemsFlow',
    inputSchema: SuggestFurnitureItemsInputSchema,
    outputSchema: SuggestFurnitureItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
