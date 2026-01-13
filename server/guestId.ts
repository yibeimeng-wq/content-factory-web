import { createHash } from "crypto";

/**
 * Generate a consistent guest ID from browser fingerprint data
 * Uses negative numbers to distinguish from real user IDs
 */
export function generateGuestId(fingerprint: string): number {
  // Create a hash of the fingerprint
  const hash = createHash("sha256").update(fingerprint).digest("hex");
  
  // Convert first 8 characters of hash to a number
  const hashNumber = parseInt(hash.substring(0, 8), 16);
  
  // Return as negative number to distinguish from real user IDs
  // Use modulo to keep it within reasonable range
  return -(hashNumber % 2147483647);
}

/**
 * Create a simple browser fingerprint from request headers
 */
export function createBrowserFingerprint(
  userAgent: string,
  acceptLanguage: string = "",
  ip: string = ""
): string {
  // Combine multiple factors for fingerprinting
  return `${userAgent}|${acceptLanguage}|${ip}`;
}
