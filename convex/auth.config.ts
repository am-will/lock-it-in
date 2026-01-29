/**
 * Convex Auth Configuration
 * Integrates with Clerk for JWT-based authentication
 * 
 * Required environment variables:
 * - CLERK_JWT_ISSUER_DOMAIN (e.g., "https://clerk.your-app.com" or "https://account.clerk.dev")
 * - CLERK_JWT_TEMPLATE_NAME=convex
 */

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
