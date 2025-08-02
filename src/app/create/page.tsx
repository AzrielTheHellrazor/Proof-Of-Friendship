'use client';

import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';

// Shadcn Components
import { Button } from '@/components/ui/button';

// Custom Components
import CreateEventForm from '@/components/CreateEventForm';
import { CONTRACTS } from '@/lib/contracts';

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <Button
              asChild
              className="bg-primary text-white shadow-md hover:bg-primary/90 font-semibold px-4 py-2"
            >
              <Link href="/" className="flex items-center">
                <ArrowLeft className="mr-2 h-5 w-5" />
                <span className="align-middle">Back to Home</span>
              </Link>
            </Button>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mb-6">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold">Create Friendship Event</h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Deploy a new ERC1155 contract for your friendship event where friends can mint NFTs and earn points together
            </p>
          </div>

          {/* Contract Info */}
          <div className="text-center p-4 bg-muted/50 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              <strong>Network:</strong> {CONTRACTS.NETWORK.name} | 
              <strong> Router:</strong> {CONTRACTS.ROUTER.address.slice(0, 8)}...{CONTRACTS.ROUTER.address.slice(-6)}
            </p>
          </div>

          {/* Creation Form */}
          <CreateEventForm />
        </div>
      </div>
    </div>
  );
}