'use client';

import { ReactNode, useEffect, useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface WalletProviderWrapperProps {
  children?: ReactNode;
}

// Set up a simple provider for client-side only wallet connections
export default function WalletProviderWrapper({ children }: WalletProviderWrapperProps) {
  // Create a query client for React Query
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  // Use state to handle the config setup with error handling
  const [config, setConfig] = useState<any>(null);
  const [isConfigError, setIsConfigError] = useState(false);

  useEffect(() => {
    try {
      // Use a fixed WalletConnect projectId
      const projectId = 'c86f23da1913707381b31528a79c3e23';

      // Set up connectors with proper type and error handling
      let connectors: any[] = [];
      try {
        const walletData = getDefaultWallets({
          appName: 'GeneTrust Dashboard',
          projectId,
        });
        
        connectors = walletData?.connectors || [];
      } catch (error) {
        console.error('Error setting up wallet connectors:', error);
        // Continue with empty connectors array
      }

      // Create config with proper chain typing
      const wagmiConfig = createConfig({
        chains: [baseSepolia],
        transports: {
          [baseSepolia.id]: http('https://sepolia.base.org'),
        },
        connectors,
      });

      setConfig(wagmiConfig);
    } catch (error) {
      console.error('Error creating wallet config:', error);
      setIsConfigError(true);
    }
  }, []);

  // Show loading or error state if needed
  if (isConfigError) {
    return (
      <div className="bg-red-900/20 p-4 rounded-md m-4 border border-red-800">
        <p className="text-red-300">Error initializing wallet connection. 
          The application will continue to function without wallet features.</p>
        {children}
      </div>
    );
  }

  if (!config) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
} 