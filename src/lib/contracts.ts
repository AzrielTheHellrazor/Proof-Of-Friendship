// Proof of Friendship Contract Configuration
export const CONTRACTS = {
  // Main Router Contract (Base Mainnet)
  ROUTER: {
    address: '0x869B768E940A0DB225559188c9C475F387174d63' as const,
    chainId: 8453, // Base Mainnet
    network: 'base',
    blockExplorer: 'https://basescan.org'
  },
  
  // Constants
  POINTS_PER_INTERACTION: 5,
  
  // Network Info
  NETWORK: {
    name: 'Base',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'https://mainnet.base.org',
    chainId: 8453
  }
} as const

// Contract addresses by chain ID
export const CONTRACT_ADDRESSES = {
  8453: CONTRACTS.ROUTER.address, // Base Mainnet
  84532: CONTRACTS.ROUTER.address, // Base Sepolia (if deployed)
} as const

export function getContractAddress(chainId: number): `0x${string}` | undefined {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
}

export function isChainSupported(chainId: number): boolean {
  return chainId in CONTRACT_ADDRESSES
}

// Event interface for frontend
export interface Event {
  address: string
  name: string
  description: string
  imageURI: string
  creator: string
  createdAt: number
  exists: boolean
}

// EventNFT Token interface
export interface EventToken {
  tokenId: number
  creator: string
  maxSupply: number
  currentSupply: number
  uri: string
  description: string
  exists: boolean
}

// Friendship data interface
export interface FriendshipData {
  userA: string
  userB: string
  points: number
  sharedEvents: string[]
}

export type ContractAddress = `0x${string}`