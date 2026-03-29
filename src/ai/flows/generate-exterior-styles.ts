
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
  exteriorType: z.string().optional().describe("The specific type of exterior space (e.g., Garden, Balcony, Poolside)."),
  materials: z.array(z.string()).optional().describe("An array of preferred exterior materials (e.g., Siding, Brick, Stone)."),
  landscaping: z.string().optional().describe("The desired landscaping style (e.g. Minimal, Lush, Modern)."),
  userPrompt: z.string().optional().describe("Additional text prompt from the user for specific requests."),
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
      
      const styleKeywords = `${style} architectural style`;
      const exteriorTypeKeywords = input.exteriorType ? ` for a ${input.exteriorType}`: '';
      const materialKeywords = input.materials && input.materials.length > 0 ? ` featuring materials like ${input.materials.join(' and ')}` : '';
      const landscapingKeywords = input.landscaping ? `, with a ${input.landscaping} landscaping theme` : '';
      const userPromptKeywords = input.userPrompt ? `\n-   **Special Instructions:** ${input.userPrompt}` : '';


      const instructionPrompt = `
You are an expert AI architect and landscape designer. Your task is to edit and realistically restyle the provided image.

**NON-NEGOTIABLE RULES:**
1.  **PRESERVE CORE STRUCTURE:** Do NOT alter the fundamental shape, size, or structure of the building (walls, roofline) or key landscape elements (like pools, large trees, or driveways). The core layout MUST remain IDENTICAL to the original photo.
2.  **MAINTAIN CAMERA ANGLE:** The camera perspective, angle, and field of view MUST remain IDENTICAL to the original photo. Do not zoom in, zoom out, or change the viewpoint.
3.  **PRESERVE MAJOR ELEMENT PLACEMENT:** Do NOT add, remove, or relocate major architectural features like windows, doors, chimneys, or structural posts. You may only change their *style*, color, and materials.

**TASK:**
Redesign the provided exterior space${exteriorTypeKeywords} to embody a ${styleKeywords}. The final image must be photorealistic and seamlessly edited.

**DESIGN FOCUS - ${input.exteriorType || 'General Exterior'}:**
-   **For "House Exterior (Facade)":** Focus on siding, roofing, trim, windows, the front door, and entry lighting.
-   **For "Garden / Backyard":** Focus on plant arrangements, lawn care, patio furniture, pathways, and adding harmonious decor.
-   -   **For "Balcony / Terrace":** Focus on flooring, railings, container plants, compact furniture, and outdoor textiles.
-   **For "Driveway & Garage":** Focus on the driveway surface, garage door style, and surrounding landscape integration.
-   **For "Poolside / Outdoor Lounge":** Focus on deck materials, lounge furniture, umbrellas, and water features.
-   **For "Fence & Gate Design":** Focus on the fence/gate style, material, color, and integration with the surrounding landscape.

**USER PREFERENCES:**
Apply the following user-defined preferences to the redesign:
-   **Materials:**${materialKeywords || ' Use materials appropriate for the style.'}
-   **Landscaping:**${landscapingKeywords || ' Use landscaping that complements the style.'}${userPromptKeywords}

The final result should be a single, stunningly realistic image that looks like a ${baseKeywords}.`;


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
