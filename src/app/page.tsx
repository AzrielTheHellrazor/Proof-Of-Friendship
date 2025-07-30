'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Users, Calendar, Trophy, Star, Shield, Zap, Globe, Heart, Award, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { useAccount, useConnect } from 'wagmi';
import Link from 'next/link';
import Image from 'next/image';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Separator } from '@/components/ui/separator';
import { showToast } from '@/components/ui/toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Mock events data
const mockEvents = [
  {
    id: 0,
    name: "Summer BBQ Party",
    description: "A fun summer barbecue with friends and family",
    imageURI: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    totalMinted: 12,
    date: "2024-07-15",
    category: "Social"
  },
  {
    id: 1,
    name: "Game Night",
    description: "Board games and pizza night with the crew",
    imageURI: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
    totalMinted: 8,
    date: "2024-07-20",
    category: "Gaming"
  },
  {
    id: 2,
    name: "Beach Day",
    description: "Sun, sand, and waves with close friends",
    imageURI: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
    totalMinted: 15,
    date: "2024-07-25",
    category: "Outdoor"
  }
];

const features = [
  {
    icon: Shield,
    title: "Blockchain Security",
    description: "Your memories are permanently secured on the blockchain with advanced cryptographic protection.",
    color: "bg-blue-500"
  },
  {
    icon: Zap,
    title: "Instant Minting",
    description: "Create your NFTs instantly with our optimized smart contract technology.",
    color: "bg-yellow-500"
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Connect with friends worldwide in our decentralized social ecosystem.",
    color: "bg-green-500"
  },
  {
    icon: Heart,
    title: "Friendship Focus",
    description: "Designed specifically for preserving and celebrating meaningful relationships.",
    color: "bg-red-500"
  },
  {
    icon: Award,
    title: "Digital Collectibles",
    description: "Transform your social moments into valuable digital assets and memories.",
    color: "bg-purple-500"
  },
  {
    icon: Star,
    title: "Premium Experience",
    description: "Enjoy a sophisticated, user-friendly interface designed for modern web3 users.",
    color: "bg-indigo-500"
  }
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const userEventCount = 0; // Mock data
  const events = mockEvents;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isConnected) {
      showToast.success("Wallet Connected!", "You can now create NFTs and store your event memories.");
    }
  }, [isConnected]);

  const handleConnectWallet = async () => {
    try {
      if (connectors.length > 0) {
        await connect({ connector: connectors[0] });
        showToast.info("Connecting...", "Please approve the transaction in your wallet.");
      }
    } catch {
      showToast.error("Connection Failed", "Failed to connect wallet. Please try again.");
    }
  };

  const filteredEvents = activeTab === "all" 
    ? events 
    : events.filter(event => event.category.toLowerCase() === activeTab);

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
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">Proof of Friendship</h1>
          </motion.div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Connected
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </Badge>
              </div>
            ) : (
              <Button onClick={handleConnectWallet} disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mb-8">
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Create Your{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Friendship Memories
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your social experiences into unique NFTs and preserve your friendship moments on the blockchain forever. 
              Connect, create, and collect memories that last a lifetime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                Learn More
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Demo Alert */}
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Mode:</strong> This is a demonstration version. Connect your wallet to experience the full functionality.
          </AlertDescription>
        </Alert>

        {/* User Stats */}
        {isConnected && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Your Statistics</h2>
              <p className="text-muted-foreground">Track your journey on the blockchain</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userEventCount}</div>
                  <p className="text-xs text-muted-foreground">+20% from last month</p>
                  <Progress value={75} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Events</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events.length}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                  <Progress value={60} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total NFTs</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events.reduce((acc, event) => acc + event.totalMinted, 0)}</div>
                  <p className="text-xs text-muted-foreground">+25% from last month</p>
                  <Progress value={85} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </motion.section>
        )}

        {/* Features Section */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Why Choose Proof of Friendship?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of social connections with cutting-edge blockchain technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Events Section */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Available Events</h2>
            <p className="text-muted-foreground">
              Transform your friendship moments into digital collectibles
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="gaming">Gaming</TabsTrigger>
              <TabsTrigger value="outdoor">Outdoor</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <Image 
                          src={event.imageURI} 
                          alt={event.name}
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                        <Badge className="absolute top-2 right-2">
                          {event.totalMinted} minted
                        </Badge>
                      </div>
                      
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{event.name}</CardTitle>
                          <Badge variant="outline">{event.category}</Badge>
                        </div>
                        <CardDescription>{event.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <Button asChild size="sm">
                            <Link href={`/events/${event.id}`}>
                              View Event
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-8">
          <Card className="p-12 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary-foreground" />
              </div>
              
              <h2 className="text-3xl font-bold">Ready to Create Memories?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Join thousands of users who are already preserving their friendship moments on the blockchain
              </p>
              
              {isConnected ? (
                <Alert className="max-w-md mx-auto">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Wallet Connected!</strong> You&apos;re all set to start creating NFTs from your events!
                  </AlertDescription>
                </Alert>
              ) : (
                <Button size="lg" onClick={handleConnectWallet} disabled={isConnecting} className="text-lg px-8">
                  {isConnecting ? (
                    <>
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Start Your Journey
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Heart className="h-4 w-4" />
              </div>
              <span className="font-semibold">Proof of Friendship</span>
            </div>
            <Separator className="w-full max-w-xs" />
            <p className="text-center text-sm text-muted-foreground">
              Preserving friendships on the blockchain. Built with ❤️ for the community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}