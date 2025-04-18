'use client';

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Create a context to track if WalletConnect has been initialized
const WalletInitContext = createContext(false);
export const useWalletInit = () => useContext(WalletInitContext);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Use a fixed WalletConnect projectId
const projectId = 'c86f23da1913707381b31528a79c3e23';

// Configure chains
const chains = [baseSepolia];

// Create wagmi config but delay actual initialization
let config: any = null;
let connectors: any = null;

// Memoize the config creation to prevent multiple initializations
const getConfig = () => {
  if (!config) {
    // Set up connectors with proper type
    const walletConfig = getDefaultWallets({
      appName: 'ChainSight',
      projectId,
    });
    
    connectors = walletConfig.connectors;
    
    // Create wagmi config with proper chain typing
    config = createConfig({
      chains: [baseSepolia],
      transports: {
        [baseSepolia.id]: http('https://sepolia.base.org'),
      },
      connectors,
    });
  }
  return config;
};

export function Providers({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  // Only initialize on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render providers during SSR
  if (!isClient) {
    return <>{children}</>;
  }

  const wagmiConfig = getConfig();

  return (
    <WalletInitContext.Provider value={true}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </WalletInitContext.Provider>
  );
} 