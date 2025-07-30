'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Home, Users, Calendar, Wallet, Star, Zap, Shield, Crown, Sparkles } from 'lucide-react';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';

interface FloatingNavProps {
  className?: string;
}

const navItems = [
  { icon: Home, label: 'Home', href: '#home' },
  { icon: Users, label: 'Events', href: '#events' },
  { icon: Star, label: 'Features', href: '#features' },
  { icon: Calendar, label: 'Statistics', href: '#stats' },
];

export const FloatingNav: React.FC<FloatingNavProps> = ({ className }) => {
  const { isConnected } = useAccount();
  const [activeSection, setActiveSection] = useState('home');
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  
  const y = useTransform(scrollY, [0, 100], [100, 0]);
  const opacity = useTransform(scrollY, [0, 100], [0, 1]);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(href.slice(1));
    }
  };

  return (
    <motion.div
      style={{ y, opacity }}
      className={cn(
        "fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50",
        "glass-vibrant backdrop-blur-xl rounded-full px-8 py-4",
        "border border-white/20 dark:border-purple-500/30",
        "shadow-2xl neon-glow",
        isVisible ? "block" : "hidden",
        className
      )}
    >
      <div className="flex items-center space-x-6">
        {navItems.map((item, index) => (
          <motion.button
            key={item.label}
            onClick={() => scrollToSection(item.href)}
            className={cn(
              "relative p-3 rounded-full transition-all duration-300",
              "hover:bg-white/10 dark:hover:bg-purple-500/20",
              "group cursor-pointer",
              activeSection === item.href.slice(1) 
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white neon-glow-pink" 
                : "text-gray-600 dark:text-gray-300"
            )}
                          whileHover={{ scale: 1 }}
              whileTap={{ scale: 1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <item.icon className="w-5 h-5" />
            
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute -top-12 left-1/2 transform -translate-x-1/2 
                         bg-gray-900 dark:bg-white text-white dark:text-gray-900 
                         px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap
                         shadow-lg pointer-events-none"
            >
              {item.label}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                             border-4 border-transparent border-t-gray-900 dark:border-t-white" />
            </motion.div>
          </motion.button>
        ))}
        
        {/* Separator */}
        <div className="h-8 w-px bg-gradient-to-b from-transparent via-purple-300 to-transparent" />
        
        {/* Connection Status */}
        <motion.div
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-full",
            isConnected 
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" 
              : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
          )}
                        whileHover={{ scale: 1 }}
        >
          {isConnected ? (
            <>
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Connected</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Connect</span>
            </>
          )}
        </motion.div>
      </div>
      
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20"
        animate={{
                          scale: [1, 1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

// Magnetic Cursor Effect Component
export const MagneticCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    // Add event listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
    
    window.addEventListener('mousemove', handleMouseMove);
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50 mix-blend-difference"
      animate={{
        x: mousePosition.x - 10,
        y: mousePosition.y - 10,
                      scale: isHovering ? 1 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
    >
      <div className={cn(
        "w-5 h-5 rounded-full",
        isHovering 
          ? "bg-gradient-to-r from-purple-400 to-pink-400" 
          : "bg-white"
      )} />
    </motion.div>
  );
};

// Advanced Particle System
export const ParticleSystem: React.FC = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const particles = Array.from({ length: 50 }, (_, i) => i);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (windowSize.width === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
          initial={{
            x: Math.random() * windowSize.width,
            y: windowSize.height + 10,
            opacity: 0,
          }}
          animate={{
            y: -10,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut",
          }}
          style={{
            left: Math.random() * 100 + '%',
          }}
        />
      ))}
    </div>
  );
};