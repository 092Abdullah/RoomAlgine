
'use server';

/**
 * @fileOverview An exterior restyling AI agent that generates multiple styled versions of a building's facade based on a user-uploaded photo and personalization options.
 *
 * - generateExteriorStyles - A function that handles the exterior restyling process.
 * - GenerateExteriorStylesInput - The input type for the generateExteriorStyles function.
 * - GenerateExteriorStylesOutput - The return type for the generateExteriorStyles function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateExteriorStylesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a building's exterior, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  styles: z
    .array(z.string())
    .describe("An array of architectural styles to apply to the exterior (e.g., Modern, Farmhouse, Coastal)."),
  materials: z.array(z.string()).optional().describe("An array of preferred exterior materials (e.g., Siding, Brick, Stone)."),
  landscaping: z.string().optional().describe("The desired landscaping style (e.g. Minimal, Lush, Modern)."),
});
export type GenerateExteriorStylesInput = z.infer<typeof GenerateExteriorStylesInputSchema>;

const GenerateExteriorStylesOutputSchema = z.object({
  styledExteriorImages: z.array(
    z.object({
      style: z.string().describe("The architectural style applied to the exterior image."),
      imageDataUri: z.string().describe("The styled exterior image as a data URI."),
    })
  ).describe("An array of styled exterior images with their corresponding architectural styles."),
});
export type GenerateExteriorStylesOutput = z.infer<typeof GenerateExteriorStylesOutputSchema>;

export async function generateExteriorStyles(input: GenerateExteriorStylesInput): Promise<GenerateExteriorStylesOutput> {
  return generateExteriorStylesFlow(input);
}

const generateExteriorStylesFlow = ai.defineFlow(
  {
    name: 'generateExteriorStylesFlow',
    inputSchema: GenerateExteriorStylesInputSchema,
    outputSchema: GenerateExteriorStylesOutputSchema,
  },
  async (input) => {
    const styledExteriorImages: { style: string; imageDataUri: string }[] = [];

    for (const style of input.styles) {
      const baseKeywords = "professional architectural photo, photorealistic, cinematic lighting, 8k, ultra-detailed, high-end materials";
      
      const styleKeywords = `${style} style`;
      const materialKeywords = input.materials && input.materials.length > 0 ? `, main materials include ${input.materials.join(' and ')}` : '';
      const landscapingKeywords = input.landscaping ? `, with ${input.landscaping} landscaping` : '';

      const instructionPrompt = `
You are an expert AI architect and landscape designer. Your task is to edit the provided image of a building's exterior.

**NON-NEGOTIABLE RULES:**
1. **PRESERVE BUILDING SHAPE:** Do NOT alter the fundamental shape, size, or structure of the building. The core architectural form, including roofline, building footprint, and massing, MUST remain IDENTICAL to the original photo.
2. **MAINTAIN CAMERA ANGLE:** The camera perspective and angle MUST remain IDENTICAL to the original photo.
3. **PRESERVE WINDOW/DOOR PLACEMENT:** Do NOT move, add, or remove windows and doors. You may only change their style, color, and materials.

**TASK:**
Review the existing structure in the provided photo and redesign its facade and immediate surroundings to embody a ${styleKeywords} design${materialKeywords}${landscapingKeywords}. Restyle elements like siding, roofing, trim, doors, windows, and landscaping. The result should feature ${baseKeywords}.
The output must be a single, photorealistic image.`;

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
          styledExteriorImages.push({
            style: style,
            imageDataUri: media.url,
          });
        }
      } catch (err) {
        console.error(`Image generation failed for style "${style}":`, err);
      }
    }

    if (styledExteriorImages.length === 0 && input.styles.length > 0) {
      throw new Error(
        'Image generation failed for all selected styles. Please try again or adjust your preferences.'
      );
    }

    return {
      styledExteriorImages,
    };
  }
);
