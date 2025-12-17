/**
 * Calculates a SHA-256 hash of a file's contents
 * @param file The file to calculate the hash for
 * @returns A promise that resolves to the hex string of the hash
 */
export const calculateFileHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}; 