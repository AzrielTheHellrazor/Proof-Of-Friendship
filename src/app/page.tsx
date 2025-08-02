'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, Trophy, Heart, Plus } from 'lucide-react';
import { useAccount } from 'wagmi';
import Link from 'next/link';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Custom Components
import EventsList from '@/components/EventsList';
import FriendshipStats from '@/components/FriendshipStats';
import WalletConnect from '@/components/WalletConnect';
import { CONTRACTS } from '@/lib/contracts';

// Remove mock data - using real contract data now



export default function Home() {
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("events");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-2xl font-semibold">Proof of Friendship</h2>
          <p className="text-muted-foreground">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Proof of Friendship</h1>
              <p className="text-xs text-muted-foreground">On {CONTRACTS.NETWORK.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected && (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
            )}
            <ThemeToggle />
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mb-8">
              <Heart className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Create Your{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Friendship Memories
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your social experiences into unique NFTs and earn friendship points. 
              Connect, create, and collect memories that strengthen your bonds forever.
            </p>

            <div className="flex justify-center gap-4">
              <Link href="/create">
                <Button size="lg" className="text-lg px-8">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Event
                </Button>
              </Link>
              {isConnected && (
                <Button variant="outline" size="lg" onClick={() => setActiveTab("stats")}>
                  <Users className="mr-2 h-5 w-5" />
                  View Stats
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              My Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-8">
            <EventsList />
          </TabsContent>

          <TabsContent value="stats" className="mt-8">
            <FriendshipStats />
          </TabsContent>
        </Tabs>

        {/* How It Works Section */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple steps to create lasting friendship memories on the blockchain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Create Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create a new friendship event with name, description, and image. Each event gets its own ERC1155 NFT contract.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Mint NFTs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mint NFTs from events to show participation. Each user can mint only 1 NFT per event token to keep it special.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Earn Points</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earn +{CONTRACTS.POINTS_PER_INTERACTION} friendship points with each friend who already minted the same NFT. Build lasting connections!
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

      </main>
    </div>
  );
}