'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import Image from 'next/image'
import { ImageIcon, Loader2, CheckCircle, Sparkles, Cloud } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { useCreateEvent } from '@/hooks/useContract'
import { CONTRACTS } from '@/lib/contracts'
import { processImageUrl, handleImageError } from '@/lib/image-utils'
import { showToast } from '@/components/ui/toast'
import { upload } from 'thirdweb/storage'
import { clientSideClient } from '@/lib/thirdweb-server'

interface CreateEventFormProps {
  onSuccess?: (eventAddress: string) => void
}

export default function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageURI: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const { isConnected, address } = useAccount()
  const { createEvent, isPending, isSuccess, error, hash } = useCreateEvent()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Event name must be at least 3 characters'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }
    
    if (!formData.imageURI.trim()) {
      newErrors.imageURI = 'Image URL is required'
    } else {
      try {
        new URL(formData.imageURI)
      } catch {
        newErrors.imageURI = 'Please enter a valid URL'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      return
    }
    
    if (!validateForm()) {
      return
    }
    
    createEvent(formData.name, formData.description, formData.imageURI)
  }

  const handleIPFSUpload = async () => {
    if (!imagePreview || !imagePreview.startsWith('data:')) {
      showToast.error('No AI Image Found', 'Please generate an AI image first.')
      return
    }

    setIsUploadingToIPFS(true)
    
    try {
      // Convert data URI to File object
      const response = await fetch(imagePreview)
      const blob = await response.blob()
      const file = new File([blob], 'ai-generated-image.png', { type: 'image/png' })

      const uploadedURI = await upload({
        client: clientSideClient,
        files: [file],
      })

      // Clean the uploaded URI to get just the hash
      const cleanHash = uploadedURI.replace('ipfs://', '')
      const ipfsURL = `ipfs://${cleanHash}`
      
      // Update form data with IPFS URL
      setFormData(prev => ({ ...prev, imageURI: ipfsURL }))
      
      // Clear any previous imageURI errors
      setErrors(prev => ({ ...prev, imageURI: '' }))
      
      // Show success toast with gateway link
      const gatewayURL = `https://ipfs.io/ipfs/${cleanHash}`
      showToast.success(
        'AI Image Uploaded to IPFS!',
        `Image Link: ${gatewayURL}`
      )
      
    } catch (error) {
      console.error("IPFS upload error:", error)
      showToast.error(
        'IPFS Upload Failed',
        'Unable to upload AI image to IPFS. Please try again.'
      )
    } finally {
      setIsUploadingToIPFS(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      setErrors(prev => ({ 
        ...prev, 
        name: !formData.name.trim() ? 'Event name is required for AI generation' : '',
        description: !formData.description.trim() ? 'Description is required for AI generation' : ''
      }))
      return
    }

    setIsGeneratingImage(true)
    
    try {
      // Dynamic import for Google GenAI
      const { GoogleGenAI, Modality } = await import("@google/genai")
      
      if (!process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY) {
        throw new Error("Google GenAI API key not configured")
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY
      })

      const prompt = `Create a beautiful, artistic image for a friendship event titled "${formData.name}". Description: ${formData.description}. Make it warm, friendly, and memorable. Style should be vibrant, joyful, and perfect for a social gathering. Focus on friendship, connection, and positive emotions.`

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: prompt,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      })

      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const imageData = part.inlineData.data
            const imageUrl = `data:image/png;base64,${imageData}`
            
            setImagePreview(imageUrl)
            setFormData(prev => ({ ...prev, imageURI: imageUrl }))
            
            // Clear any previous imageURI errors
            setErrors(prev => ({ ...prev, imageURI: '' }))
            
            // Show success toast
            showToast.success(
              'Image Generated Successfully!',
              'Your custom AI-generated image is ready.'
            )
            
            break
          }
        }
      } else {
        throw new Error("No image generated in response")
      }
      
    } catch (error) {
      console.error("Image generation error:", error)
      setErrors(prev => ({ 
        ...prev, 
        imageURI: 'Failed to generate image. Please try again or enter a URL manually.' 
      }))
      
      // Show error toast
      showToast.error(
        'Image Generation Failed',
        'Unable to generate image. Please try again or enter a URL manually.'
      )
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet Required</CardTitle>
          <CardDescription>
            Please connect your wallet to create a friendship event
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <div>
              <h3 className="text-xl font-semibold text-green-700">Event Created Successfully!</h3>
              <p className="text-muted-foreground mt-2">
                Your friendship event has been deployed on {CONTRACTS.NETWORK.name}
              </p>
            </div>
            
            {hash && (
              <div className="text-sm">
                <p className="text-muted-foreground">Transaction Hash:</p>
                <a 
                  href={`${CONTRACTS.ROUTER.blockExplorer}/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-mono text-xs break-all"
                >
                  {hash}
                </a>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/')}>
                View All Events
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFormData({ name: '', description: '', imageURI: '' })
                  setErrors({})
                }}
              >
                Create Another
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Friendship Event</CardTitle>
        <CardDescription>
          Create a new event where friends can mint NFTs and earn friendship points together
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Event Name*</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Summer BBQ Party"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description*</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your event and what makes it special..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Event Image */}
          <div className="space-y-4">
            <Label>Event Image*</Label>
            
            {!imagePreview && !formData.imageURI && (
              <div className="text-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <h4 className="font-medium">Generate with AI</h4>
                  <p className="text-sm text-muted-foreground">
                    AI will create a custom image based on your event name and description
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !formData.name.trim() || !formData.description.trim()}
                  className="mt-4"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
                {(!formData.name.trim() || !formData.description.trim()) && (
                  <p className="text-xs text-amber-600 mt-2">
                    Please fill in event name and description first
                  </p>
                )}
              </div>
            )}

            {/* Image Preview */}
            {(imagePreview || formData.imageURI) && (
              <div className="space-y-3">
                <div className="relative w-full h-96 border rounded-lg overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40">
                  <Image
                    src={imagePreview || processImageUrl(formData.imageURI)}
                    alt="Event image preview"
                    fill
                    className="object-cover"
                    onError={handleImageError}
                  />
                </div>
                
                {/* IPFS Link Display */}
                {formData.imageURI.startsWith('ipfs://') && (
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Image Link:</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-muted-foreground break-all bg-muted/30 p-1 rounded">
                        https://ipfs.io/ipfs/{formData.imageURI.replace('ipfs://', '')}
                      </p>
                      <a 
                        href={`https://ipfs.io/ipfs/${formData.imageURI.replace('ipfs://', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline inline-block"
                      >
                        🔗 View Image →
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleIPFSUpload}
                    disabled={isUploadingToIPFS || !imagePreview?.startsWith('data:') || formData.imageURI.startsWith('ipfs://')}
                  >
                    {isUploadingToIPFS ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Uploading...
                      </>
                    ) : formData.imageURI.startsWith('ipfs://') ? (
                      <>
                        <Cloud className="w-4 h-4 mr-1" />
                        Already on IPFS
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4 mr-1" />
                        Upload AI Image to IPFS
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-1" />
                        Generate New
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error.message || 'Failed to create event. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Network Info */}
          <Alert>
            <AlertDescription>
              <div className="flex items-center justify-between text-sm">
                <span>Deploying on: <strong>{CONTRACTS.NETWORK.name}</strong></span>
                <span>Contract: <code className="text-xs">{CONTRACTS.ROUTER.address}</code></span>
              </div>
            </AlertDescription>
          </Alert>

          {/* Image Options Info */}
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">🎨 AI Image Generation</p>
                <p className="text-sm">Generate custom images with AI and optionally upload them to IPFS for permanent storage</p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
            size="lg"
            onClick={async (e) => {
              e.preventDefault();
              if (isPending) return;
              // Send call to Router contract to create an event contract
              if (!isConnected) {
                showToast.error('Wallet not connected', 'Please connect your wallet.');
                return;
              }
              if (!validateForm()) {
                return;
              }
              try {
                await createEvent(formData.name, formData.description, formData.imageURI);
                // If successful, call onSuccess callback
                if (onSuccess && hash) {
                  onSuccess(hash);
                }
              } catch (err) {
                const errorMessage = (err as { message?: string })?.message || 'An error occurred.';
                showToast.error('Failed to create event', errorMessage);
              }
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Event...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Create Event
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Creating an event will deploy a new ERC1155 contract for your event NFTs
          </p>
        </form>
      </CardContent>
    </Card>
  )
}