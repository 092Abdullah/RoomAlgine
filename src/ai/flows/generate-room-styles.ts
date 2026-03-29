
'use server';

/**
 * @fileOverview A room restyling AI agent that generates multiple styled versions of a room based on a user-uploaded photo and personalization options.
 *
 * - generateRoomStyles - A function that handles the room restyling process.
 * - GenerateRoomStylesInput - The input type for the generateRoomStyles function.
 * - GenerateRoomStylesOutput - The return type for the generateRoomStyles function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRoomStylesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  styles: z
    .array(z.string())
    .describe("An array of design styles to apply to the room (e.g., minimalist, luxury, cozy, industrial)."),
  roomType: z.string().optional().describe("The type of the room (e.g. Bedroom, Living Room)."),
  colorPreferences: z.array(z.string()).optional().describe("An array of preferred colors."),
  mood: z.string().optional().describe("The desired mood for the room (e.g. Relaxed, Energetic)."),
  priceRange: z.string().optional().describe("The desired price range for the furniture and decor (e.g. $10,000, $50,000)."),
  userPrompt: z.string().optional().describe("Additional text prompt from the user for specific requests."),
});
export type GenerateRoomStylesInput = z.infer<typeof GenerateRoomStylesInputSchema>;

const GenerateRoomStylesOutputSchema = z.object({
  styledRoomImages: z.array(
    z.object({
      style: z.string().describe("The design style applied to the room image."),
      imageDataUri: z.string().describe("The styled room image as a data URI."),
    })
  ).describe("An array of styled room images with their corresponding design styles."),
});
export type GenerateRoomStylesOutput = z.infer<typeof GenerateRoomStylesOutputSchema>;

export async function generateRoomStyles(input: GenerateRoomStylesInput): Promise<GenerateRoomStylesOutput> {
  return generateRoomStylesFlow(input);
}

const generateRoomStylesFlow = ai.defineFlow(
  {
    name: 'generateRoomStylesFlow',
    inputSchema: GenerateRoomStylesInputSchema,
    outputSchema: GenerateRoomStylesOutputSchema,
  },
  async (input) => {
    const styledRoomImages: { style: string; imageDataUri: string }[] = [];

    for (const style of input.styles) {
      // Base prompt components
      const baseKeywords = "professional interior design photo, photorealistic, cinematic lighting, 8k, ultra-detailed, high-end finishes, stylish decor";
      
      // Dynamic components from user input
      const styleKeywords = `${style} style`;
      const colorKeywords = input.colorPreferences && input.colorPreferences.length > 0 ? `, with a color palette including ${input.colorPreferences.join(', ')}` : '';
      const moodKeywords = input.mood ? `, evoking a ${input.mood} mood` : '';
      const roomTypeKeywords = input.roomType ? ` this ${input.roomType}` : '';
      const userPromptKeywords = input.userPrompt ? ` Also, adhere to this special request: ${input.userPrompt}.` : '';

      // Parse budget and determine keywords
      const budgetStr = input.priceRange ? input.priceRange.replace(/[^0-9]/g, '') : '0';
      const budgetNum = parseInt(budgetStr, 10) || 0;
      let budgetInstructions = '';
      if (budgetNum === 0) {
        budgetInstructions = 'Do not add any new decor elements; only restyle the existing items in the room.';
      } else {
        let itemCount = 'a few (2-3)';
        if (budgetNum > 10000) itemCount = 'several (4-6)';
        if (budgetNum > 30000) itemCount = 'numerous';
        
        let quality = 'affordable and stylish';
        if (budgetNum > 20000) quality = 'high-quality and tasteful';
        if (budgetNum > 40000) quality = 'luxurious and premium';

        budgetInstructions = `Introduce ${itemCount} new decor items like pillows, throws, plants, wall art, or rugs. Select ${quality} items that fit the budget and enhance the space without altering the main furniture layout.`;
      }


      // Assemble the final positive prompt
      const instructionPrompt = `
You are an expert AI interior designer. Your task is to realistically edit the provided image based on the following instructions.

**NON-NEGOTIABLE RULES:**
1.  **PRESERVE CORE ARCHITECTURE:** Do NOT alter the fundamental shape, size, or layout of walls, windows, doors, ceiling, or floor. You can only change their materials, colors, and textures.
2.  **MAINTAIN CAMERA PERSPECTIVE:** The camera angle, field of view, and position MUST remain IDENTICAL to the original photo.
3.  **RETAIN CORE FURNITURE:** Do NOT add, remove, or move the main furniture pieces (like beds, sofas, large tables). You must only restyle their appearance (e.g., change fabric, color, material).
4.  **FOLLOW BUDGET FOR DECOR:** Adhere strictly to the budget instructions for adding smaller decor items.

**YOUR TASK:**
Redesign${roomTypeKeywords} to embody a ${styleKeywords} design${moodKeywords}${colorKeywords}. The final image must be a single, photorealistic masterpiece featuring ${baseKeywords}.

**BUDGET-BASED DECOR INSTRUCTIONS:**
${budgetInstructions}${userPromptKeywords}`;

      const promptPayload = [
        { media: { url: input.photoDataUri } },
        { text: instructionPrompt },
      ];

      const generateConfig = {
        responseModalities: ['TEXT', 'IMAGE'],
      };

      try {
        const { media } = await ai.generate({
          model: 'gemini-3.1-flash-image-preview',
          prompt: promptPayload,
          config: generateConfig,
        });

        if (media && media.url) {
          styledRoomImages.push({
            style: style,
            imageDataUri: media.url,
          });
        }
      } catch (err) {
        console.error(`Image generation failed for style "${style}":`, err);
        // Continue to the next style instead of throwing an error for the whole batch
      }
    }

    if (styledRoomImages.length === 0 && input.styles.length > 0) {
      throw new Error(
        'Image generation failed for all selected styles. Please try again or adjust your preferences.'
      );
    }

    return {
      styledRoomImages,
    };
  }
);
