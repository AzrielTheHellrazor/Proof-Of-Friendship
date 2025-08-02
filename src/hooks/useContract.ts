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

// Check if user has minted the event NFT
export function useHasUserMintedNFT(eventNFTAddress?: string, userAddress?: string) {
  const { address, abi, isSupported } = useProofOfFriendshipRouter()
  
  return useReadContract({
    address,
    abi,
    functionName: 'hasUserMintedNFT',
    args: eventNFTAddress && userAddress
      ? [eventNFTAddress as ContractAddress, BigInt(1), userAddress as ContractAddress]
      : undefined,
    query: {
      enabled: isSupported && !!address && !!eventNFTAddress && !!userAddress,
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

// Mint event NFT and earn friendship points
export function useMintNFT() {
  const { address, abi, isSupported } = useProofOfFriendshipRouter()
  const { data, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: data })

  const mint = (eventNFTAddress: string) => {
    if (!isSupported || !address) {
      console.warn('Contract not available on this network')
      return
    }
    
    writeContract({
      address,
      abi,
      functionName: 'mint',
      args: [eventNFTAddress as ContractAddress],
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

// Get event token info from EventNFT
export function useGetEventTokenInfo(eventNFTAddress?: string) {
  const { address, abi } = useEventNFTContract(eventNFTAddress || '')
  
  return useReadContract({
    address,
    abi,
    functionName: 'getEventTokenInfo',
    query: {
      enabled: !!eventNFTAddress,
    },
  })
}

// Get event token ID from an EventNFT
export function useGetEventTokenId(eventNFTAddress?: string) {
  const { address, abi } = useEventNFTContract(eventNFTAddress || '')
  
  return useReadContract({
    address,
    abi,
    functionName: 'getEventTokenId',
    query: {
      enabled: !!eventNFTAddress,
    },
  })
}

// Check if user holds the event token
export function useHoldsEventToken(eventNFTAddress?: string, userAddress?: string) {
  const { address, abi } = useEventNFTContract(eventNFTAddress || '')
  
  return useReadContract({
    address,
    abi,
    functionName: 'holdsEventToken',
    args: userAddress ? [userAddress as ContractAddress] : undefined,
    query: {
      enabled: !!eventNFTAddress && !!userAddress,
    },
  })
}

// Create event token in EventNFT (only for event creator)
export function useCreateEventToken(eventNFTAddress: string) {
  const { address, abi } = useEventNFTContract(eventNFTAddress)
  const { data, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: data })

  const createEventToken = (maxSupply: number, uri: string, description: string, whitelistEnabled: boolean = false) => {
    writeContract({
      address,
      abi,
      functionName: 'createEventToken',
      args: [BigInt(maxSupply), uri, description, whitelistEnabled],
    })
  }

  return {
    createEventToken,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash: data,
  }
}

// ========== WHITELIST MANAGEMENT HOOKS ==========

// Check if user is whitelisted for the event
export function useIsUserWhitelisted(eventNFTAddress?: string, userAddress?: string) {
  const { address, abi } = useEventNFTContract(eventNFTAddress || '')
  
  return useReadContract({
    address,
    abi,
    functionName: 'isUserWhitelisted',
    args: userAddress ? [userAddress as ContractAddress] : undefined,
    query: {
      enabled: !!eventNFTAddress && !!userAddress,
    },
  })
}

// Check if user can mint the event token (considering whitelist)
export function useCanUserMintEvent(eventNFTAddress?: string, userAddress?: string) {
  const { address, abi } = useEventNFTContract(eventNFTAddress || '')
  
  return useReadContract({
    address,
    abi,
    functionName: 'canUserMintEvent',
    args: userAddress ? [userAddress as ContractAddress] : undefined,
    query: {
      enabled: !!eventNFTAddress && !!userAddress,
    },
  })
}

// Add addresses to whitelist (convenience function through router)
export function useAddToWhitelist() {
  const { address, abi, isSupported } = useProofOfFriendshipRouter()
  const { data, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: data })

  const addToWhitelist = (eventNFTAddress: string, addresses: string[]) => {
    if (!isSupported || !address) {
      console.warn('Contract not available on this network')
      return
    }
    
    writeContract({
      address,
      abi,
      functionName: 'addToWhitelist',
      args: [eventNFTAddress as ContractAddress, addresses as ContractAddress[]],
    })
  }

  return {
    addToWhitelist,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash: data,
  }
}

// Remove addresses from whitelist (convenience function through router)
export function useRemoveFromWhitelist() {
  const { address, abi, isSupported } = useProofOfFriendshipRouter()
  const { data, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: data })

  const removeFromWhitelist = (eventNFTAddress: string, addresses: string[]) => {
    if (!isSupported || !address) {
      console.warn('Contract not available on this network')
      return
    }
    
    writeContract({
      address,
      abi,
      functionName: 'removeFromWhitelist',
      args: [eventNFTAddress as ContractAddress, addresses as ContractAddress[]],
    })
  }

  return {
    removeFromWhitelist,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash: data,
  }
}

// Set whitelist enabled status (convenience function through router)
export function useSetWhitelistEnabled() {
  const { address, abi, isSupported } = useProofOfFriendshipRouter()
  const { data, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: data })

  const setWhitelistEnabled = (eventNFTAddress: string, enabled: boolean) => {
    if (!isSupported || !address) {
      console.warn('Contract not available on this network')
      return
    }
    
    writeContract({
      address,
      abi,
      functionName: 'setWhitelistEnabled',
      args: [eventNFTAddress as ContractAddress, enabled],
    })
  }

  return {
    setWhitelistEnabled,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash: data,
  }
}

// Direct EventNFT contract whitelist functions (for event creators)
export function useEventNFTAddToWhitelist(eventNFTAddress: string) {
  const { address, abi } = useEventNFTContract(eventNFTAddress)
  const { data, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: data })

  const addToWhitelist = (addresses: string[]) => {
    writeContract({
      address,
      abi,
      functionName: 'addToWhitelist',
      args: [addresses as ContractAddress[]],
    })
  }

  return {
    addToWhitelist,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash: data,
  }
}

export function useEventNFTRemoveFromWhitelist(eventNFTAddress: string) {
  const { address, abi } = useEventNFTContract(eventNFTAddress)
  const { data, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: data })

  const removeFromWhitelist = (addresses: string[]) => {
    writeContract({
      address,
      abi,
      functionName: 'removeFromWhitelist',
      args: [addresses as ContractAddress[]],
    })
  }

  return {
    removeFromWhitelist,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash: data,
  }
}

export function useEventNFTSetWhitelistEnabled(eventNFTAddress: string) {
  const { address, abi } = useEventNFTContract(eventNFTAddress)
  const { data, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: data })

  const setWhitelistEnabled = (enabled: boolean) => {
    writeContract({
      address,
      abi,
      functionName: 'setWhitelistEnabled',
      args: [enabled],
    })
  }

  return {
    setWhitelistEnabled,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash: data,
  }
} 