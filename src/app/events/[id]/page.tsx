'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import { Sparkles, Heart, Users, Calendar, CheckCircle, ArrowLeft, Wallet, Clock, MapPin, AlertCircle, Share2, Download } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showToast } from '@/components/ui/toast';
import { CardSkeleton } from '@/components/ui/loading-skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useGetEventMetadata, useMintNFT, useHasUserMintedNFT, useCanUserMintEvent, useGetEventTokenInfo } from '@/hooks/useContract';
import Link from 'next/link';

// Event interface for contract data
interface EventData {
  name: string;
  description: string;
  imageURI: string;
  creator: string;
  createdAt: number;
  exists: boolean;
  // Additional fields for display
  date?: string;
  location?: string;
  totalMinted?: number;
}

export default function EventDetail() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  
  // Get event address from URL params
  const eventAddress = params.id as string;
  
  const { data: eventMetadata, isLoading: metadataLoading } = useGetEventMetadata(eventAddress);
  const { data: tokenInfo } = useGetEventTokenInfo(eventAddress);
  const { data: hasMinted } = useHasUserMintedNFT(eventAddress, address);
  const { data: canMintResult } = useCanUserMintEvent(eventAddress, address);
  const { mint, isPending, isSuccess, error } = useMintNFT();

  // Loading and animation states
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  // Intersection observers
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: detailsRef, inView: detailsInView } = useInView({ threshold: 0.1, triggerOnce: true });

  // Use contract data and add missing fields
  const event: EventData = eventMetadata ? {
    ...eventMetadata,
    date: new Date(Number(eventMetadata.createdAt) * 1000).toISOString().split('T')[0],
    location: "Event Location", // This could come from metadata in the future
    totalMinted: tokenInfo ? Number(tokenInfo.currentSupply) : 0
  } : {
    name: "",
    description: "",
    imageURI: "",
    creator: "",
    createdAt: 0,
    exists: false
  };

  useEffect(() => {
    // Set loading based on metadata loading
    setIsLoading(metadataLoading);
  }, [metadataLoading]);

  useEffect(() => {
    if (isSuccess && isMinting) {
      setShowSuccess(true);
      setIsMinting(false);
      showToast.success(
        "NFT Minted Successfully! 🎉",
        "Your friendship token will appear in your wallet."
      );
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }
  }, [isSuccess, isMinting]);

  useEffect(() => {
    if (error) {
      showToast.error(
        "Minting Failed",
        error.message || "An error occurred, please try again."
      );
      setIsMinting(false);
    }
  }, [error]);

  const handleConnectWallet = async () => {
    try {
      if (connectors.length > 0) {
        await connect({ connector: connectors[0] });
        showToast.info("Connecting Wallet...", "Please approve the transaction in your wallet app.");
      }
    } catch (error) {
      showToast.error("Connection Failed", "Failed to connect wallet.");
    }
  };

  const handleMint = async () => {
    if (!isConnected) {
      showToast.warning("Wallet Connection Required", "You need to connect your wallet first.");
      return;
    }
    
    setIsMinting(true);
    showToast.info("Minting NFT...", "Transaction is being confirmed on the blockchain.");
    
    try {
      mint(eventAddress);
    } catch (error) {
      setIsMinting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: `I attended ${event.name} and minted an NFT!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast.success("Link Copied", "Event link copied to clipboard.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        {/* Header Skeleton */}
        <header className="glass border-b border-white/20 dark:border-gray-700 sticky top-0 z-50">
          <div className="container-modern py-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-11 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          </div>
        </header>

        <main className="container-modern section-padding">
          <div className="max-w-4xl mx-auto">
            {/* Hero Skeleton */}
            <div className="mb-8">
              <CardSkeleton className="h-96" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CardSkeleton className="h-64" />
              </div>
              <div>
                <CardSkeleton className="h-80" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!event || !event.exists) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="modern" className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Event Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">The event you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/">
              <Button variant="gradient" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Modern Header */}
      <header className="glass border-b border-white/20 dark:border-gray-700 sticky top-0 z-50">
        <div className="container-modern py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Events</span>
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              <ThemeToggle />
              
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ✅ Connected
                  </div>
                  <div className="glass bg-white/10 dark:bg-gray-800/10 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-mono border border-white/20 dark:border-gray-600">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  variant="modern"
                >
                  {isConnecting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-4 h-4" />
                      <span>Connect Wallet</span>
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container-modern section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Event Hero */}
          <motion.section
            ref={heroRef}
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <Card variant="elevated" className="overflow-hidden">
              <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
                <img 
                  src={
                    event.imageURI && event.imageURI.startsWith("ipfs://")
                      ? event.imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                      : event.imageURI
                  }
                  alt={event.name}
                  className="absolute inset-0 w-full h-full object-contain bg-white"
                  style={{ backgroundColor: "#fff" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <motion.h1 
                    className="text-4xl lg:text-5xl font-bold text-white mb-4 text-shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {event.name}
                  </motion.h1>
                  <motion.div 
                    className="flex flex-wrap items-center gap-6 text-white/90"
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>{event.totalMinted} people minted</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Details */}
            <motion.section
              ref={detailsRef}
              initial={{ opacity: 0, y: 40 }}
              animate={detailsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-2 space-y-8"
            >
              <Card variant="modern">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    About This Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                    {event.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 glass-card bg-purple-50/50 dark:bg-purple-900/20">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🎯</span>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Unique NFT</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">One per person</p>
                    </div>
                    <div className="text-center p-6 glass-card bg-pink-50/50 dark:bg-pink-900/20">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔗</span>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">On-chain Proof</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Forever recorded</p>
                    </div>
                    <div className="text-center p-6 glass-card bg-blue-50/50 dark:bg-blue-900/20">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">💎</span>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Free Mint</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">No gas fees</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Enhanced Minting Card */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={detailsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card variant="gradient" className="sticky top-24">
                <CardContent className="p-8">
                  {hasMinted ? (
                    <div className="text-center space-y-6">
                      <motion.div 
                        className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto"
                        animate={{ scale: [1, 1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                          Already Minted! ✨
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          You&apos;ve already minted this NFT. Check your wallet to see your friendship token.
                        </p>
                      </div>
                      <Button
                        onClick={handleShare}
                        variant="outline"
                        className="w-full"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Achievement
                      </Button>
                    </div>
                  ) : canMintResult && !canMintResult[0] ? (
                    <div className="text-center space-y-6">
                      <motion.div 
                        className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <AlertCircle className="w-10 h-10 text-red-600" />
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                          Cannot Mint
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {canMintResult[1] || "You are not eligible to mint this NFT."}
                        </p>
                      </div>
                      {canMintResult[1]?.includes("whitelisted") && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-600 rounded-lg p-4">
                          <p className="text-amber-800 dark:text-amber-200 text-sm">
                            This event requires whitelist approval. Contact the event creator to be added to the whitelist.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center">
                        <motion.div 
                          className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <Sparkles className="w-10 h-10 text-purple-600" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                          Mint Your NFT
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          Prove you attended this event by minting a unique NFT.
                        </p>
                      </div>
                      
                      {!isConnected ? (
                        <div className="space-y-4">
                          <Card variant="glass" className="p-4 bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-600">
                            <p className="text-amber-800 dark:text-amber-200 text-sm font-medium text-center">
                              Connect your wallet to mint this NFT
                            </p>
                          </Card>
                          <Button 
                            onClick={handleConnectWallet}
                            disabled={isConnecting}
                            variant="modern"
                            size="lg"
                            className="w-full"
                          >
                            {isConnecting ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Connecting...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Wallet className="w-5 h-5" />
                                <span>Connect Wallet</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Card variant="glass" className="p-4 bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-600">
                            <p className="text-emerald-800 dark:text-emerald-200 text-sm font-medium text-center">
                              ✅ Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                            </p>
                          </Card>
                          <Button 
                            onClick={handleMint}
                            disabled={isPending || isMinting}
                            variant="modern"
                            size="lg"
                            className="w-full"
                          >
                            {isPending || isMinting ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Minting...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Sparkles className="w-5 h-5" />
                                <span>Mint NFT</span>
                                <Heart className="w-5 h-5" />
                              </div>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
} 