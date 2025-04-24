import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import mockGenomicData from '@/lib/data/mockGenomicData';
import { transactionAPI } from '../api';

export type ExperimentType = 'prediction' | 'sensor' | 'manual';
export type ViewMode = 'grid' | 'helix';
export type SortOrder = 'newest' | 'oldest' | 'recordId';
export type TransactionType = 'sample' | 'experiment' | 'access' | 'workflow' | 'ip' | 'other';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface GenomicRecord {
  id: string;
  experimentType: ExperimentType;
  timestamp: number;
  loggedBy: string;
  blockNumber: number;
  txHash: string;
  geneSequence: {
    original: string;
    edited: string;
  };
  metadata: Record<string, any>;
  notes?: string;
  ipfsLink?: string;
  relatedRecords?: string[];
}

export interface Transaction {
  hash: string;
  timestamp: number;
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  blockNumber?: number;
  gasUsed?: number;
  entityId?: string;
}

export interface WalletState {
  address: string;
  isConnected: boolean;
  provider?: any;
}

interface ChainSightState {
  // UI States
  isSequencerOpen: boolean;
  isMicroscopeOpen: boolean;
  isSettingsOpen: boolean;
  activeRecordId: string | null;
  isLoading: boolean;
  viewMode: ViewMode;
  activeView: 'dashboard' | 'sequencer' | 'settings';
  hasWalletConnected: boolean;
  hasLoadedData: boolean;
  
  // Filter/Search States
  search: string;
  filters: {
    experimentTypes: ExperimentType[];
    dateRange: [number, number] | null;
    loggedBy: string | null;
  };
  sortOrder: SortOrder;
  
  // Records Data
  records: GenomicRecord[];
  
  // Settings
  theme: 'dark' | 'light';
  showTooltips: boolean;
  
  // Wallet State
  wallet: WalletState;
  
  // Transaction History
  transactionHistory: Transaction[];
  
  // Actions
  toggleSequencer: () => void;
  openMicroscope: (recordId: string) => void;
  closeMicroscope: () => void;
  toggleSettings: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSearch: (query: string) => void;
  toggleExperimentTypeFilter: (type: ExperimentType) => void;
  setDateRangeFilter: (range: [number, number] | null) => void;
  setLoggedByFilter: (address: string | null) => void;
  setSortOrder: (order: SortOrder) => void;
  addRecord: (record: GenomicRecord) => void;
  setWalletConnected: (isConnected: boolean) => void;
  setWalletState: (walletState: Partial<WalletState>) => void;
  connectWallet: (address: string, chainId: number) => void;
  disconnectWallet: () => void;
  // Additional mock data loading function for demo purposes
  loadMockData: () => void;
  addTransaction: (transaction: Transaction) => void;
  clearTransactionHistory: () => void;
  setTransactionStatus: (hash: string, status: TransactionStatus, blockData?: { blockNumber: number; gasUsed: number }) => void;
  setWallet: (walletState: WalletState) => void;
  syncWithBackend: () => Promise<void>;
}

// Use persist middleware to store state in localStorage
export const useChainSightStore = create<ChainSightState>()(
  persist(
    (set, get) => ({
      // UI States
      isSequencerOpen: false,
      isMicroscopeOpen: false,
      isSettingsOpen: false,
      activeRecordId: null,
      isLoading: false,
      viewMode: 'grid',
      activeView: 'dashboard',
      hasWalletConnected: false,
      hasLoadedData: false,
      
      // Wallet State
      wallet: {
        address: '',
        isConnected: false,
        provider: null
      },
      
      // Filter/Search States
      search: '',
      filters: {
        experimentTypes: ['prediction', 'sensor', 'manual'],
        dateRange: null,
        loggedBy: null,
      },
      sortOrder: 'newest',
      
      // Records Data
      records: [],
      
      // Settings
      theme: 'dark',
      showTooltips: true,
      
      // Transaction History
      transactionHistory: [],
      
      // Actions
      toggleSequencer: () => set((state) => ({ 
        isSequencerOpen: !state.isSequencerOpen,
        isMicroscopeOpen: false, // Close microscope if open
      })),
      
      openMicroscope: (recordId) => set(() => ({ 
        isMicroscopeOpen: true,
        activeRecordId: recordId,
        isSequencerOpen: false, // Close sequencer if open
      })),
      
      closeMicroscope: () => set(() => ({ 
        isMicroscopeOpen: false,
        activeRecordId: null,
      })),
      
      toggleSettings: () => set((state) => ({ 
        isSettingsOpen: !state.isSettingsOpen 
      })),
      
      setViewMode: (mode) => set(() => ({ viewMode: mode })),
      
      setSearch: (query) => set(() => ({ search: query })),
      
      toggleExperimentTypeFilter: (type) => set((state) => {
        const currentTypes = state.filters.experimentTypes;
        const newTypes = currentTypes.includes(type)
          ? currentTypes.filter(t => t !== type)
          : [...currentTypes, type];
        
        // Ensure we always have at least one filter active
        return { 
          filters: {
            ...state.filters,
            experimentTypes: newTypes.length ? newTypes : [type]
          }
        };
      }),
      
      setDateRangeFilter: (range) => set((state) => ({
        filters: {
          ...state.filters,
          dateRange: range
        }
      })),
      
      setLoggedByFilter: (address) => set((state) => ({
        filters: {
          ...state.filters,
          loggedBy: address
        }
      })),
      
      setSortOrder: (order) => set(() => ({ sortOrder: order })),
      
      addRecord: (record) => set((state) => ({
        records: [record, ...state.records]
      })),
      
      setWalletConnected: (isConnected) => set(() => ({ 
        hasWalletConnected: isConnected 
      })),
      
      // New wallet actions
      setWalletState: (walletState) => set((state) => ({ 
        wallet: { ...state.wallet, ...walletState } 
      })),
      
      connectWallet: (address, chainId) => set(() => ({ 
        wallet: {
          address,
          isConnected: true,
          chainId,
          connectedTimestamp: Date.now()
        },
        hasWalletConnected: true
      })),
      
      disconnectWallet: () => set((state) => ({ 
        wallet: {
          address: '',
          isConnected: false,
          provider: null
        },
        // Only update wallet connection status, not authentication status
        hasWalletConnected: false
      })),
      
      // Mock data for demo purposes
      loadMockData: () => {
        set(state => {
          // Skip if data is already loaded
          if (state.hasLoadedData || state.records.length > 0) {
            return state;
          }
          
          set({ isLoading: true });
          
          // Generate mock data only once
          setTimeout(() => {
            const mockRecords: GenomicRecord[] = Array.from({ length: 20 }).map((_, i) => ({
              id: `0x${Math.random().toString(16).slice(2, 10)}`,
              experimentType: ['prediction', 'sensor', 'manual'][Math.floor(Math.random() * 3)] as ExperimentType,
              timestamp: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
              loggedBy: `0x${Math.random().toString(16).slice(2, 42)}`,
              blockNumber: 12345678 + i,
              txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
              geneSequence: {
                original: `ATCG${Math.random().toString(36).slice(2, 20).toUpperCase()}`,
                edited: `ATCG${Math.random().toString(36).slice(2, 20).toUpperCase()}`,
              },
              metadata: {
                temperature: 37.2 + Math.random(),
                pressure: 101.3 + Math.random() * 2,
                sensorId: `SEN-${Math.floor(Math.random() * 1000)}`
              },
              notes: Math.random() > 0.3 ? `Research notes on gene editing experiment ${i+1}` : undefined,
              ipfsLink: Math.random() > 0.5 ? `ipfs://Qm${Math.random().toString(36).slice(2, 44)}` : undefined,
              relatedRecords: Math.random() > 0.7 ? [`0x${Math.random().toString(16).slice(2, 10)}`] : undefined,
            }));
            
            set({ 
              records: mockRecords,
              isLoading: false,
              hasLoadedData: true
            });
          }, 1500);
          
          return state;
        });
      },
      
      addTransaction: (transaction: Transaction) => {
        set((state) => {
          // Check if the transaction already exists
          const exists = state.transactionHistory.some(tx => tx.hash === transaction.hash);
          
          if (exists) {
            // Update existing transaction
            return {
              transactionHistory: state.transactionHistory.map(tx => 
                tx.hash === transaction.hash ? { ...tx, ...transaction } : tx
              )
            };
          } else {
            // Add new transaction at the beginning of the array
            const newHistory = [transaction, ...state.transactionHistory];
            
            // Try to save to backend if wallet is connected
            if (state.wallet.isConnected && state.wallet.address) {
              try {
                transactionAPI.createTransaction({
                  ...transaction,
                  walletAddress: state.wallet.address
                }).catch(err => {
                  console.warn('Failed to save transaction to backend:', err);
                });
              } catch (err) {
                console.warn('Error calling transaction API:', err);
              }
            }
            
            return { transactionHistory: newHistory };
          }
        });
      },
      
      setTransactionStatus: (hash: string, status: TransactionStatus, blockData?: { blockNumber: number; gasUsed: number }) => {
        set((state) => {
          const updatedHistory = state.transactionHistory.map(tx => 
            tx.hash === hash ? { ...tx, status, ...blockData } : tx
          );
          
          // Try to update status in backend if wallet is connected
          if (state.wallet.isConnected && state.wallet.address) {
            try {
              transactionAPI.updateTransactionStatus(hash, status, blockData)
                .catch(err => {
                  console.warn('Failed to update transaction status in backend:', err);
                });
            } catch (err) {
              console.warn('Error calling transaction API:', err);
            }
          }
          
          return { transactionHistory: updatedHistory };
        });
      },
      
      clearTransactionHistory: () => {
        // Try to clear in backend if wallet is connected
        if (get().wallet.isConnected) {
          try {
            transactionAPI.clearTransactions()
              .catch(err => {
                console.warn('Failed to clear transaction history in backend:', err);
              });
          } catch (err) {
            console.warn('Error calling transaction API:', err);
          }
        }
        
        set({ transactionHistory: [] });
      },
      
      setWallet: (walletState: WalletState) => {
        set({ wallet: walletState });
        
        // If connecting wallet, sync with backend
        if (walletState.isConnected && walletState.address) {
          get().syncWithBackend();
        }
      },
      
      syncWithBackend: async () => {
        const { wallet, transactionHistory } = get();
        
        if (!wallet.isConnected || !wallet.address) {
          console.log('Cannot sync with backend: wallet not connected');
          return;
        }
        
        try {
          // Fetch transactions from backend
          const response = await transactionAPI.getUserTransactions({
            walletAddress: wallet.address,
            limit: 100 // Get a large batch
          });
          
          const backendTransactions = response.data.data.transactions;
          
          // Merge local and backend transactions, preferring backend data
          // but keeping local transactions that aren't in the backend yet
          const backendHashes = new Set(backendTransactions.map((tx: any) => tx.hash));
          
          // Keep local transactions that aren't in backend
          const localOnlyTransactions = transactionHistory.filter(tx => !backendHashes.has(tx.hash));
          
          // Upload local-only transactions to backend
          for (const tx of localOnlyTransactions) {
            try {
              await transactionAPI.createTransaction({
                ...tx,
                walletAddress: wallet.address
              });
            } catch (err) {
              console.warn(`Failed to upload local transaction ${tx.hash} to backend:`, err);
            }
          }
          
          // Convert backend transactions to local format
          const formattedBackendTxs = backendTransactions.map((tx: any) => ({
            hash: tx.hash,
            timestamp: tx.timestamp ? new Date(tx.timestamp).getTime() : Date.now(),
            description: tx.description,
            type: tx.type as TransactionType,
            status: tx.status as TransactionStatus,
            blockNumber: tx.blockNumber,
            gasUsed: tx.gasUsed,
            entityId: tx.entityId
          }));
          
          // Sort transactions by timestamp (newest first)
          const mergedTransactions = [...formattedBackendTxs, ...localOnlyTransactions].sort(
            (a, b) => b.timestamp - a.timestamp
          );
          
          set({ transactionHistory: mergedTransactions });
          
        } catch (err) {
          console.error('Failed to sync with backend:', err);
        }
      }
    }),
    {
      name: 'chain-sight-storage',
      // Persist both transaction history and wallet state
      partialize: (state) => ({ 
        transactionHistory: state.transactionHistory,
        wallet: state.wallet,
        hasWalletConnected: state.hasWalletConnected
      })
    }
  )
); 