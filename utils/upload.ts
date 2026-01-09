import { UPLOAD_IMAGES_API_URL } from "@/types/product";

/**
 * Uploads one or more images to the backend and returns their storage IDs.
 * @param uris Array of local image URIs
 * @returns Array of storage IDs
 */
export async function uploadImages(uris: string[]): Promise<string[]> {
    if (!uris || uris.length === 0) return [];

    const formData = new FormData();

    uris.forEach((uri, index) => {
        // Basic detection of filename and type
        const filename = uri.split('/').pop() || `image_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // In React Native, we append an object with uri, name, and type
        // @ts-ignore - FormData in RN expects this object format
        formData.append('images', {
            uri,
            name: filename,
            type,
        });
    });

    try {
        const response = await fetch(UPLOAD_IMAGES_API_URL, {
            method: "POST",
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (data.success && data.storageIds) {
            return data.storageIds;
        } else {
            throw new Error(data.message || "Upload failed: storageIds not found in response");
        }
    } catch (error) {
        console.error("Image upload error:", error);
        throw error;
    }
}
