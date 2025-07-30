'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'neon' | 'holographic' | '3d';
  tilt?: boolean;
  glow?: boolean;
  interactive?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className,
  variant = 'default',
  tilt = true,
  glow = false,
  interactive = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !tilt) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set((e.clientX - centerX) / rect.width);
    mouseY.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'glass-vibrant backdrop-blur-xl border border-white/20 dark:border-purple-500/30';
      case 'neon':
        return 'bg-gray-900 dark:bg-gray-800 border-2 border-cyan-400 neon-glow-blue shadow-2xl';
      case 'holographic':
        return 'bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20 border border-white/30 backdrop-blur-lg holographic-gradient';
      case '3d':
        return 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-2xl transform-gpu';
      default:
        return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'rounded-3xl p-6 transition-all duration-300 cursor-pointer overflow-hidden relative',
        getVariantClasses(),
        glow && 'animate-glow',
        interactive && 'hover:shadow-2xl',
        className
      )}
      style={{
        rotateX: tilt ? rotateX : 0,
        rotateY: tilt ? rotateY : 0,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={interactive ? { scale: 1, y: -5 } : {}}
      whileTap={interactive ? { scale: 1 } : {}}
    >
      {/* Holographic shimmer effect */}
      {variant === 'holographic' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: isHovered ? ['-100%', '200%'] : '-100%',
          }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
          }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transform: 'skewX(-15deg)',
          }}
        />
      )}
      
      {/* Interactive glow border */}
      {isHovered && interactive && (
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-purple-400/50"
                  initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
      
      {/* Background gradient overlay for 3D effect */}
      {variant === '3d' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 rounded-3xl" />
      )}
    </motion.div>
  );
};

// Morphing Button Component
interface MorphingButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'neon' | 'holographic';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  disabled?: boolean;
}

export const MorphingButton: React.FC<MorphingButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getVariantClasses = () => {
    switch (variant) {
      case 'neon':
        return 'bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 neon-glow-blue';
      case 'holographic':
        return 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white border border-white/30 backdrop-blur-sm';
      case 'secondary':
        return 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700';
      default:
        return 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:from-purple-500 hover:via-pink-500 hover:to-blue-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-8 py-4 text-lg';
      case 'xl':
        return 'px-12 py-6 text-xl';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden font-semibold rounded-2xl transition-all duration-300 transform-gpu',
        'focus:outline-none focus:ring-4 focus:ring-purple-500/30',
        getVariantClasses(),
        getSizeClasses(),
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled}
                whileHover={{ scale: 1 }}
          whileTap={{ scale: 1 }}
      animate={{
        borderRadius: isHovered ? [16, 24, 16] : 16,
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
    >
      {/* Morphing background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
        animate={{
          x: isHovered ? ['-100%', '200%'] : '-100%',
        }}
        transition={{
          duration: 0.8,
          ease: 'easeInOut',
        }}
      />
      
      {/* Ripple effect */}
      {isPressed && (
        <motion.div
          className="absolute inset-0 bg-white/30 rounded-full"
                      initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// Floating Action Button
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  className,
  position = 'bottom-right',
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'top-right':
        return 'top-8 right-8';
      case 'top-left':
        return 'top-8 left-8';
      default:
        return 'bottom-8 right-8';
    }
  };

  return (
    <motion.button
      className={cn(
        'fixed z-40 w-16 h-16 rounded-full',
        'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
        'shadow-2xl neon-glow',
        'flex items-center justify-center',
        'focus:outline-none focus:ring-4 focus:ring-purple-500/30',
        getPositionClasses(),
        className
      )}
      onClick={onClick}
                  whileHover={{ scale: 1, rotate: 15 }}
            whileTap={{ scale: 1 }}
      animate={{
        y: [0, -5, 0],
      }}
      transition={{
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      {icon}
    </motion.button>
  );
};