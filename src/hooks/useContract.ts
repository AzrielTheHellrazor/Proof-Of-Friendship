import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import routerAbi from '@/lib/router-abi.json'
import eventNftAbi from '@/lib/event-nft-abi.json'
import { getContractAddress, isChainSupported, CONTRACTS, type Event, type EventToken, type ContractAddress } from '@/lib/contracts'

// ========== ROUTER CONTRACT HOOKS ==========

export function useProofOfFriendshipRouter() {
  const chainId = useChainId()
  const address = getContractAddress(chainId)
  
  return {
    address: address as ContractAddress,
    abi: routerAbi,
    isSupported: isChainSupported(chainId),
    chainId,
  }
}

// Get all event NFT contracts
export function useGetAllEventNFTs() {
  const { address, abi, isSupported } = useProofOfFriendshipRouter()
  
  return useReadContract({
    address,
    abi,
    functionName: 'getAllEventNFTs',
    query: {
      enabled: isSupported && !!address,
    },
  })
}

// Get event metadata
export function useGetEventMetadata(eventNFTAddress?: string) {
  const { address, abi, isSupported } = useProofOfFriendshipRouter()
  
  return useReadContract({
    address,
    abi,
    functionName: 'getEventMetadata',
    args: eventNFTAddress ? [eventNFTAddress as ContractAddress] : undefined,
    query: {
      enabled: isSupported && !!address && !!eventNFTAddress,
    },
  })
}

// Get friendship points between two users
export function useGetFriendshipPoints(userA?: string, userB?: string) {
  const { address, abi, isSupported } = useProofOfFriendshipRouter()
  
  return useReadContract({
    address,
    abi,
    functionName: 'getFriendshipPoints',
    args: userA && userB ? [userA as ContractAddress, userB as ContractAddress] : undefined,
    query: {
      enabled: isSupported && !!address && !!userA && !!userB && userA !== userB,
    },
  })
}

// Get NFT holders for a specific token
export function useGetNFTHolders(eventNFTAddress?: string, tokenId?: number) {
  const { address, abi, isSupported } = useProofOfFriendshipRouter()
  
  return useReadContract({
    address,
    abi,
    functionName: 'getNFTHolders',
    args: eventNFTAddress && tokenId !== undefined 
      ? [eventNFTAddress as ContractAddress, BigInt(tokenId)] 
      : undefined,
    query: {
      enabled: isSupported && !!address && !!eventNFTAddress && tokenId !== undefined,
    },
  })
}

// Check if user has minted specific NFT
export function useHasUserMintedNFT(eventNFTAddress?: string, tokenId?: number, userAddress?: string) {
  const { address, abi, isSupported } = useProofOfFriendshipRouter()
  
  return useReadContract({
    address,
    abi,
    functionName: 'hasUserMintedNFT',
    args: eventNFTAddress && tokenId !== undefined && userAddress
      ? [eventNFTAddress as ContractAddress, BigInt(tokenId), userAddress as ContractAddress]
      : undefined,
    query: {
      enabled: isSupported && !!address && !!eventNFTAddress && tokenId !== undefined && !!userAddress,
    },
  })
}

// ========== WRITE FUNCTIONS ==========

// Create new event
export function useCreateEvent() {
  const { address, abi, isSupported } = useProofOfFriendshipRouter()
  const { data, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: data })

  const createEvent = (name: string, description: string, imageURI: string) => {
    if (!isSupported || !address) {
      console.warn('Contract not available on this network')
      return
    }
    
    writeContract({
      address,
      abi,
      functionName: 'createEvent',
      args: [name, description, imageURI],
    })
  }

  return {
    createEvent,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash: data,
  }
}

// Mint NFT and earn friendship points
export function useMintNFT() {
  const { address, abi, isSupported } = useProofOfFriendshipRouter()
  const { data, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: data })

  const mint = (eventNFTAddress: string, tokenId: number) => {
    if (!isSupported || !address) {
      console.warn('Contract not available on this network')
      return
    }
    
    writeContract({
      address,
      abi,
      functionName: 'mint',
      args: [eventNFTAddress as ContractAddress, BigInt(tokenId)],
    })
  }

  return {
    mint,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash: data,
  }
}

// ========== EVENT NFT CONTRACT HOOKS ==========

export function useEventNFTContract(eventNFTAddress: string) {
  return {
    address: eventNFTAddress as ContractAddress,
    abi: eventNftAbi,
  }
}

// Get token info from EventNFT
export function useGetTokenInfo(eventNFTAddress?: string, tokenId?: number) {
  const { address, abi } = useEventNFTContract(eventNFTAddress || '')
  
  return useReadContract({
    address,
    abi,
    functionName: 'getTokenInfo',
    args: tokenId !== undefined ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!eventNFTAddress && tokenId !== undefined,
    },
  })
}

// Get all created tokens from an EventNFT
export function useGetCreatedTokens(eventNFTAddress?: string) {
  const { address, abi } = useEventNFTContract(eventNFTAddress || '')
  
  return useReadContract({
    address,
    abi,
    functionName: 'getCreatedTokens',
    query: {
      enabled: !!eventNFTAddress,
    },
  })
}

// Check if user holds a specific token
export function useHoldsToken(eventNFTAddress?: string, userAddress?: string, tokenId?: number) {
  const { address, abi } = useEventNFTContract(eventNFTAddress || '')
  
  return useReadContract({
    address,
    abi,
    functionName: 'holdsToken',
    args: userAddress && tokenId !== undefined 
      ? [userAddress as ContractAddress, BigInt(tokenId)]
      : undefined,
    query: {
      enabled: !!eventNFTAddress && !!userAddress && tokenId !== undefined,
    },
  })
}

// Create token in EventNFT (only for event creator)
export function useCreateToken(eventNFTAddress: string) {
  const { address, abi } = useEventNFTContract(eventNFTAddress)
  const { data, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: data })

  const createToken = (tokenId: number, maxSupply: number, uri: string, description: string) => {
    writeContract({
      address,
      abi,
      functionName: 'createToken',
      args: [BigInt(tokenId), BigInt(maxSupply), uri, description],
    })
  }

  return {
    createToken,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash: data,
  }
} 