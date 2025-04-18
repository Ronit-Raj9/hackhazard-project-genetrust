'use client';

import { ReactNode } from 'react';
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

  // Use a fixed WalletConnect projectId
  const projectId = 'c86f23da1913707381b31528a79c3e23';

  // Set up connectors with proper type
  const { connectors } = getDefaultWallets({
    appName: 'GeneForge Dashboard',
    projectId,
  });

  // Create config with proper chain typing
  const config = createConfig({
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http('https://sepolia.base.org'),
    },
    connectors,
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
} 