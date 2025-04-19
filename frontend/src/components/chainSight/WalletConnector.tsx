'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle, ChevronDown, ChevronUp, Zap, ExternalLink, Check, Wallet, LogIn } from 'lucide-react';
import { DNA_COLORS } from '@/lib/constants/designTokens';
import { getWalletClient, getAccount, signMessage, connect, disconnect } from 'wagmi/actions';
import { useWalletAccount } from '@/lib/hooks/use-wallet-account';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainSightStore } from '@/lib/stores/chainSightStore';
import { useChainId, useAccount, useBalance, useDisconnect } from 'wagmi';
import { PersistentConnectButton } from './PersistentConnectButton';
import { useAuthState } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOutIcon, CopyIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatEther } from 'ethers';
import { isEmpty } from 'lodash';

// Component animations
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 15, stiffness: 80 } }
};

const cardVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } }
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } }
};

export interface WalletConnectorProps {
  containerClassName?: string;
}

const shortenAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const WalletConnector: React.FC<WalletConnectorProps> = ({
  containerClassName = "",
}) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { setWalletConnected } = useChainSightStore();
  const { isAuthenticated } = useAuthState();
  const { toast } = useToast();
  
  const balanceResult = useBalance({
    address: address,
    enabled: Boolean(address),
  });
  
  const balance = balanceResult.data?.value;
  const nativeToken = balanceResult.data?.symbol || 'ETH';
  
  const onDisconnect = () => {
    disconnect();
    setWalletConnected(false);
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Success",
        description: "Address copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      setWalletConnected(true);
    } else {
      setWalletConnected(false);
    }
  }, [isConnected, address, setWalletConnected]);

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className={cn(containerClassName)}>
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          // Regular interactive wallet connector for authenticated users
          <motion.div
            key="authenticated"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {!isEmpty(address) ? (
              <Card className="bg-secondary/50 backdrop-blur-md border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Wallet className="h-4 w-4 mr-2 text-indigo-400" />
                    Your Wallet
                  </CardTitle>
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      onClick={onDisconnect}
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 hover:border-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOutIcon className="h-4 w-4 text-red-400" />
                    </Button>
                  </motion.div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                      {shortenAddress(address as string)}
                    </div>
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-indigo-500/10"
                        onClick={() => copyToClipboard(address as string)}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-3 flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                    Balance:{' '}
                    {balance ? (
                      <span className="ml-1 font-semibold text-white">
                        {formatEther(balance)} {nativeToken}
                      </span>
                    ) : (
                      <span className="ml-1 animate-pulse">Loading...</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-muted/50 backdrop-blur-md border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Wallet className="h-4 w-4 mr-2 text-indigo-400" />
                    Connect your wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4">
                    Connect your wallet to interact with your smart contracts
                  </p>
                  <PersistentConnectButton />
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          // Authentication required state - enhanced
          <motion.div
            key="unauthenticated"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-md border border-amber-500/20 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
              
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-medium flex items-center text-amber-400">
                  <AlertTriangle className="mr-2 h-4 w-4 animate-pulse" />
                  Authentication Required
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <p className="text-xs text-gray-300 mb-6">
                  You must sign in to your account before connecting your wallet. Wallet connections 
                  are only available for authenticated users.
                </p>
                
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button 
                    onClick={navigateToLogin}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In Required
                  </Button>
                </motion.div>
              </CardContent>
              
              <CardFooter className="pt-2 pb-3 text-[10px] text-gray-500 italic relative z-10">
                Authentication required before connecting wallet
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletConnector; 