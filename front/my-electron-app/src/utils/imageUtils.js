/**
 * Standardized function to get the full image URL/Source for a product.
 * Handles:
 * 1. Missing images (returns placeholder)
 * 2. Absolute URLs (http/https)
 * 3. Data URIs (base64)
 * 4. Relative paths (appends backend URL)
 *
 * @param {string} imagePath - The image path or string from the database
 * @returns {string} The usable src string for an <img> tag
 */
export function getProductImage(imagePath) {
  // 1. Handle null/undefined/empty
  if (!imagePath) {
    return "https://placehold.co/400x300?text=No+Image";
  }

  // 2. Handle absolute URLs (e.g. from external APIs)
  if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
    return imagePath;
  }

  // 3. Handle Base64 Data URIs
  if (imagePath.startsWith("data:")) {
    return imagePath;
  }

  const envUrl = import.meta.env.VITE_API_URL;
  const API_BASE_URL = envUrl ? (envUrl.endsWith('/api') ? envUrl.slice(0, -4) : envUrl) : "https://chust-express-backend.onrender.com";

  // Ensure we don't end up with double slashes if imagePath starts with /
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
}
