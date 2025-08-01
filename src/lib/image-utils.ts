/**
 * Image URL utilities for handling various image sources including IPFS
 */

// Default fallback image for events
export const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center'

/**
 * Validates if a given string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Converts IPFS URLs to HTTP gateway URLs
 */
export const ipfsToHttp = (url: string): string => {
  if (!url) return DEFAULT_EVENT_IMAGE
  
  // If it's already an HTTP URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Handle IPFS URLs
  if (url.startsWith('ipfs://')) {
    const hash = url.replace('ipfs://', '')
    return `https://ipfs.io/ipfs/${hash}`
  }
  
  // Handle raw IPFS hashes (without ipfs:// prefix)
  if (url.match(/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/)) {
    return `https://ipfs.io/ipfs/${url}`
  }
  
  // Handle data URLs (base64 images)
  if (url.startsWith('data:')) {
    return url
  }
  
  // If none of the above, return fallback
  return DEFAULT_EVENT_IMAGE
}

/**
 * Validates and processes image URLs for Next.js Image component
 */
export const processImageUrl = (url: string | undefined | null): string => {
  if (!url) return DEFAULT_EVENT_IMAGE
  
  const processedUrl = ipfsToHttp(url)
  
  // Final validation
  if (isValidUrl(processedUrl)) {
    return processedUrl
  }
  
  return DEFAULT_EVENT_IMAGE
}

/**
 * Image loading error handler for Next.js Image component
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement
  if (target.src !== DEFAULT_EVENT_IMAGE) {
    target.src = DEFAULT_EVENT_IMAGE
  }
}