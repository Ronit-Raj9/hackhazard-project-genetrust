'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '@/lib/constants/designTokens';
import { BackgroundParticles } from './BackgroundParticles';
import { HelixFlow } from './HelixFlow';
import { SettingsButton } from './SettingsButton';
import { WalletConnector } from './WalletConnector';
import { Button } from '@/components/ui/button';
import { GenomicRecord } from '@/lib/stores/chainSightStore';
import { GenomicDashboard } from '@/components/chainSight/genomic/Dashboard';
import { TransactionHistory } from './TransactionHistory';
import { useChainSightStore } from '@/lib/stores/chainSightStore';

export default function ChainSightWrapper() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const { wallet } = useChainSightStore();
  
  // Only run on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // On mount - check container size and set global scaling if needed
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        // Check if we need to use special UI adjustments for small screens
        const width = containerRef.current.offsetWidth;
      }
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  // Sample empty records for HelixFlow with explicit type
  const emptyRecords: GenomicRecord[] = [];

  // Mock handler for node clicks
  const handleNodeClick = (recordId: string) => {
    console.log('Node clicked:', recordId);
  };

  // Check wallet connection from the store which doesn't rely on Wagmi hooks directly
  const isWalletConnected = wallet.isConnected && wallet.address;

  return (
    <div className="min-h-screen overflow-hidden bg-black" ref={containerRef}>
      {/* Background animations */}
      <BackgroundParticles />
      
      {/* Use HelixFlow with required props */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <HelixFlow records={emptyRecords} onNodeClick={handleNodeClick} />
      </div>
      
      {/* Settings button */}
      <SettingsButton />
      
      {/* Main content container */}
      <div className="container mx-auto px-4 lg:px-8 py-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ANIMATIONS.transitions.medium}
          className="mb-12"
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center"
            style={{
              background: 'linear-gradient(to right, #4F46E5, #B16CEA, #00CCFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            GeneTrust Genomic Platform
          </motion.h1>
          
          <motion.p 
            className="text-center text-gray-400 mt-4 max-w-2xl mx-auto text-sm sm:text-base md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Secure your genomic research data on the blockchain with immutable storage 
            <br />and controlled access
          </motion.p>
        </motion.div>
        
        {/* Client-side placeholder that will be replaced on hydration */}
        {!isClient ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-center">
              <div className="h-8 w-32 bg-gray-700 rounded mx-auto mb-4"></div>
              <div className="h-4 w-64 bg-gray-700 rounded mx-auto"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Always show the WalletConnector */}
            <div className="mb-10">
              <WalletConnector />
            </div>
            
            {/* Only show genomic tools when wallet is connected */}
            {isWalletConnected && (
              <div className="space-y-8">
                {/* Genomic Dashboard */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <GenomicDashboard />
                </motion.div>
                
                {/* Transaction History */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-8"
                >
                  <h2 className="text-xl font-semibold text-white mb-4">Transaction History</h2>
                  <TransactionHistory showFilters={true} />
                </motion.div>
                
                <div className="flex justify-center mt-8">
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => {
                      window.location.href = "/dashboard";
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 