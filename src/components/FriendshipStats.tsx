'use client'

import { useState, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { Heart, Users, Trophy, TrendingUp, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetFriendshipPoints, useGetAllEventNFTs, useHasUserMintedNFT } from '@/hooks/useContract'
import { CONTRACTS } from '@/lib/contracts'

interface FriendshipCheckProps {
  userAddress: string
}

function FriendshipCheck({ userAddress }: FriendshipCheckProps) {
  const [friendAddress, setFriendAddress] = useState('')
  const { address } = useAccount()
  
  const { data: points, isLoading } = useGetFriendshipPoints(
    address,
    friendAddress && friendAddress !== address ? friendAddress : undefined
  )

  const isValidAddress = friendAddress.startsWith('0x') && friendAddress.length === 42

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Check Friendship Points
        </CardTitle>
        <CardDescription>
          Enter a friend&apos;s wallet address to see your friendship score
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="friend-address">Friend&apos;s Wallet Address</Label>
          <Input
            id="friend-address"
            value={friendAddress}
            onChange={(e) => setFriendAddress(e.target.value)}
            placeholder="0x..."
            className="font-mono text-sm"
          />
        </div>
        
        {friendAddress && friendAddress === address && (
          <p className="text-sm text-amber-600">
            That&apos;s your own address! Enter a friend&apos;s address instead.
          </p>
        )}
        
        {isValidAddress && friendAddress !== address && (
          <div className="pt-4 border-t">
            {isLoading ? (
              <div className="text-center">
                <Skeleton className="h-12 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {points?.toString() || '0'}
                </div>
                <p className="text-sm text-muted-foreground">
                  Friendship Points
                </p>
                {points && points > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    <Star className="w-3 h-3 mr-1" />
                    {points >= 25 ? 'Best Friends' : points >= 10 ? 'Good Friends' : 'Friends'}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <p className="font-semibold mb-1">How it works:</p>
          <p>You earn {CONTRACTS.POINTS_PER_INTERACTION} friendship points each time you and a friend mint NFTs from the same event!</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface UserStatsProps {
  userAddress: string
}

function UserStats({ userAddress }: UserStatsProps) {
  const { data: eventAddresses, isLoading: eventsLoading } = useGetAllEventNFTs()
  
  // Calculate user's participation stats
  const participationStats = useMemo(() => {
    if (!eventAddresses || eventsLoading) return null
    
    // For now, we'll show basic stats
    // In a real app, you'd query each event to see if user participated
    return {
      totalEvents: eventAddresses.length,
      participatedEvents: 0, // Would need to check each event
      friendsMade: 0, // Would need to aggregate friendship points
    }
  }, [eventAddresses, eventsLoading])

  if (eventsLoading || !participationStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Skeleton className="h-8 w-8 mx-auto rounded" />
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Events',
      value: participationStats.totalEvents,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Events Joined',
      value: participationStats.participatedEvents,
      icon: Trophy,
      color: 'text-green-600'
    },
    {
      title: 'Friends Made',
      value: participationStats.friendsMade,
      icon: Heart,
      color: 'text-red-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <stat.icon className={`w-8 h-8 mx-auto ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function FriendshipStats() {
  const { address, isConnected } = useAccount()

  if (!isConnected || !address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Connect your wallet to view your friendship stats
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Friendship Journey</h2>
        <p className="text-muted-foreground">
          Track your connections and see how your friendships grow through shared experiences
        </p>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">My Stats</TabsTrigger>
          <TabsTrigger value="check">Check Points</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="space-y-6">
          <UserStats userAddress={address} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Friendship Level
              </CardTitle>
              <CardDescription>
                Keep participating in events to level up your friendship status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Friendship Explorer</span>
                  <span>0 / 10 points</span>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Participate in events and mint NFTs with friends to earn points and unlock new levels!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="check">
          <FriendshipCheck userAddress={address} />
        </TabsContent>
      </Tabs>
    </div>
  )
}