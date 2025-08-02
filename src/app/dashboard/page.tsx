'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, Plus, FileText, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useGetAllEventNFTs, useGetEventMetadata } from '@/hooks/useContract';
import Image from 'next/image';
import { processImageUrl, handleImageError } from '@/lib/image-utils';

interface EventCardProps {
  eventAddress: string;
}

function CreatedEventCard({ eventAddress }: EventCardProps) {
  const { data: metadata, isLoading } = useGetEventMetadata(eventAddress);
  const { address } = useAccount();

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="w-full h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (!metadata || !metadata.exists || metadata.creator.toLowerCase() !== address?.toLowerCase()) {
    return null;
  }

  const imageUrl = processImageUrl(metadata.imageURI);
  const createdDate = new Date(Number(metadata.createdAt) * 1000).toLocaleDateString();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <div className="relative h-32 w-full overflow-hidden rounded-t-lg">
        <Image
          src={imageUrl}
          alt={metadata.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{metadata.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{createdDate}</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            Creator
          </Badge>
          <Link href={`/dashboard/events/${eventAddress}`}>
            <Button size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { data: allEventAddresses, isLoading: eventsLoading } = useGetAllEventNFTs();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to access the dashboard.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Creator Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your events and whitelist settings
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-3 py-1">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Badge>
              <Link href="/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>My Events</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Your Created Events</CardTitle>
                <p className="text-muted-foreground">
                  Events you&apos;ve created and can manage
                </p>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="p-4">
                        <div className="animate-pulse">
                          <div className="w-full h-32 bg-gray-200 rounded mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allEventAddresses?.map((eventAddress) => (
                      <CreatedEventCard 
                        key={eventAddress} 
                        eventAddress={eventAddress} 
                      />
                    ))}
                  </div>
                )}
                
                {!eventsLoading && !allEventAddresses?.length && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Events Created</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven&apos;t created any events yet. Start by creating your first event!
                    </p>
                    <Link href="/create">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Event
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Insights</CardTitle>
                <p className="text-muted-foreground">
                  Track your events performance and engagement
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and insights for your events will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <p className="text-muted-foreground">
                  Manage your account preferences and settings
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium">Connected Wallet</label>
                    <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <code className="text-sm">{address}</code>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">More Settings Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Additional account settings and preferences will be available in future updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}