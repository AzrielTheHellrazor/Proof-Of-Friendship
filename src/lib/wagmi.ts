import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, base, baseSepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Configure chains & providers with reliable RPC URLs
export const config = createConfig({
  chains: [base, baseSepolia, mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID' }),
  ],
  transports: {
    [base.id]: http('https://base.llamarpc.com'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [mainnet.id]: http('https://ethereum.publicnode.com'),
    [sepolia.id]: http('https://ethereum-sepolia.publicnode.com'),
  },
}) 