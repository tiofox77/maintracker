/**
 * Extracts the filename from a file URL
 * @param url The URL of the file
 * @returns The filename
 */
export function getFilenameFromUrl(url: string): string {
  if (!url) return "";

  try {
    // For API file URLs
    if (url.includes("/api/files/")) {
      const parts = url.split("/");
      return parts[parts.length - 1];
    }

    // For regular URLs
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.substring(pathname.lastIndexOf("/") + 1);
  } catch (error) {
    console.error("Error extracting filename from URL:", error);
    return url.substring(url.lastIndexOf("/") + 1);
  }
}

/**
 * Converts a file to a base64 string
 * @param file The file to convert
 * @returns Promise that resolves to the base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
