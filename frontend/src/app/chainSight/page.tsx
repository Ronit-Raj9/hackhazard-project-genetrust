'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletState } from "@/lib/hooks/useWalletState";
import { WalletConnector } from "@/components/chainSight/WalletConnector";
import { GenomicDashboard } from "@/components/chainSight/GenomicDashboard";
import { BackgroundParticles } from "@/components/chainSight/BackgroundParticles";

export default function ChainSightPage() {
  const { isWalletConnected, isWalletAuthorized } = useWalletState();
  const [showWalletConnector, setShowWalletConnector] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Check wallet connection status
  useEffect(() => {
    if (isWalletConnected && isWalletAuthorized) {
      setShowWalletConnector(false);
    } else {
      setShowWalletConnector(true);
    }
  }, [isWalletConnected, isWalletAuthorized]);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Page transitions
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.5, ease: "easeIn" }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#080828] to-[#10102a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="w-20 h-20 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
          <motion.div 
            className="absolute inset-0 flex items-center justify-center text-indigo-400 font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            CS
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-[#080828] to-[#10102a] text-white overflow-hidden relative"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <BackgroundParticles />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="max-w-6xl mx-auto px-4 pb-16 pt-8 relative z-10"
      >
        <AnimatePresence mode="wait">
          {showWalletConnector ? (
            <motion.div
              key="wallet-connector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <WalletConnector />
            </motion.div>
          ) : (
            <motion.div
              key="genomic-dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <GenomicDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-2 w-full text-center text-sm text-white/30"
      >
        <motion.span
          whileHover={{ color: 'rgba(255, 255, 255, 0.6)' }}
          transition={{ duration: 0.3 }}
        >
          ChainSight: Verifiable Science on an Immutable Foundation.
        </motion.span>
      </motion.footer>
    </motion.div>
  );
} 