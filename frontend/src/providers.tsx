'use client';

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { AuthProvider } from '@/lib/contexts/AuthProvider';

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

// Get project ID from environment variables with fallback
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c86f23da1913707381b31528a79c3e23';

// Configure chains
const chains = [baseSepolia];

// Create a function to get the Wagmi configuration
const getWagmiConfig = () => {
  // Set up wallet connectors
  const { connectors } = getDefaultWallets({
    appName: 'GeneTrust Chain Explorer',
    projectId: projectId,
  });
  
  // Create wagmi config
  return createConfig({
    chains,
    transports: {
      [baseSepolia.id]: http('https://sepolia.base.org'),
    },
    connectors,
  });
};

export function Providers({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [wagmiConfig, setWagmiConfig] = useState<any>(null);

  // Only initialize on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
      // Initialize configuration on the client side
      try {
        const config = getWagmiConfig();
        setWagmiConfig(config);
      } catch (err) {
        console.error('Failed to initialize wallet configuration:', err);
      }
    }
  }, []);

  // Don't render wallet providers during SSR or while initializing
  if (!isClient || !wagmiConfig) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <WalletInitContext.Provider value={true}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </WalletInitContext.Provider>
  );
} 