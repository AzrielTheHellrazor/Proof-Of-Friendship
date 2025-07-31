'use client';

import { useState } from 'react';
// import { motion } from 'framer-motion';
import { Upload, ArrowLeft, ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";
// Dynamic import for Google GenAI will be done inside the function

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { showToast } from '@/components/ui/toast';

// Thirdweb client configuration for client-side usage
// Note: Only use clientId in browser/client-side code for security
const client = createThirdwebClient({ 
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID! 
});

export default function CreateNFT() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    date: '',
    location: '',
    image: null as File | null
  });
  

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadedToIPFS, setImageUploadedToIPFS] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateImage = async () => {
    if (!formData.eventName || !formData.description) {
      showToast.error("Missing Information", "Please fill in Event Name and Description first.");
      return;
    }

    setIsGeneratingImage(true);
    
    try {
      showToast.info("Creating Image...", "AI is generating your friendship memory image.");
      
      // Dynamic import for client-side usage
      const { GoogleGenAI, Modality } = await import("@google/genai");
      
      if (!process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY) {
        throw new Error("Google GenAI API key not configured. Please add NEXT_PUBLIC_GOOGLE_GENAI_API_KEY to your .env.local file.");
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY
      });

      const prompt = `Create a beautiful, artistic image for a friendship memory titled "${formData.eventName}". Description: ${formData.description}. ${formData.location ? `Location: ${formData.location}. ` : ''}${formData.date ? `Date: ${formData.date}. ` : ''}Make it warm, friendly, and memorable. Style should be vibrant and joyful.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: prompt,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const imageData = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${imageData}`;
            
            // Convert base64 to file for compatibility with existing upload logic
            const base64Response = await fetch(imageUrl);
            const blob = await base64Response.blob();
            const file = new File([blob], 'generated-image.png', { type: 'image/png' });
            
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(imageUrl);
  
            setImageUploadedToIPFS(null); // Reset IPFS state
            
            showToast.success("Image Created!", "Your friendship memory image has been generated successfully!");
            break;
          }
        }
      } else {
        throw new Error("No image generated in response");
      }
      
    } catch (error) {
      console.error("Image generation error:", error);
      showToast.error("Generation Failed", "Failed to generate image. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleUploadImageToIPFS = async () => {
    if (!formData.image) {
      showToast.error("No Image Selected", "Please select an image first.");
      return;
    }

    setIsUploadingImage(true);

    try {
      showToast.info("Uploading to IPFS...", "Your image is being uploaded to decentralized storage.");
      
      const imageUri = await upload({ 
        client, 
        files: [formData.image] 
      });
      
      setImageUploadedToIPFS(imageUri);
      showToast.success("Image Uploaded!", `Image successfully uploaded to IPFS: ${imageUri}`);
      
    } catch (error) {
      console.error("Image upload error:", error);
      showToast.error("Upload Failed", "Failed to upload image to IPFS. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreateNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      showToast.error("Wallet Not Connected", "Please connect your wallet to create an NFT.");
      return;
    }

    if (!formData.eventName || !formData.description || !formData.image) {
      showToast.error("Missing Information", "Please fill in all required fields and create an image.");
      return;
    }

    setIsCreating(true);
    setUploadProgress(0);

    try {
      let imageUri = imageUploadedToIPFS;
      
      // If image hasn't been uploaded to IPFS yet, upload it now
      if (!imageUri) {
        showToast.info("Uploading image to IPFS...", "Your image is being uploaded to decentralized storage.");
        setUploadProgress(25);
        
        imageUri = await upload({ 
          client, 
          files: [formData.image] 
        });
        
        setImageUploadedToIPFS(imageUri);
        setUploadProgress(50);
      } else {
        showToast.info("Creating metadata...", "Using already uploaded image from IPFS.");
        setUploadProgress(50);
      }
      
      // Create metadata object
      const metadata = {
        name: formData.eventName,
        description: formData.description,
        image: imageUri,
        attributes: [
          {
            trait_type: "Event Type",
            value: "Friendship Memory"
          },
          {
            trait_type: "Date",
            value: formData.date || "Not specified"
          },
          {
            trait_type: "Location", 
            value: formData.location || "Not specified"
          },
          {
            trait_type: "Creator",
            value: address
          }
        ]
      };
      
      setUploadProgress(75);
      
      // Upload metadata to IPFS
      const metadataFile = new File([JSON.stringify(metadata)], 'metadata.json', {
        type: 'application/json',
      });
      
      const metadataUri = await upload({ 
        client, 
        files: [metadataFile] 
      });
      
      setUploadProgress(100);
      
      showToast.success("NFT Created!", `Your friendship memory has been uploaded to IPFS successfully!\n\nImage: ${imageUri}\nMetadata: ${metadataUri}`);
      
      // Store the URIs for later use (in a real app, you'd mint the NFT here)
      console.log("Image URI:", imageUri);
      console.log("Metadata URI:", metadataUri);
      console.log("Generated Metadata:", metadata);
      
      // TODO: Call API to mint NFT on blockchain
      // Example future implementation:
      /*
      const mintResponse = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadataUri: metadataUri,
          recipientAddress: address,
          contractAddress: 'YOUR_NFT_CONTRACT_ADDRESS'
        })
      });
      const result = await mintResponse.json();
      console.log('NFT Minted:', result);
      */
      
      // Redirect to events page
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
    } catch (error) {
      console.error("Upload error:", error);
      showToast.error("Upload Failed", "Failed to upload to IPFS. Please check your internet connection and try again.");
    } finally {
      setIsCreating(false);
      setUploadProgress(0);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center space-y-6">
            <h1 className="text-2xl font-bold">Wallet Required</h1>
            <p className="text-muted-foreground">
              You need to connect your wallet to create NFTs.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">Create Your Friendship NFT</h1>
            <p className="text-muted-foreground text-lg">
              Transform your special moments into unique digital collectibles
            </p>
          </div>

          {/* Creation Form */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Fill in the details about your friendship moment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateNFT} className="space-y-6">
                {/* Event Name */}
                <div className="space-y-2">
                  <Label htmlFor="eventName">Event Name *</Label>
                  <Input
                    id="eventName"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    placeholder="e.g., Summer Beach Trip"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your special moment..."
                    className="min-h-[100px]"
                    required
                  />
                </div>

                {/* Date and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Where did this happen?"
                    />
                  </div>
                </div>

                                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">Event Image * (AI Generated)</Label>
                  
                  {imagePreview ? (
                    /* Image Preview - No Dashed Border */
                    <div className="space-y-4 animate-in fade-in-50 duration-500">
                      <div className="relative overflow-hidden rounded-xl shadow-lg">
                        <Image
                          src={imagePreview}
                          alt="Generated Friendship Memory"
                          width={600}
                          height={400}
                          className="w-full h-64 md:h-80 object-cover transition-all duration-300 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      {/* IPFS Upload Status */}
                      {imageUploadedToIPFS && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800 font-medium">✅ Uploaded to IPFS</p>
                          <p className="text-xs text-green-600 break-all">{imageUploadedToIPFS}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image: null }));
                            setImageUploadedToIPFS(null);
                          }}
                        >
                          Generate New Image
                        </Button>
                        
                        {!imageUploadedToIPFS && (
                          <Button
                            type="button"
                            variant="default"
                            onClick={handleUploadImageToIPFS}
                            disabled={isUploadingImage}
                          >
                            {isUploadingImage ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload to IPFS
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Upload Area - With Dashed Border */
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center space-y-4">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div className="space-y-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="cursor-pointer"
                          onClick={handleCreateImage}
                          disabled={isGeneratingImage || !formData.eventName || !formData.description}
                        >
                          {isGeneratingImage ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Create Image with AI
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI will create a unique image based on your event name and description
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {isCreating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {uploadProgress < 25 ? "Preparing upload..." :
                         uploadProgress < 50 ? "Uploading image to IPFS..." :
                         uploadProgress < 75 ? "Creating metadata..." :
                         uploadProgress < 100 ? "Uploading metadata to IPFS..." :
                         "Upload complete!"}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating NFT...
                    </>
                  ) : (
                    'Create NFT'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Alert */}
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              <strong>AI Image Generation Ready:</strong> Create unique images for your NFTs using AI! 
              <br />
              1. Fill in Event Name and Description
              <br />
              2. Click &quot;Create Image with AI&quot; to generate your unique image
              <br />
              3. Upload to IPFS and create your NFT
              <br />
              <strong>Note:</strong> AI will create a custom image based on your friendship memory details.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}