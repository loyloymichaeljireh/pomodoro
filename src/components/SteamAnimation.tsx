import React from 'react';
import { motion } from 'framer-motion';
export function SteamAnimation() {
  const steamVariants = {
    initial: {
      y: 0,
      opacity: 0.15,
      scale: 0.8
    },
    animate: {
      y: -120,
      opacity: 0,
      scale: 1.2,
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeOut'
      }
    }
  };
  return <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(3)].map((_, i) => <motion.div key={i} className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{
      left: `${45 + i * 5}%`
    }} variants={steamVariants} initial="initial" animate="animate" transition={{
      delay: i * 1.3,
      duration: 4,
      repeat: Infinity,
      ease: 'easeOut'
    }}>
          <div className="w-16 h-16 rounded-full bg-[#C4A57B]" style={{
        filter: 'blur(20px)',
        opacity: 0.08
      }} />
        </motion.div>)}
    </div>;
}