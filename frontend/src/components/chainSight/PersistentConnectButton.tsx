'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainSightStore } from '@/lib/stores/chainSightStore';
import { useWalletAccount } from '@/lib/hooks/use-wallet-account';
import { useAuthState } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Wallet, LogIn } from 'lucide-react';

export function PersistentConnectButton() {
  const { address, isConnected } = useWalletAccount();
  const { setWalletConnected } = useChainSightStore();
  const { isAuthenticated } = useAuthState();
  const router = useRouter();
  
  useEffect(() => {
    if (address && isConnected) {
      setWalletConnected(true);
    } else {
      setWalletConnected(false);
    }
  }, [address, isConnected, setWalletConnected]);

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <div className="w-full">
      {isAuthenticated ? (
        // Show wallet connect button only when authenticated
        <ConnectButton 
          label="Connect Wallet" 
          accountStatus="address"
        />
      ) : (
        // Show sign in button and message when not authenticated
        <div className="space-y-2">
          <Button 
            variant="default" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
            onClick={handleSignIn}
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In Required</span>
          </Button>
          <div className="text-xs text-center text-gray-400">
            Authentication required before connecting wallet
          </div>
        </div>
      )}
    </div>
  );
} 