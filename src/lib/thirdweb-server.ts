/**
 * Server-side Thirdweb client configuration
 * 
 * This file should only be used in server-side code (API routes, server actions, etc.)
 * DO NOT import this in client-side components!
 */

import { createThirdwebClient } from "thirdweb";

// Server-side client with both clientId and secretKey
export const serverClient = createThirdwebClient({
  // use clientId for client side usage
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
  // use secretKey for server side usage (never expose in browser)
  secretKey: process.env.THIRDWEB_SECRET_KEY!, 
});

// Client-side only version (same as used in components)
export const clientSideClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!
});

/**
 * Usage examples:
 * 
 * Client-side (components):
 * - IPFS uploads
 * - Reading blockchain data
 * - Wallet connections
 * 
 * Server-side (API routes):
 * - Minting NFTs
 * - Contract deployments
 * - Private key operations
 * - Administrative functions
 */