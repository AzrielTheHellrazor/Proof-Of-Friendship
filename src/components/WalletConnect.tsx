'use client'

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { Wallet, ChevronDown, LogOut, Copy, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { isChainSupported, CONTRACTS } from '@/lib/contracts'
import { base } from 'wagmi/chains'
import { useState } from 'react'

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [copied, setCopied] = useState(false)

  const isCorrectNetwork = isChainSupported(chainId)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const switchToBase = () => {
    switchChain({ chainId: base.id })
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your wallet to create events, mint NFTs, and track friendship points
              </p>
            </div>
            
            <div className="space-y-2">
              {connectors.map((connector) => (
                <Button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  disabled={isConnecting}
                  variant="outline"
                  className="w-full"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {connector.name}
                  {isConnecting && connector.name && ' (Connecting...)'}
                </Button>
              ))}
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>Supported on {CONTRACTS.NETWORK.name} Network</p>
              <p>Contract: <code>{CONTRACTS.ROUTER.address}</code></p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {!isCorrectNetwork && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Switch to {CONTRACTS.NETWORK.name} to use Proof of Friendship</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={switchToBase}
              className="ml-2"
            >
              Switch Network
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-mono">{truncateAddress(address!)}</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-3 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Wallet Address</span>
                <Badge variant={isCorrectNetwork ? "default" : "destructive"} className="text-xs">
                  {isCorrectNetwork ? CONTRACTS.NETWORK.name : `Wrong Network`}
                </Badge>
              </div>
              <div 
                className="flex items-center gap-2 p-2 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={copyAddress}
              >
                <code className="text-xs flex-1 truncate">{address}</code>
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Network:</span>
                <span>{chainId}</span>
              </div>
              <div className="flex justify-between">
                <span>Contract:</span>
                <span className="truncate ml-2">{CONTRACTS.ROUTER.address.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          {!isCorrectNetwork && (
            <>
              <DropdownMenuItem onClick={switchToBase}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Switch to {CONTRACTS.NETWORK.name}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem 
            onClick={() => disconnect()}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}