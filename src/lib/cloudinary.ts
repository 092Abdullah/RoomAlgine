
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(
  fileDataUri: string,
  folder: string
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(fileDataUri, {
      folder: folder,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Failed to upload image.');
  }
}


/**
 * Extracts the public ID from a Cloudinary URL.
 * @param url The Cloudinary image URL.
 * @returns The public ID of the image.
 */
function getPublicIdFromUrl(url: string): string {
    // Example URL: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<public_id>.<format>
    const regex = /\/([^/]+)\.([^/]+)$/;
    const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    if (!match || !match[1]) {
        throw new Error('Could not parse public ID from Cloudinary URL.');
    }
    return match[1];
}

/**
 * Deletes an image from Cloudinary using its URL.
 * @param imageUrl The URL of the image to delete.
 * @returns A promise that resolves when the image is deleted.
 */
export async function deleteFromCloudinary(imageUrl: string): Promise<void> {
    try {
        const publicId = getPublicIdFromUrl(imageUrl);
        await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image',
        });
    } catch (error) {
        console.error('Cloudinary Deletion Error:', error);
        // We throw the error so it can be handled by the calling action
        throw new Error('Failed to delete image from Cloudinary.');
    }
}
