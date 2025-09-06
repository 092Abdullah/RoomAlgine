
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
 * It's designed to work with URLs that may or may not have a version number.
 * @param url The Cloudinary image URL.
 * @returns The public ID of the image, including the folder path.
 */
function getPublicIdFromUrl(url: string): string {
    // Example URL: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<public_id>.<format>
    // The part we want is `<folder>/<public_id>`
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^/]+$/);
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

/**
 * Re-uploads an existing Cloudinary image to a new folder, creating a separate copy.
 * @param sourceUrl The URL of the existing image to copy.
 * @param targetFolder The new folder to upload the copy to.
 * @returns The URL of the newly created image copy.
 */
export async function copyCloudinaryImage(sourceUrl: string, targetFolder: string): Promise<string> {
  try {
    // Re-uploading from the source URL is Cloudinary's method for "copying"
    const result = await cloudinary.uploader.upload(sourceUrl, {
      folder: targetFolder,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Cloudinary Copy Error (from ${sourceUrl} to ${targetFolder}):`, error);
    throw new Error('Failed to copy image for publishing.');
  }
}
