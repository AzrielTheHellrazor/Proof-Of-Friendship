import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { ModernToaster } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Proof of Friendship - Modern NFT Experience",
  description: "Transform your friendship moments into unique NFTs. Preserve your social experiences on the blockchain with our modern, user-friendly platform.",
  keywords: ["NFT", "friendship", "blockchain", "social", "memories", "digital collectibles", "web3"],
  authors: [{ name: "Proof of Friendship Team" }],
  openGraph: {
    title: "Proof of Friendship - Modern NFT Experience",
    description: "Create unique NFTs from your friendship moments and social experiences",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen transition-colors duration-300`}
      >
        <Providers>
          <div className="relative">
            {/* Main content */}
            {children}
            
            {/* Modern toast notifications */}
            <ModernToaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}