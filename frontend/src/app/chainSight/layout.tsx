"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundParticles } from '@/components/chainSight/BackgroundParticles';
import { SettingsButton } from "@/components/chainSight/SettingsButton";
import { Settings } from "@/components/chainSight/Settings";
import { useChainSightStore } from "@/lib/stores/chainSightStore";
import { SequencerInput } from "@/components/chainSight/SequencerInput";

export default function ChainSightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSettingsOpen, isSequencerOpen, loadMockData } = useChainSightStore();
  
  // Load mock data on initial render
  useEffect(() => {
    // Only load data if we haven't loaded it already
    loadMockData();
    
    // Fix for body class hydration issue 
    // This is to prevent the "vsc-initialized" class from causing hydration mismatch
    const body = document.querySelector('body');
    if (body && body.classList.contains('vsc-initialized')) {
      body.classList.remove('vsc-initialized');
    }
  }, [loadMockData]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen overflow-x-hidden"
    >
      {/* Main Content */}
      <div key="main-content">
        {children}
      </div>
      
      {/* Background Particles */}
      <BackgroundParticles />
      
      {/* Settings Button */}
      <motion.div
        className="fixed bottom-0 right-0 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <SettingsButton />
      </motion.div>

      {/* Settings Panel with AnimatePresence */}
      <AnimatePresence mode="wait">
        {isSettingsOpen && (
          <motion.div
            key="settings-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Settings />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sequencer Panel with AnimatePresence */}
      <AnimatePresence mode="wait">
        {isSequencerOpen && (
          <motion.div
            key="sequencer-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <SequencerInput />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
} 