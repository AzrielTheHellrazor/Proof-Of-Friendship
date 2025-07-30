'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Users, Calendar, Trophy, AlertCircle, Wallet, ArrowRight, Star, Zap, Globe, Shield, Rocket, Gift, Crown, Eye, Brain, Cpu } from 'lucide-react';
import { useAccount, useConnect } from 'wagmi';
import { useInView } from 'react-intersection-observer';
import { CardContent } from '@/components/ui/card';
import { ModernCard, MorphingButton, FloatingActionButton } from '@/components/ui/modern-card';
import { FloatingNav, MagneticCursor, ParticleSystem } from '@/components/ui/floating-nav';
import { showToast } from '@/components/ui/toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';
// import { useCountEventsAttended } from '@/hooks/useContract';
import Link from 'next/link';
import Image from 'next/image';

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

// Enhanced features data with modern theme
const features = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Blockchain Security",
    description: "Your memories are permanently secured on the blockchain",
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30",
    iconColor: "text-blue-600",
    glowClass: "neon-glow-blue"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Instant Minting",
    description: "Create your NFTs instantly with a single click",
    gradient: "from-indigo-500 to-purple-500",
    bgGradient: "from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30",
    iconColor: "text-indigo-600",
    glowClass: "neon-glow"
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "AI Enhanced",
    description: "Advanced experience analysis with artificial intelligence",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30",
    iconColor: "text-emerald-600",
    glowClass: "neon-glow-blue"
  },
  {
    icon: <Eye className="w-8 h-8" />,
    title: "Digital Memories",
    description: "Store your friendship moments as digital collectibles",
    gradient: "from-rose-500 to-pink-500",
    bgGradient: "from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30",
    iconColor: "text-rose-600",
    glowClass: "neon-glow-pink"
  },
  {
    icon: <Cpu className="w-8 h-8" />,
    title: "Smart Contracts",
    description: "Powered by secure and efficient smart contracts",
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30",
    iconColor: "text-violet-600",
    glowClass: "cyberpunk-glow"
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Global Network",
    description: "Connect with friends across the decentralized web",
    gradient: "from-teal-500 to-cyan-500",
    bgGradient: "from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30",
    iconColor: "text-teal-600",
    glowClass: "neon-glow-blue"
  }
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  // const { data: userEventCount } = useCountEventsAttended(address);
  const userEventCount = 0; // Mock data for now

  // Enhanced state management
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Scroll-based animations
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.5]);

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
        "You can now create NFTs and store your event memories on the blockchain."
      );
    }
  }, [isConnected, showWelcome]);



  const handleConnectWallet = async () => {
    try {
      if (connectors.length > 0) {
        await connect({ connector: connectors[0] });
        showToast.info("Connecting Wallet...", "Please approve the transaction in your wallet app.");
      }
    } catch {
      showToast.error("Connection Failed", "Failed to connect wallet. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Modern Loading Screen */}
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="text-center space-y-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto"
            >
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </motion.div>
            <motion.h2
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl font-bold text-slate-800 dark:text-slate-200"
            >
              Proof of Friendship
            </motion.h2>
            <motion.p
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-slate-600 dark:text-slate-400 text-xl"
            >
              Loading your experience...
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      
      {/* Modern Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container-modern py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🫂</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Proof of Friendship</h1>
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
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    ✅ Connected
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      {/* Floating Navigation */}
      <FloatingNav />
      
      {/* Magnetic Cursor */}
      <MagneticCursor />
      
      {/* Background Particle System */}
      <ParticleSystem />

      <main className="container-modern relative z-10">
        {/* Futuristic Hero Section with 3D Effects */}
        <section id="home" ref={heroRef} className="section-padding text-center relative perspective-1000">
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto relative z-10 transform-3d"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateY: -30 }}
              animate={heroInView ? { scale: 1, opacity: 1, rotateY: 0 } : { scale: 0.8, opacity: 0, rotateY: -30 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="mb-12"
            >
              <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 neon-glow-blue holographic-gradient pulse-cyber">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-16 h-16 text-white" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-6xl lg:text-7xl font-bold mb-8 leading-tight"
            >
              <span className="text-slate-800 dark:text-slate-200 block">Create Your</span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Friendship Memories</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 mb-16 leading-relaxed max-w-3xl mx-auto"
            >
              Transform your social experiences into <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">unique NFTs</span> and 
              preserve your friendship moments on the blockchain forever
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              {!isConnected ? (
                <button 
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isConnecting ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Rocket className="w-6 h-6 transition-transform group-hover:scale-110" />
                      <span>Get Started</span>
                      <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </button>
              ) : (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl mb-4"
                  >
                    ✅
                  </motion.div>
                  <h3 className="font-bold text-2xl text-slate-800 dark:text-slate-200 mb-2">Wallet Connected!</h3>
                  <p className="text-slate-600 dark:text-slate-400">You can now create NFTs</p>
                </div>
              )}
            </motion.div>

            {/* Holographic data stream effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 1 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-px h-20 bg-gradient-to-b from-cyan-400/50 to-transparent"
                  style={{
                    left: `${10 + i * 10}%`,
                    top: `${20 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    height: [20, 80, 20],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: 2 + i * 0.2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Demo Status */}
        {!isContractDeployed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-1 text-lg">Demo Mode</h3>
                  <p className="text-amber-700 dark:text-amber-300 text-base">
                    Smart contract is not deployed yet. This is a demo running with mock data.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* User Statistics Dashboard */}
        {isConnected && (
          <motion.section
            id="stats"
            ref={statsRef}
            initial={{ opacity: 0, y: 40 }}
            animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4"
              >
                Your Statistics
              </motion.h3>
              <p className="text-slate-600 dark:text-slate-400 text-xl">Real-time blockchain data</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">{userEventCount?.toString() || '0'}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Events Attended</p>
                <div className="mt-4 text-emerald-600 text-sm">
                  ↗ +12% this month
                </div>
              </div>
              
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">{events.length}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Available Events</p>
                <div className="mt-4 text-emerald-600 text-sm">
                  ↗ +8% this month
                </div>
              </div>
              
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">{events.reduce((acc, event) => acc + event.totalMinted, 0)}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Total NFTs</p>
                <div className="mt-4 text-emerald-600 text-sm">
                  ↗ +15% this month
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Modern Features */}
        <motion.section
          id="features"
          ref={featuresRef}
          initial={{ opacity: 0, y: 40 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={featuresInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto">
                <Crown className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-6">
              Why Choose Proof of Friendship?
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Cutting-edge blockchain technology to preserve and celebrate your friendships
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center h-full hover:shadow-lg transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.bgGradient} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <div className={feature.iconColor}>
                      {feature.icon}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                    {feature.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Events Gallery */}
        <motion.section
          id="events"
          ref={eventsRef}
          initial={{ opacity: 0, y: 40 }}
          animate={eventsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={eventsInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto">
                <Gift className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-6">
              Available Events
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Transform your friendship moments into digital collectibles
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-full inline-flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="font-medium">{events.length} events available</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
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
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <Image 
                      src={event.imageURI} 
                      alt={event.name}
                      width={400}
                      height={256}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 rounded-full px-3 py-1">
                      <span className="text-sm font-medium">
                        {event.totalMinted} minted
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                          {event.name}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <Link href={`/events/${event.id}`}>
                          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 group/btn">
                            <div className="flex items-center space-x-2">
                              <span>View Event</span>
                              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                            </div>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Call-to-Action */}
        <section className="section-padding">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-blue-200 dark:border-slate-700 rounded-xl text-center overflow-hidden relative p-16">
              
              <div className="max-w-3xl mx-auto">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-6xl mb-8"
                >
                  🎉
                </motion.div>
                
                <h3 className="text-5xl font-bold text-slate-800 dark:text-slate-200 mb-8">
                  Ready to Create Memories?
                </h3>
                
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
                  Connect your wallet and start creating <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">unique NFTs</span> from 
                  your friendship moments
                </p>
                
                {!isConnected ? (
                  <button 
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group"
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
                  </button>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-8">
                      <div className="flex items-center justify-center space-x-4 text-emerald-700 dark:text-emerald-300">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          ✅
                        </motion.div>
                        <span className="font-bold text-2xl">Wallet Connected!</span>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-400 text-xl">
                      Browse the events above to start creating your friendship NFTs
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      
      {/* Floating Action Button */}
      <FloatingActionButton 
        icon={<Rocket className="w-8 h-8" />}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </div>
  );
}

