'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainSightStore } from '@/lib/stores/chainSightStore';
import { useWalletAccount } from '@/lib/hooks/use-wallet-account';
import { useEffect } from 'react';

export function PersistentConnectButton() {
  const { address, isConnected } = useWalletAccount();
  const { setWalletConnected } = useChainSightStore();
  
  useEffect(() => {
    if (address && isConnected) {
      setWalletConnected(true);
    } else {
      setWalletConnected(false);
    }
  }, [address, isConnected, setWalletConnected]);

  return (
    <div className="w-full">
      <ConnectButton label="Connect Wallet" accountStatus="address" />
    </div>
  );
} 