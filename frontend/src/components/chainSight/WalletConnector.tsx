'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionValue, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Info, AlertTriangle, ChevronDown, ChevronUp, Zap, ExternalLink } from 'lucide-react';
import { DNA_COLORS } from '@/lib/constants/designTokens';

export const WalletConnector = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('info');
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  
  // Mouse position for interactive effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Handle mouse movement for background effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Mock function to simulate wallet connection
  const connectWallet = async (walletType: 'metamask' | 'coinbase') => {
    setIsConnecting(true);
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`Connecting to ${walletType} wallet`);
      
      // Make sure we don't use undefined or null properties that would cause Object.values() errors
      const walletData = {
        address: '0x' + Math.random().toString(16).substring(2, 42),
        walletType,
      };
      
      // Handle successful connection - useWalletState hook will catch this
      window.dispatchEvent(new CustomEvent('wallet-connected', { 
        detail: walletData
      }));
      
      // Show success animation
      setConnectionSuccess(true);
      setTimeout(() => setConnectionSuccess(false), 2000);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
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

  // Content item variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  // Section variant animations
  const sectionVariants = {
    collapsed: { 
      height: 0, 
      opacity: 0,
      transition: { 
        duration: 0.3,
        ease: "easeInOut" 
      }
    },
    expanded: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        duration: 0.4,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    }
  };

  return (
    <div 
      className="w-full mx-auto px-2 sm:px-0 sm:max-w-3xl"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative p-5 sm:p-8 rounded-xl overflow-hidden"
        style={{
          background: 'rgba(6, 6, 32, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(79, 70, 229, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Animated gradient background effect */}
        <motion.div 
          className="absolute inset-0 -z-10 opacity-40 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20"
          animate={{ 
            background: [
              'radial-gradient(circle at var(--x) var(--y), rgba(79, 70, 229, 0.25) 0%, rgba(6, 6, 32, 0) 50%)',
              'radial-gradient(circle at var(--x) var(--y), rgba(139, 92, 246, 0.25) 0%, rgba(6, 6, 32, 0) 50%)',
              'radial-gradient(circle at var(--x) var(--y), rgba(79, 70, 229, 0.25) 0%, rgba(6, 6, 32, 0) 50%)'
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ 
            '--x': useTransform(mouseX, val => `${val}px`),
            '--y': useTransform(mouseY, val => `${val}px`),
          } as any}
        />
        
        {/* Connection success overlay */}
        <AnimatePresence>
          {connectionSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-indigo-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-50"
            >
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-black/40 p-8 rounded-2xl flex flex-col items-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="w-20 h-20 rounded-full bg-green-500/30 flex items-center justify-center mb-4"
                >
                  <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold text-white mb-2"
                >
                  Wallet Connected!
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-300 text-center"
                >
                  You now have access to the GENEForge platform
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div variants={itemVariants}>
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 sm:mb-6"
            style={{
              background: 'linear-gradient(to right, #4F46E5, #B16CEA, #00CCFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 100%'
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            Connect Wallet
          </motion.h1>
        </motion.div>
        
        <motion.p 
          variants={itemVariants}
          className="text-center text-gray-300 mb-8 max-w-xl mx-auto text-sm sm:text-base"
        >
          Connect your wallet to interact with the GENEForge CRISPR platform
        </motion.p>

        {/* Information Section - Collapsible */}
        <motion.div 
          variants={itemVariants}
          className="mb-6 rounded-lg overflow-hidden bg-black/20 border border-indigo-600/20"
        >
          <button 
            className="w-full flex items-center justify-between p-4 bg-indigo-900/20 text-left transition-colors hover:bg-indigo-900/30"
            onClick={() => toggleSection('info')}
          >
            <div className="flex items-center gap-2">
              <Info size={16} className="text-cyan-400 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-white">
                How Your Data is Stored on the Blockchain
              </h2>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {expandedSection === 'info' ? (
                <ChevronUp size={18} className="text-indigo-400" />
              ) : (
                <ChevronDown size={18} className="text-indigo-400" />
              )}
            </motion.div>
          </button>
          
          <AnimatePresence initial={false}>
            {expandedSection === 'info' && (
              <motion.div
                variants={sectionVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="overflow-hidden"
              >
                <div className="p-4">
                  <motion.p 
                    variants={itemVariants}
                    className="text-sm text-gray-300 mb-4"
                  >
                    Your genomic research data is securely stored on the Base blockchain, providing immutable, permanent records with the following benefits:
                  </motion.p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(0, 204, 255, 0.3)' }}
                      className="p-3 rounded bg-gradient-to-br from-black/50 to-cyan-950/30 border border-cyan-600/30 transition-all"
                    >
                      <h3 className="text-sm font-medium text-cyan-400 mb-1">Immutability</h3>
                      <p className="text-xs text-gray-300">
                        Once recorded, data cannot be altered or deleted, ensuring research integrity.
                      </p>
                    </motion.div>
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(177, 108, 234, 0.3)' }}
                      className="p-3 rounded bg-gradient-to-br from-black/50 to-fuchsia-950/30 border border-fuchsia-600/30 transition-all"
                    >
                      <h3 className="text-sm font-medium text-fuchsia-400 mb-1">Security</h3>
                      <p className="text-xs text-gray-300">
                        Cryptographic security protects data authenticity and researcher attribution.
                      </p>
                    </motion.div>
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(0, 204, 255, 0.3)' }}
                      className="p-3 rounded bg-gradient-to-br from-black/50 to-cyan-950/30 border border-cyan-600/30 transition-all"
                    >
                      <h3 className="text-sm font-medium text-cyan-400 mb-1">Traceability</h3>
                      <p className="text-xs text-gray-300">
                        Full audit trail of all genomic research activities with timestamps.
                      </p>
                    </motion.div>
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(177, 108, 234, 0.3)' }}
                      className="p-3 rounded bg-gradient-to-br from-black/50 to-fuchsia-950/30 border border-fuchsia-600/30 transition-all"
                    >
                      <h3 className="text-sm font-medium text-fuchsia-400 mb-1">Collaboration</h3>
                      <p className="text-xs text-gray-300">
                        Access controls allow secure collaboration while maintaining data ownership.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Network Information Section - Collapsible */}
        <motion.div 
          variants={itemVariants}
          className="mb-6 rounded-lg overflow-hidden bg-black/20 border border-amber-600/20"
        >
          <button 
            className="w-full flex items-center justify-between p-4 bg-amber-900/20 text-left transition-colors hover:bg-amber-900/30"
            onClick={() => toggleSection('network')}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
              <h2 className="text-base font-semibold text-amber-400">
                Network Information
              </h2>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {expandedSection === 'network' ? (
                <ChevronUp size={18} className="text-amber-400" />
              ) : (
                <ChevronDown size={18} className="text-amber-400" />
              )}
            </motion.div>
          </button>
          
          <AnimatePresence initial={false}>
            {expandedSection === 'network' && (
              <motion.div
                variants={sectionVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="overflow-hidden"
              >
                <div className="p-4 bg-amber-950/30 border-t border-amber-900/30">
                  <motion.p 
                    variants={itemVariants}
                    className="text-xs text-gray-300 mb-2"
                  >
                    This platform stores data on the <span className="text-amber-400 font-medium">Base Sepolia Testnet</span> (Chain ID: 84532). Your wallet may prompt you to switch networks when submitting data.
                  </motion.p>
                  <motion.p 
                    variants={itemVariants}
                    className="text-xs text-gray-300 flex items-center gap-1"
                  >
                    <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
                    <span>Need testnet ETH? Get it from the <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Base Sepolia Faucet</a></span>
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* How it works Section - Collapsible */}
        <motion.div 
          variants={itemVariants}
          className="mb-8 rounded-lg overflow-hidden bg-black/20 border border-indigo-600/20"
        >
          <button 
            className="w-full flex items-center justify-between p-4 bg-indigo-900/20 text-left transition-colors hover:bg-indigo-900/30"
            onClick={() => toggleSection('howItWorks')}
          >
            <div className="flex items-center gap-2">
              <Info size={16} className="text-indigo-400 flex-shrink-0" />
              <h2 className="text-base font-semibold text-white">
                How it works
              </h2>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {expandedSection === 'howItWorks' ? (
                <ChevronUp size={18} className="text-indigo-400" />
              ) : (
                <ChevronDown size={18} className="text-indigo-400" />
              )}
            </motion.div>
          </button>
          
          <AnimatePresence initial={false}>
            {expandedSection === 'howItWorks' && (
              <motion.div
                variants={sectionVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="overflow-hidden"
              >
                <div className="p-4 bg-indigo-900/10">
                  <ol className="text-xs text-gray-300 space-y-2 list-none">
                    {[
                      'Fill out the required information in the forms below',
                      'Submit by clicking the register button',
                      'Approve the transaction in your connected wallet',
                      'Switch to Base network if prompted by your wallet',
                      'Your data is permanently stored on the Base blockchain',
                      'A transaction receipt confirms successful storage'
                    ].map((step, index) => (
                      <motion.li 
                        key={index}
                        variants={itemVariants}
                        className="flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-5 h-5 rounded-full bg-indigo-900/50 flex items-center justify-center border border-indigo-500/50 text-xs font-medium text-indigo-400">
                            {index + 1}
                          </div>
                        </div>
                        <span>{step}</span>
                      </motion.li>
                    ))}
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p 
          variants={itemVariants}
          className="text-center text-sm mb-4 text-indigo-200"
        >
          Choose a wallet to connect
        </motion.p>
        
        {/* Wallet connection buttons - Full width on mobile, side by side on larger screens */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(79, 70, 229, 0.5)' }}
            whileTap={{ scale: 0.97 }}
            className="relative overflow-hidden px-6 py-4 rounded-lg flex items-center justify-center gap-3 text-white font-medium bg-gradient-to-r from-indigo-600 to-indigo-700 border border-indigo-500/30"
            onClick={() => connectWallet('metamask')}
            disabled={isConnecting}
          >
            {/* Button glow effect */}
            <motion.div 
              className="absolute inset-0 -z-10"
              animate={{
                background: [
                  'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.4) 0%, rgba(0, 0, 0, 0) 50%)',
                  'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.6) 0%, rgba(0, 0, 0, 0) 70%)',
                  'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.4) 0%, rgba(0, 0, 0, 0) 50%)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {isConnecting ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <motion.div 
                animate={{ y: [0, -2, 0] }} 
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                  alt="MetaMask" 
                  className="w-6 h-6"
                />
              </motion.div>
            )}
            <span>Connect MetaMask</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(29, 78, 216, 0.5)' }}
            whileTap={{ scale: 0.97 }}
            className="relative overflow-hidden px-6 py-4 rounded-lg flex items-center justify-center gap-3 text-white font-medium bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-500/30"
            onClick={() => connectWallet('coinbase')}
            disabled={isConnecting}
          >
            {/* Button glow effect */}
            <motion.div 
              className="absolute inset-0 -z-10"
              animate={{
                background: [
                  'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.4) 0%, rgba(0, 0, 0, 0) 50%)',
                  'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.6) 0%, rgba(0, 0, 0, 0) 70%)',
                  'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.4) 0%, rgba(0, 0, 0, 0) 50%)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {isConnecting ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <motion.div 
                animate={{ y: [0, -2, 0] }} 
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              >
                <img 
                  src="https://static.alchemyapi.io/images/cw3d/Icon/coinbase-wallet.svg" 
                  alt="Coinbase Wallet" 
                  className="w-6 h-6"
                />
              </motion.div>
            )}
            <span>Connect Coinbase Wallet</span>
          </motion.button>
        </motion.div>
        
        {/* Testnet ETH section - Collapsible */}
        <motion.div 
          variants={itemVariants}
          className="rounded-lg overflow-hidden bg-black/20 border border-orange-600/20"
        >
          <button 
            className="w-full flex items-center justify-between p-4 bg-orange-900/20 text-left transition-colors hover:bg-orange-900/30"
            onClick={() => toggleSection('testnetEth')}
          >
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-orange-400 flex-shrink-0" />
              <h2 className="text-base font-semibold text-orange-400">
                Get Testnet ETH
              </h2>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {expandedSection === 'testnetEth' ? (
                <ChevronUp size={18} className="text-orange-400" />
              ) : (
                <ChevronDown size={18} className="text-orange-400" />
              )}
            </motion.div>
          </button>
          
          <AnimatePresence initial={false}>
            {expandedSection === 'testnetEth' && (
              <motion.div
                variants={sectionVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="overflow-hidden"
              >
                <div className="p-4 bg-orange-950/20 border-t border-orange-900/30">
                  <motion.p 
                    variants={itemVariants}
                    className="text-xs text-gray-300 mb-2"
                  >
                    You'll need testnet ETH to submit transactions
                  </motion.p>
                  <motion.p 
                    variants={itemVariants}
                    className="text-xs text-gray-300 mb-4"
                  >
                    To interact with the blockchain, you need Base Sepolia testnet ETH. Follow these steps to get free test ETH:
                  </motion.p>
                  <motion.ol 
                    variants={itemVariants}
                    className="text-xs text-gray-300 space-y-2 list-none mb-4"
                  >
                    {[
                      'Connect your wallet using the option above',
                      'Visit the Base Sepolia Faucet',
                      'Connect the same wallet on the faucet site',
                      'Complete the verification and request testnet ETH',
                      'Return to this site and start submitting data!'
                    ].map((step, index) => (
                      <motion.li 
                        key={index}
                        variants={itemVariants}
                        className="flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-5 h-5 rounded-full bg-orange-900/50 flex items-center justify-center border border-orange-500/50 text-xs font-medium text-orange-400">
                            {index + 1}
                          </div>
                        </div>
                        <span>{step}</span>
                      </motion.li>
                    ))}
                  </motion.ol>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="mt-2"
                  >
                    <motion.a 
                      href="https://sepoliafaucet.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg text-white font-medium text-center transition-all"
                      whileHover={{ 
                        scale: 1.02, 
                        boxShadow: '0 0 25px rgba(234, 88, 12, 0.5)' 
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Zap size={16} />
                        <span>Get Free Testnet ETH</span>
                        <ExternalLink size={14} />
                      </div>
                    </motion.a>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Footer note */}
        <motion.p 
          variants={itemVariants} 
          className="text-center text-xs text-gray-500 mt-8"
        >
          ChainSight: Verifiable Science on an Immutable Foundation
        </motion.p>
      </motion.div>
    </div>
  );
}; 