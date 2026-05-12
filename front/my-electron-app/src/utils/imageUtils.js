/**
 * Standardized function to get the full image URL/Source for a product.
 * Handles:
 * 1. Missing images (returns placeholder)
 * 2. Absolute URLs (http/https)
 * 3. Data URIs (base64)
 * 4. Relative paths (appends backend URL)
 * 5. JSON arrays of images (returns first image or all images)
 *
 * @param {string} imagePath - The image path or string from the database
 * @param {boolean} returnAll - If true, returns array of all images; if false, returns first image
 * @returns {string|string[]} The usable src string(s) for an <img> tag
 */
// Inline SVG placeholder used when an image is missing or fails to
// load. Keeping it inline avoids an extra network round-trip to a
// third-party (placehold.co) on every empty card.
export const PRODUCT_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='xMidYMid slice'><rect width='400' height='300' fill='%2318181b'/><g fill='%2352525b' font-family='Inter,Arial,sans-serif' text-anchor='middle' font-weight='700'><text x='200' y='160' font-size='18' letter-spacing='4'>NO IMAGE</text><text x='200' y='190' font-size='12' letter-spacing='2' fill='%2371717a'>CHUST EXPRESS</text></g></svg>";

export function getProductImage(imagePath, returnAll = false) {
  // 1. Handle null/undefined/empty
  if (!imagePath) {
    return returnAll ? [PRODUCT_IMAGE_PLACEHOLDER] : PRODUCT_IMAGE_PLACEHOLDER;
  }

  let images = [];

  // 2. Accept arrays directly, JSON arrays, or string values
  if (Array.isArray(imagePath)) {
    images = imagePath.filter(img => img && String(img).trim()).map(String);
  } else {
    try {
      const parsed = JSON.parse(imagePath);
      if (Array.isArray(parsed)) {
        images = parsed.filter(img => img && String(img).trim()).map(String);
      } else if (typeof parsed === 'string') {
        images = [parsed.trim()];
      } else {
        images = [String(imagePath).trim()];
      }
    } catch (e) {
      // Not JSON, treat as single image
      images = [String(imagePath).trim()];
    }
  }

  // 3. Process each image URL
  const processedImages = images.map(img => {
    const normalized = String(img || "").trim();
    if (!normalized) return null;

    // Handle Base64 Data URIs
    if (normalized.startsWith("data:")) {
      return normalized;
    }

    // Handle absolute URLs
    if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
      return normalized;
    }

    // If it's a non-URL value, we treat it as missing and avoid broken image
    // (e.g. legacy strings like "satellite" as placeholder text)
    if (!normalized.includes(".")) {
      return PRODUCT_IMAGE_PLACEHOLDER;
    }

    const envUrl = import.meta.env.VITE_API_URL;
    let API_BASE_URL = envUrl ? (envUrl.endsWith('/api') ? envUrl.slice(0, -4) : envUrl) : "http://localhost:5000";
    if (API_BASE_URL === "") API_BASE_URL = "http://localhost:5000";

    // Ensure we don't end up with double slashes if img starts with /
    const cleanPath = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${API_BASE_URL}${cleanPath}`;
  });

  // 4. Return all images or just the first one
  if (returnAll) {
    return processedImages.length > 0 ? processedImages : [PRODUCT_IMAGE_PLACEHOLDER];
  } else {
    return processedImages.length > 0 ? processedImages[0] : PRODUCT_IMAGE_PLACEHOLDER;
  }
}

/**
 * Get the first product image (backward compatibility)
 * @param {string} imagePath - The image path or string from the database
 * @returns {string} The first usable image src
 */
export function getFirstProductImage(imagePath) {
  return getProductImage(imagePath, false);
}

/**
 * Get all product images
 * @param {string} imagePath - The image path or string from the database
 * @returns {string[]} Array of all usable image sources
 */
export function getAllProductImages(imagePath) {
  return getProductImage(imagePath, true);
}
