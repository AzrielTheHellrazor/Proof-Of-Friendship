'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { Calendar, Users, MapPin, Heart, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetAllEventNFTs, useGetEventMetadata, useGetNFTHolders } from '@/hooks/useContract'
import { CONTRACTS } from '@/lib/contracts'
import { processImageUrl, handleImageError } from '@/lib/image-utils'

interface EventCardProps {
  eventAddress: string
  index: number
}

function EventCard({ eventAddress, index }: EventCardProps) {
  const { data: metadata, isLoading: metadataLoading } = useGetEventMetadata(eventAddress)
  const { data: holders, isLoading: holdersLoading } = useGetNFTHolders(eventAddress, 1) // Assuming tokenId 1 for main event NFT
  const { address } = useAccount()

  if (metadataLoading) {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300">
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Skeleton className="h-full w-full" />
        </div>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metadata || !metadata.exists) {
    return null
  }

  const holdersCount = holders?.length || 0
  const createdDate = new Date(Number(metadata.createdAt) * 1000).toLocaleDateString()

  const imageUrl = processImageUrl(metadata.imageURI)

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        <Image
          src={imageUrl}
          alt={metadata.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="backdrop-blur-sm bg-white/80">
            <Heart className="w-3 h-3 mr-1" />
            {holdersCount}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="line-clamp-1">{metadata.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {metadata.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            Created {createdDate}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-2" />
            {holdersCount} friends joined
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Link href={`/events/${eventAddress}`}>
              <Button size="sm" className="gap-2">
                <span>View Event</span>
              </Button>
            </Link>
            
            <Badge variant="outline" className="text-xs">
              #{index + 1}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function EventsList() {
  const { data: eventAddresses, isLoading, error } = useGetAllEventNFTs()
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <Users className="w-16 h-16 mx-auto text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground mb-4">
          Connect your wallet to view and participate in friendship events
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="group hover:shadow-lg transition-all duration-300">
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <Heart className="w-16 h-16 mx-auto text-red-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Error Loading Events</h3>
        <p className="text-muted-foreground mb-4">
          {error.message || 'Failed to load events. Please try again.'}
        </p>
      </div>
    )
  }

  if (!eventAddresses || eventAddresses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <Calendar className="w-16 h-16 mx-auto text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
        <p className="text-muted-foreground mb-4">
          Be the first to create a friendship event!
        </p>
        <Link href="/create">
          <Button>Create Event</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Friendship Events</h2>
          <p className="text-muted-foreground">
            {eventAddresses.length} event{eventAddresses.length !== 1 ? 's' : ''} on {CONTRACTS.NETWORK.name}
          </p>
        </div>
        <Link href="/create">
          <Button>Create Event</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventAddresses.map((eventAddress, index) => (
          <EventCard
            key={eventAddress}
            eventAddress={eventAddress}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}