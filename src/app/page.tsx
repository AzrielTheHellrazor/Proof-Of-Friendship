'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Users, Calendar, Trophy, AlertCircle, Wallet, ArrowRight, Star, Zap, Globe, Shield, Rocket, Gift, Crown } from 'lucide-react';
import { useAccount, useConnect } from 'wagmi';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, StatsCard } from '@/components/ui/card';
import { showToast } from '@/components/ui/toast';
import { EventCardSkeleton, StatsCardSkeleton, LoadingGrid } from '@/components/ui/loading-skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useGetAllEvents, useCountEventsAttended } from '@/hooks/useContract';
import Link from 'next/link';

// Mock events for testing (replace with contract data)
const mockEvents = [
  {
    id: 0,
    name: "Summer BBQ Party",
    description: "A fun summer barbecue with friends and family",
    imageURI: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    totalMinted: 12,
    date: "2024-07-15"
  },
  {
    id: 1,
    name: "Game Night",
    description: "Board games and pizza night with the crew",
    imageURI: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
    totalMinted: 8,
    date: "2024-07-20"
  },
  {
    id: 2,
    name: "Beach Day",
    description: "Sun, sand, and waves with close friends",
    imageURI: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
    totalMinted: 15,
    date: "2024-07-25"
  }
];

// Enhanced features data with vibrant icons
const features = [
  {
    icon: <Shield className="w-8 h-8 text-purple-600" />,
    title: "Blockchain Secured",
    description: "Your memories are permanently stored on the blockchain",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
  },
  {
    icon: <Zap className="w-8 h-8 text-blue-600" />,
    title: "Instant Minting",
    description: "Mint your NFTs instantly with a single click",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30"
  },
  {
    icon: <Globe className="w-8 h-8 text-green-600" />,
    title: "Social Proof",
    description: "Show the world your amazing social experiences",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30"
  }
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { data: eventsData } = useGetAllEvents();
  const { data: userEventCount } = useCountEventsAttended(address);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Intersection observers for animations
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: statsRef, inView: statsInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: eventsRef, inView: eventsInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: featuresRef, inView: featuresInView } = useInView({ threshold: 0.1, triggerOnce: true });

  // Use mock data for now, replace with contract data when deployed
  const events = mockEvents;
  const isContractDeployed = false; // Set to true when contract is deployed

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isConnected && !showWelcome) {
      setShowWelcome(true);
      showToast.success(
        "Wallet Connected! 🎉",
        "You can now mint NFTs and store your event memories on the blockchain."
      );
    }
  }, [isConnected, showWelcome]);

  const handleConnectWallet = async () => {
    try {
      if (connectors.length > 0) {
        await connect({ connector: connectors[0] });
        showToast.info("Connecting Wallet...", "Please approve the transaction in your wallet app.");
      }
    } catch (error) {
      showToast.error("Connection Failed", "Failed to connect wallet. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        {/* Header Skeleton */}
        <header className="glass border-b border-white/20 dark:border-gray-700 sticky top-0 z-50">
          <div className="container-modern py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl animate-pulse" />
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
              <div className="h-11 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          </div>
        </header>

        <main className="container-modern section-padding">
          {/* Hero Skeleton */}
          <section className="text-center py-16 mb-16">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="h-16 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto animate-pulse" />
              <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse" />
              <div className="h-14 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto animate-pulse" />
            </div>
          </section>

          {/* Stats Skeleton */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          </section>

          {/* Events Skeleton */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
            <LoadingGrid count={6} />
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Modern Header */}
      <header className="glass border-b border-white/20 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container-modern py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg animate-glow neon-glow">
                <span className="text-white text-2xl animate-bounce-gentle">🫂</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text-animate">Proof of Friendship</h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <ThemeToggle />
              
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg neon-glow-blue">
                    ✅ Connected
                  </div>
                  <div className="glass bg-white/10 dark:bg-gray-800/10 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-mono border border-white/20 dark:border-gray-600">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  variant="modern"
                  size="lg"
                  className="neon-glow"
                >
                  {isConnecting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-5 h-5" />
                      <span>Connect Wallet</span>
                    </div>
                  )}
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container-modern">
        {/* Enhanced Hero Section */}
        <section ref={heroRef} className="section-padding text-center relative">
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${6 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto relative z-10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={heroInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-glow neon-glow">
                <Rocket className="w-12 h-12 text-white animate-bounce-gentle" />
              </div>
            </motion.div>

            <h2 className="text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-shadow-vibrant leading-tight">
              Mint Your
              <span className="text-gradient-rainbow block animate-pulse-slow">Friendship Memories</span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
              Create unique NFTs as proof of attending social events with friends. 
              Each event becomes a permanent memory on the blockchain.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isConnected ? (
                <Button 
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  variant="modern"
                  size="xl"
                  className="group neon-glow"
                >
                  {isConnecting ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-6 h-6 transition-transform group-hover:scale-110" />
                      <span>Get Started</span>
                      <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="glass-vibrant bg-white/10 dark:bg-gray-800/10 p-6 text-center neon-glow-pink"
                >
                  <div className="text-2xl mb-2 animate-bounce-gentle">🎉</div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Amazing!</h3>
                  <p className="text-gray-600 dark:text-gray-300">Your wallet is connected, you can now mint NFTs</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </section>

        {/* Enhanced Demo Warning */}
        {!isContractDeployed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <Card variant="gradient" className="border-amber-200 dark:border-amber-600 neon-glow-pink">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse-slow">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-1 text-lg">Demo Mode</h3>
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      Smart contract is not deployed yet. This is a demo with mock data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Enhanced User Stats */}
        {isConnected && (
          <motion.section
            ref={statsRef}
            initial={{ opacity: 0, y: 40 }}
            animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                icon={<Trophy className="w-7 h-7 text-purple-600" />}
                title="Events Attended"
                value={userEventCount?.toString() || '0'}
                description="Total events you've joined"
                trend={{ value: 12, isPositive: true }}
              />
              
              <StatsCard
                icon={<Users className="w-7 h-7 text-blue-600" />}
                title="Available Events"
                value={events.length}
                description="Events you can join"
                trend={{ value: 8, isPositive: true }}
              />
              
              <StatsCard
                icon={<Star className="w-7 h-7 text-green-600" />}
                title="Total NFTs"
                value={events.reduce((acc, event) => acc + event.totalMinted, 0)}
                description="NFTs minted so far"
                trend={{ value: 15, isPositive: true }}
              />
            </div>
          </motion.section>
        )}

        {/* Enhanced Features Section */}
        <motion.section
          ref={featuresRef}
          initial={{ opacity: 0, y: 40 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={featuresInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto animate-glow neon-glow">
                <Crown className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why <span className="text-gradient-rainbow">Proof of Friendship?</span>
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Store your friendship memories securely and permanently
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card variant="modern" hover className="text-center h-full neon-glow">
                  <CardContent className="p-8">
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.bgGradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform animate-pulse-slow`}>
                      {feature.icon}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{feature.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Enhanced Events Section */}
        <motion.section
          ref={eventsRef}
          initial={{ opacity: 0, y: 40 }}
          animate={eventsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={eventsInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-4"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto animate-glow neon-glow">
                  <Gift className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Available Events</h3>
              <p className="text-xl text-gray-600 dark:text-gray-300">Mint your friendship memories</p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 dark:border-gray-600">
              {events.length} events available
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={eventsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card variant="modern" hover className="group overflow-hidden neon-glow">
                  <div className="relative">
                    <img 
                      src={event.imageURI} 
                      alt={event.name}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 glass bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {event.totalMinted} minted
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {event.name}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <Link href={`/events/${event.id}`}>
                          <Button 
                            variant="gradient"
                            size="sm"
                            className="group/btn"
                          >
                            <span>View Event</span>
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Enhanced CTA Section */}
        <section className="section-padding">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card variant="gradient" className="text-center overflow-hidden relative neon-glow">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />
              <CardContent className="relative z-10 p-12">
                <div className="max-w-2xl mx-auto">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-6xl mb-6"
                  >
                    🎉
                  </motion.div>
                  <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Ready to start collecting memories?
                  </h3>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    Connect your wallet and begin your journey of friendship NFTs
                  </p>
                  
                  {!isConnected ? (
                    <Button 
                      onClick={handleConnectWallet}
                      disabled={isConnecting}
                      variant="modern"
                      size="xl"
                      className="group neon-glow"
                    >
                      {isConnecting ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Connecting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Wallet className="w-6 h-6 transition-transform group-hover:scale-110" />
                          <span>Connect Wallet</span>
                          <Sparkles className="w-6 h-6 transition-transform group-hover:rotate-12" />
                        </div>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-6">
                      <div className="glass-vibrant bg-emerald-500/20 dark:bg-emerald-500/10 p-6 backdrop-blur-sm neon-glow-blue">
                        <div className="flex items-center justify-center space-x-3 text-emerald-800 dark:text-emerald-200">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            ✅
                          </motion.div>
                          <span className="font-bold text-lg">Wallet Connected!</span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        Browse the events above to start minting your friendship memories
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
