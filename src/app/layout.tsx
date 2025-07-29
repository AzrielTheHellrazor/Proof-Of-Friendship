import type { Metadata } from "next";
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
  description: "Create unique NFTs as proof of attending social events with friends. Each event becomes a permanent memory on the blockchain with beautiful, modern design.",
  keywords: ["NFT", "friendship", "events", "blockchain", "social", "memories"],
  authors: [{ name: "Proof of Friendship Team" }],
  openGraph: {
    title: "Proof of Friendship - Modern NFT Experience",
    description: "Mint your friendship memories as beautiful NFTs",
    type: "website",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#8b5cf6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 min-h-screen transition-colors duration-300 relative overflow-x-hidden`}
      >
        {/* Vibrant background patterns */}
        <div className="fixed inset-0 bg-pattern-dots opacity-30 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
        
        {/* Animated gradient orbs */}
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-400/15 to-purple-400/15 rounded-full blur-2xl animate-float pointer-events-none" />
        
        <Providers>
          <div className="relative z-10">
            {/* Main content */}
            <div className="relative z-10">
              {children}
            </div>
            
            {/* Modern toast notifications */}
            <ModernToaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
