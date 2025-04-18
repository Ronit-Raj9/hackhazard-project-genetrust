import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
// Import the config we created in contracts.ts
import { config } from '../blockchain/contracts';
import { useChainSightStore } from '../stores/chainSightStore';
import { clearWalletClientCache } from '../../contracts/contract-service';

type WalletAccount = {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
};

export function useWalletAccount(): WalletAccount {
  // Use wagmi's useAccount hook directly for more reliable connection detection
  const { address, isConnected, isConnecting, isDisconnected, status } = useAccount();
  const { wallet, setWalletState, disconnectWallet } = useChainSightStore();

  // Use state to handle derived values and ensure reactivity
  const [account, setAccount] = useState<WalletAccount>({
    address: undefined,
    isConnected: false,
    isConnecting: false,
    isDisconnected: true
  });

  // Update account state whenever wagmi account changes
  useEffect(() => {
    console.log('Wallet connection status:', {
      address,
      isConnected,
      isConnecting,
      isDisconnected,
      status,
      storedAddress: wallet.address
    });
    
    // Synchronize with global state
    if (isConnected && address) {
      setWalletState({
        address,
        isConnected: true
      });
    } else if (!isConnected && wallet.isConnected) {
      // When disconnected, clear cached wallet client
      clearWalletClientCache();
      disconnectWallet();
    }
    
    setAccount({
      address,
      isConnected,
      isConnecting,
      isDisconnected
    });
  }, [address, isConnected, isConnecting, isDisconnected, status, wallet.isConnected, wallet.address, setWalletState, disconnectWallet]);

  return account;
} 