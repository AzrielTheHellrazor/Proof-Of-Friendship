'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showToast } from '@/components/ui/toast';
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Plus, 
  Trash2, 
  UserPlus,
  UserMinus,
  Copy,
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { 
  useGetEventMetadata, 
  useEventNFTAddToWhitelist, 
  useEventNFTRemoveFromWhitelist, 
  useEventNFTSetWhitelistEnabled,
  useIsUserWhitelisted,
  useGetEventTokenInfo
} from '@/hooks/useContract';
import Image from 'next/image';
import { processImageUrl, handleImageError } from '@/lib/image-utils';

interface WhitelistEntry {
  address: string;
  isValid: boolean;
}

export default function EventManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { address: userAddress, isConnected } = useAccount();
  const eventAddress = params.address as string;
  
  const { data: metadata, isLoading: metadataLoading } = useGetEventMetadata(eventAddress);
  
  // State for whitelist management
  const [whitelistAddresses, setWhitelistAddresses] = useState<WhitelistEntry[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [bulkAddresses, setBulkAddresses] = useState('');
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<number>(1);
  
  // Whitelist hooks
  const { addToWhitelist, isPending: isAddingToWhitelist, isSuccess: addSuccess } = useEventNFTAddToWhitelist(eventAddress);
  const { removeFromWhitelist, isPending: isRemovingFromWhitelist, isSuccess: removeSuccess } = useEventNFTRemoveFromWhitelist(eventAddress);
  const { setWhitelistEnabled: toggleWhitelist, isPending: isTogglingWhitelist, isSuccess: toggleSuccess } = useEventNFTSetWhitelistEnabled(eventAddress);
  
  // Get event token info to check current whitelist status
  const { data: tokenInfo } = useGetEventTokenInfo(eventAddress);

  // Check if user is the creator
  const isCreator = metadata && userAddress && 
    (metadata as any).creator?.toLowerCase() === userAddress.toLowerCase();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }
    
    if (metadata && !metadataLoading && !isCreator) {
      showToast.error("Access Denied", "You are not the creator of this event.");
      router.push('/dashboard');
    }
  }, [isConnected, metadata, metadataLoading, isCreator, router]);

  // Update whitelist enabled status from token info
  useEffect(() => {
    if (tokenInfo && tokenInfo.length > 6) {
      setWhitelistEnabled(tokenInfo[6] as boolean);
    }
  }, [tokenInfo]);

  // Handle transaction success
  useEffect(() => {
    if (addSuccess) {
      showToast.success("Whitelist Updated", "Addresses have been added to the whitelist.");
    }
  }, [addSuccess]);

  useEffect(() => {
    if (removeSuccess) {
      showToast.success("Whitelist Updated", "Addresses have been removed from the whitelist.");
    }
  }, [removeSuccess]);

  useEffect(() => {
    if (toggleSuccess) {
      showToast.success("Whitelist Status Updated", `Whitelist has been ${whitelistEnabled ? 'enabled' : 'disabled'}.`);
    }
  }, [toggleSuccess, whitelistEnabled]);

  const validateAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
  };

  const addSingleAddress = () => {
    const trimmedAddress = newAddress.trim();
    if (!trimmedAddress) return;
    
    if (!validateAddress(trimmedAddress)) {
      showToast.error("Invalid Address", "Please enter a valid Ethereum address.");
      return;
    }
    
    if (whitelistAddresses.some(entry => entry.address.toLowerCase() === trimmedAddress.toLowerCase())) {
      showToast.warning("Already Added", "This address is already in the whitelist.");
      return;
    }
    
    setWhitelistAddresses(prev => [...prev, { address: trimmedAddress, isValid: true }]);
    setNewAddress('');
    showToast.success("Address Added", "Address added to whitelist successfully.");
  };

  const addBulkAddresses = () => {
    const addresses = bulkAddresses
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0);
    
    if (addresses.length === 0) return;
    
    const newEntries: WhitelistEntry[] = [];
    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    
    addresses.forEach(addr => {
      if (!validateAddress(addr)) {
        invalidCount++;
        return;
      }
      
      if (whitelistAddresses.some(entry => entry.address.toLowerCase() === addr.toLowerCase()) ||
          newEntries.some(entry => entry.address.toLowerCase() === addr.toLowerCase())) {
        duplicateCount++;
        return;
      }
      
      newEntries.push({ address: addr, isValid: true });
      validCount++;
    });
    
    if (newEntries.length > 0) {
      setWhitelistAddresses(prev => [...prev, ...newEntries]);
    }
    
    setBulkAddresses('');
    
    let message = `${validCount} addresses added successfully.`;
    if (invalidCount > 0) message += ` ${invalidCount} invalid addresses skipped.`;
    if (duplicateCount > 0) message += ` ${duplicateCount} duplicates skipped.`;
    
    showToast.success("Bulk Add Complete", message);
  };

  const removeAddress = (addressToRemove: string) => {
    setWhitelistAddresses(prev => 
      prev.filter(entry => entry.address.toLowerCase() !== addressToRemove.toLowerCase())
    );
    showToast.success("Address Removed", "Address removed from whitelist.");
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    showToast.success("Copied", "Address copied to clipboard.");
  };

  const saveWhitelist = async () => {
    if (whitelistAddresses.length === 0) {
      showToast.warning("No Changes", "No addresses to save.");
      return;
    }

    try {
      showToast.info("Saving...", "Whitelist changes are being saved to the blockchain.");
      
      const addressesToAdd = whitelistAddresses.map(entry => entry.address);
      await addToWhitelist(addressesToAdd);
    } catch (error) {
      console.error("Error saving whitelist:", error);
      showToast.error("Save Failed", "Failed to save whitelist changes. Please try again.");
    }
  };

  const toggleWhitelistEnabled = async () => {
    try {
      showToast.info("Updating...", "Updating whitelist status on the blockchain.");
      await toggleWhitelist(!whitelistEnabled);
    } catch (error) {
      console.error("Error toggling whitelist:", error);
      showToast.error("Update Failed", "Failed to update whitelist status. Please try again.");
    }
  };

  if (!isConnected) {
    return null;
  }

  if (metadataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metadata || !isCreator) {
    return null;
  }

  const imageUrl = processImageUrl(metadata.imageURI);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold mb-2">{metadata.name}</h1>
              <p className="text-muted-foreground mb-4">{metadata.description}</p>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">Event Creator</Badge>
                <Badge variant="outline">
                  Created {new Date(Number(metadata.createdAt) * 1000).toLocaleDateString()}
                </Badge>
              </div>
            </div>
            
            <div className="relative h-48 w-full overflow-hidden rounded-lg">
              <Image
                src={imageUrl}
                alt={metadata.name}
                fill
                className="object-cover"
                onError={handleImageError}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="whitelist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="whitelist" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Whitelist</span>
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="whitelist">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Whitelist Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Whitelist Management</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="whitelist-enabled" className="text-sm">
                        Enable Whitelist
                      </Label>
                      <Switch
                        id="whitelist-enabled"
                        checked={whitelistEnabled}
                        onCheckedChange={toggleWhitelistEnabled}
                        disabled={isTogglingWhitelist}
                      />
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Manage who can mint NFTs for token ID {selectedTokenId}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Token ID Selection */}
                  <div>
                    <Label htmlFor="token-id">Token ID</Label>
                    <Input
                      id="token-id"
                      type="number"
                      value={selectedTokenId}
                      onChange={(e) => setSelectedTokenId(parseInt(e.target.value) || 1)}
                      min="1"
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Single Address Add */}
                  <div>
                    <Label htmlFor="new-address">Add Single Address</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        id="new-address"
                        placeholder="0x..."
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                      />
                      <Button onClick={addSingleAddress} disabled={!newAddress.trim()}>
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bulk Add */}
                  <div>
                    <Label htmlFor="bulk-addresses">Adres Ekle (Tek Tek, Listeye Ekle)</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        id="bulk-addresses"
                        placeholder="0x..."
                        value={bulkAddresses}
                        onChange={(e) => setBulkAddresses(e.target.value)}
                      />
                      <Button 
                        onClick={() => {
                          if (bulkAddresses.trim()) {
                            // Adresi ekle
                            const addr = bulkAddresses.trim();
                            if (
                              whitelistAddresses.some(entry => entry.address.toLowerCase() === addr.toLowerCase())
                            ) {
                              showToast.warning("Zaten Eklendi", "Bu adres zaten listede.");
                            } else if (!validateAddress(addr)) {
                              showToast.error("Geçersiz Adres", "Lütfen geçerli bir adres girin.");
                            } else {
                              setWhitelistAddresses(prev => [...prev, { address: addr, isValid: true }]);
                              showToast.success("Adres Eklendi", "Adres başarıyla listeye eklendi.");
                              setBulkAddresses('');
                            }
                          }
                        }}
                        disabled={!bulkAddresses.trim()}
                      >
                        Daha Fazla Ekle
                      </Button>
                    </div>
                    <Button 
                      onClick={addBulkAddresses} 
                      disabled={!bulkAddresses.trim()}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Whitelist */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Current Whitelist</CardTitle>
                    <Badge variant="outline">
                      {whitelistAddresses.length} addresses
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Addresses currently whitelisted for token ID {selectedTokenId}
                  </p>
                </CardHeader>
                <CardContent>
                  {whitelistAddresses.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No addresses in whitelist</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {whitelistAddresses.map((entry, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <code className="text-sm font-mono">
                              {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                            </code>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyAddress(entry.address)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeAddress(entry.address)}
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {whitelistAddresses.length > 0 && (
                    <div className="mt-6 space-y-2">
                      <Button 
                        onClick={saveWhitelist} 
                        className="w-full"
                        disabled={isAddingToWhitelist}
                      >
                        {isAddingToWhitelist ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving...</span>
                          </div>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Save Whitelist Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tokens">
            <Card>
              <CardHeader>
                <CardTitle>Token Management</CardTitle>
                <p className="text-muted-foreground">
                  Manage tokens within this event
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Token Management Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Advanced token management features will be available in future updates.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Event Settings</CardTitle>
                <p className="text-muted-foreground">
                  Configure your event settings
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label>Event Contract Address</Label>
                    <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <code className="text-sm break-all">{eventAddress}</code>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Creator Address</Label>
                    <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <code className="text-sm break-all">{metadata.creator}</code>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">More Settings Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Additional event settings and configuration options will be available soon.
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