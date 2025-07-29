import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import contractAbi from '@/lib/contract-abi.json'

// Contract address - you'll need to deploy and update this
// For now, using a placeholder address
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as const

export function useProofOfFriendshipContract() {
  return {
    address: CONTRACT_ADDRESS,
    abi: contractAbi as any,
  }
}

export function useGetAllEvents() {
  const { address, abi } = useProofOfFriendshipContract()
  
  return useReadContract({
    address,
    abi,
    functionName: 'getAllEvents',
    query: {
      enabled: address !== '0x0000000000000000000000000000000000000000',
    },
  })
}

export function useGetEvent(eventId: number) {
  const { address, abi } = useProofOfFriendshipContract()
  
  return useReadContract({
    address,
    abi,
    functionName: 'getEvent',
    args: [BigInt(eventId)],
    query: {
      enabled: eventId >= 0 && address !== '0x0000000000000000000000000000000000000000',
    },
  })
}

export function useMintForEvent() {
  const { address, abi } = useProofOfFriendshipContract()
  
  const { data, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  })

  const mintForEvent = (eventId: number) => {
    if (address === '0x0000000000000000000000000000000000000000') {
      console.warn('Contract not deployed yet')
      return
    }
    
    writeContract({
      address,
      abi,
      functionName: 'mintForEvent',
      args: [BigInt(eventId)],
    })
  }

  return {
    mintForEvent,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash: data,
  }
}

export function useCountEventsAttended(userAddress?: string) {
  const { address, abi } = useProofOfFriendshipContract()
  
  return useReadContract({
    address,
    abi,
    functionName: 'countEventsAttended',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && address !== '0x0000000000000000000000000000000000000000',
    },
  })
}

export function useHasUserMintedForEvent(userAddress?: string, eventId?: number) {
  const { address, abi } = useProofOfFriendshipContract()
  
  return useReadContract({
    address,
    abi,
    functionName: 'hasUserMintedForEvent',
    args: userAddress && eventId !== undefined 
      ? [userAddress as `0x${string}`, BigInt(eventId)] 
      : undefined,
    query: {
      enabled: !!userAddress && eventId !== undefined && address !== '0x0000000000000000000000000000000000000000',
    },
  })
} 