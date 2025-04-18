'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Info, AlertTriangle, ChevronDown, ChevronUp, Zap, ExternalLink, Check, Wallet } from 'lucide-react';
import { DNA_COLORS } from '@/lib/constants/designTokens';
import { getWalletClient, getAccount, signMessage, connect, disconnect } from 'wagmi/actions';
import { useWalletAccount } from '@/lib/hooks/use-wallet-account';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainSightStore } from '@/lib/stores/chainSightStore';
import { useChainId } from 'wagmi';
import { PersistentConnectButton } from './PersistentConnectButton';

// Component animations
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const sectionVariants = {
  expanded: { height: 'auto', opacity: 1 },
  collapsed: { height: 0, opacity: 0 }
};

export function WalletConnector() {
  const { address, isConnected } = useWalletAccount();
  const chainId = useChainId();
  const { setWalletConnected } = useChainSightStore();
  
  const [isConnectReasonExpanded, setIsConnectReasonExpanded] = useState(false);
  const [isSecurityInfoExpanded, setIsSecurityInfoExpanded] = useState(false);
  
  // Ref for the container element
  const containerRef = useRef(null);
  
  // Mouse movement tracking for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useTransform(mouseY, [0, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [0, 300], [-5, 5]);
  
  useEffect(() => {
    if (address && isConnected) {
      setWalletConnected(true);
    } else {
      setWalletConnected(false);
    }
  }, [address, isConnected, setWalletConnected]);

  // Handle mouse movement for 3D card effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const toggleSection = (section: string) => {
    setIsConnectReasonExpanded(section === 'why');
    setIsSecurityInfoExpanded(section === 'security');
  };

  // Card container variants for animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="p-3 md:p-6">
      <motion.div
        ref={containerRef}
        className="max-w-md mx-auto bg-black/70 border border-indigo-900/40 rounded-2xl p-6 md:p-8 overflow-hidden"
        style={{ 
          rotateX: rotateX, 
          rotateY: rotateY,
          transformPerspective: 1000,
          boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.15)'
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20 
        }}
      >
        {/* Main Card Content - Always visible */}
        <div 
          onMouseMove={handleMouseMove}
          className="relative"
        >
          <motion.div 
            className="flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              staggerChildren: 0.1,
              delayChildren: 0.1
            }}
          >
            {/* Section Title */}
            <motion.div 
              variants={itemVariants}
              className="mb-6 flex items-center"
            >
              <Zap className="text-indigo-500 mr-2 h-5 w-5" />
              <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Connect to Base Network
              </h2>
            </motion.div>

          {/* Wallet Status - Show when connected */}
          {isConnected && address && (
            <motion.div 
              variants={itemVariants}
              className="mb-6 p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg border border-indigo-500/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse-slow"></div>
                  </div>
                  <div>
                    <div className="text-green-400 font-medium">Wallet Connected</div>
                    <div className="text-xs text-gray-400">Base Sepolia Network</div>
                  </div>
                </div>
                
                <div className="text-indigo-300 font-mono text-sm bg-indigo-950/50 px-3 py-1 rounded-md">
                  {address.substring(0, 6)}...{address.substring(address.length - 4)}
                </div>
              </div>
            </motion.div>
          )}

          {/* RainbowKit Connect Button - Always show */}
          <motion.div 
            variants={itemVariants}
            className="flex justify-center mb-6"
          >
            <PersistentConnectButton />
          </motion.div>

            {/* Info Section: About Base Network */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex items-start space-x-3 mb-3">
                <div className="flex-shrink-0 mt-1">
                  <Info className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-indigo-300 text-sm font-medium mb-2">About Base Network</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Base is a secure, low-cost, developer-friendly Ethereum L2 built on Optimism's OP Stack. For this hackathon, we're using the <span className="text-indigo-300">Base Sepolia Testnet</span>.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Why Connect */}
            <motion.div 
              variants={itemVariants}
              className="border border-indigo-500/20 rounded-lg overflow-hidden"
            >
              <button 
                onClick={() => toggleSection('why')}
                className="w-full p-4 flex justify-between items-center bg-indigo-900/20 hover:bg-indigo-900/30 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium">Why Connect?</span>
                </div>
                {isConnectReasonExpanded ? (
                  <ChevronUp className="w-5 h-5 text-indigo-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-indigo-400" />
                )}
              </button>
              
              <motion.div
                variants={sectionVariants}
                initial="collapsed"
                animate={isConnectReasonExpanded ? "expanded" : "collapsed"}
                className="overflow-hidden"
              >
                <div className="p-4 bg-indigo-900/10">
                  <motion.p variants={itemVariants} className="text-gray-300 mb-3">
                    Connecting your wallet enables you to:
                  </motion.p>
                  <ul className="space-y-2">
                    <motion.li variants={itemVariants} className="flex items-start gap-2">
                      <div className="min-w-5 pt-0.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DNA_COLORS[0] }}></div>
                      </div>
                      <span className="text-gray-300">Authorize blockchain interactions with our smart contracts</span>
                    </motion.li>
                    <motion.li variants={itemVariants} className="flex items-start gap-2">
                      <div className="min-w-5 pt-0.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DNA_COLORS[1] }}></div>
                          </div>
                      <span className="text-gray-300">Access secure genomic data management features</span>
                    </motion.li>
                    <motion.li variants={itemVariants} className="flex items-start gap-2">
                      <div className="min-w-5 pt-0.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DNA_COLORS[2] }}></div>
                        </div>
                      <span className="text-gray-300">Sign transactions and verify your identity</span>
                      </motion.li>
                  </ul>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Security Info */}
            <motion.div 
              variants={itemVariants}
              className="border border-indigo-500/20 rounded-lg overflow-hidden"
            >
              <button 
                onClick={() => toggleSection('security')}
                className="w-full p-4 flex justify-between items-center bg-indigo-900/20 hover:bg-indigo-900/30 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">Security Information</span>
                </div>
                {isSecurityInfoExpanded ? (
                  <ChevronUp className="w-5 h-5 text-indigo-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-indigo-400" />
                )}
              </button>
              
              <motion.div
                variants={sectionVariants}
                initial="collapsed"
                animate={isSecurityInfoExpanded ? "expanded" : "collapsed"}
                className="overflow-hidden"
              >
                <div className="p-4 bg-indigo-900/10">
                  <motion.p variants={itemVariants} className="text-gray-300 mb-3">
                    When connecting your wallet, we:
                  </motion.p>
                  <motion.ul variants={itemVariants} className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Only request read access to your public address</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Request approval for each transaction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>Never access your private keys</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>Never auto-authorize transactions</span>
                    </li>
                  </motion.ul>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 