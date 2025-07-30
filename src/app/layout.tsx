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
  description: "Transform your friendship moments into unique NFTs. Preserve your social experiences on the blockchain with our modern, user-friendly platform.",
  keywords: ["NFT", "friendship", "blockchain", "social", "memories", "digital collectibles", "web3"],
  authors: [{ name: "Proof of Friendship Team" }],
  openGraph: {
    title: "Proof of Friendship - Modern NFT Experience",
    description: "Create unique NFTs from your friendship moments and social experiences",
    type: "website",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen transition-colors duration-300 relative overflow-x-hidden`}
      >
        {/* Subtle background patterns */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
        
        {/* Gentle animated orbs */}
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/5 to-purple-400/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/3 to-blue-400/3 rounded-full blur-2xl animate-float pointer-events-none" />
        
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
