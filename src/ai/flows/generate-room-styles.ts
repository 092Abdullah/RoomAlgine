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
    const styledRoomImagePromises = input.styles.map(async (style) => {

      // Base prompt components
      const baseKeywords = "professional interior design photo, photorealistic, cinematic lighting, 8k, ultra-detailed, high-end finishes, stylish decor";
      const negativeKeywords = "blurry, pixelated, unrealistic, cartoon, amateur, watermark, text, signature, human, people";

      // Dynamic components from user input
      const styleKeywords = `${style} style`;
      const colorKeywords = input.colorPreferences && input.colorPreferences.length > 0 ? `, color palette includes ${input.colorPreferences.join(', ')}` : '';
      const moodKeywords = input.mood ? `, with a ${input.mood} mood` : '';

      // Room-specific keywords (preserve furniture, only restyle)
      let roomSpecificKeywords = 'retain all existing furniture and layout, restyle with updated colors, materials, and finishes'; // Fallback
      switch (input.roomType?.toLowerCase()) {
        case 'bedroom':
          roomSpecificKeywords = 'keep existing bed and furniture, restyle into a cozy modern bedroom with warm tones, layered textiles, elegant curtains, decorative accents, and soft lighting';
          break;
        case 'living-room':
          roomSpecificKeywords = 'preserve current sofa and layout, restyle into a contemporary living room with neutral walls, stylish textures, cozy accents, and modern artwork';
          break;
        case 'kitchen':
          roomSpecificKeywords = 'keep cabinets and appliances, restyle into a sleek modern kitchen with updated finishes, stylish backsplash, improved lighting, and clutter-free surfaces';
          break;
        case 'bathroom':
          roomSpecificKeywords = 'retain existing layout, restyle into a spa-like bathroom with bright tiles, glass accents, soft lighting, and clean modern finishes';
          break;
        case 'office':
          roomSpecificKeywords = 'keep current desk and chair, restyle into a productive modern office with better lighting, minimalistic decor, fresh colors, and stylish accents';
          break;
        case 'dining-room':
          roomSpecificKeywords = 'retain existing dining set, restyle into an elegant dining space with warm tones, stylish chandelier lighting, decorative accents, and modern wall finishes';
          break;
      }

      // Assemble the final positive prompt
      const positivePrompt = `A ${styleKeywords} ${input.roomType || 'room'} interior. ${roomSpecificKeywords}. ${baseKeywords}${colorKeywords}${moodKeywords}.`;

      const instructionPrompt = `
You are an AI interior designer. Your task is to edit the provided image based on my instructions.

**NON-NEGOTIABLE RULES:**
1. **PRESERVE ARCHITECTURE:** Do NOT alter the room's fundamental structure. Walls, windows, doors, ceiling, and floor must remain the same.
2. **MAINTAIN CAMERA ANGLE:** The camera perspective and angle MUST remain IDENTICAL to the original photo.
3. **KEEP EXISTING FURNITURE:** Keep all furniture, layout, and major items in place. Do NOT replace them. Only restyle with new colors, textures, finishes, and decor adjustments.

**TASK:**
- **Positive Prompt (Your Goal):** ${positivePrompt}
- **Negative Prompt (What to Avoid):** ${negativeKeywords}

Restyle the room's interior strictly according to the positive prompt, while following all rules. The output must be a single, photorealistic image.`;

      const promptPayload = [
        { media: { url: input.photoDataUri } },
        { text: instructionPrompt },
      ];

      const generateConfig = {
        responseModalities: ['TEXT', 'IMAGE'],
      };

      try {
        const { media } = await ai.generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: promptPayload,
          config: generateConfig,
        });

        if (media && media.url) {
          return {
            style: style,
            imageDataUri: media.url,
          };
        }
        return null;
      } catch (err) {
        console.error(`Image generation failed for style "${style}":`, err);
        return null;
      }
    });

    const results = await Promise.all(styledRoomImagePromises);
    const styledRoomImages = results.filter((image) => image !== null) as {
      style: string;
      imageDataUri: string;
    }[];

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
