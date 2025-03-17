import crypto from 'crypto';

/**
 * Generates a secure token for email unsubscribe links
 * @param email The user's email
 * @returns A secure token
 */
function generateUnsubscribeToken(email: string): string {
  // Use a secret key from environment variables
  const secret = process.env.EMAIL_SECRET || 'default-secret-change-me';
  
  // Create an HMAC using the secret and the email
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(email);
  
  // Return the digest as a hex string
  return hmac.digest('hex');
}

/**
 * Verifies an unsubscribe token
 * @param email The user's email
 * @param token The token to verify
 * @returns Whether the token is valid
 */
function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expectedToken = generateUnsubscribeToken(email);
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  );
}

/**
 * Generates an unsubscribe URL for a user
 * @param email The user's email
 * @returns The full unsubscribe URL
 */
function generateUnsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email);
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  // Create the URL with email and token as query parameters
  const url = new URL(`${baseUrl}/api/user/unsubscribe`);
  url.searchParams.append('email', email);
  url.searchParams.append('token', token);
  
  return url.toString();
}

// Export functions for CommonJS compatibility
module.exports = {
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
  generateUnsubscribeUrl
}; 