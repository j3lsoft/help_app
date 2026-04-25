/**
 * Converts a Data URL (Base64) to a File object.
 * Useful for handling images selected from a picker before uploading.
 *
 * @param dataUrl The data URL string
 * @param filename The desired filename
 * @returns A Promise resolving to a File object
 */
export async function dataUrlToFile(
  dataUrl: string,
  filename: string
): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}
