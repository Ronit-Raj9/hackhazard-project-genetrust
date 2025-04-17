import { create } from 'zustand';

export type ExperimentType = 'prediction' | 'sensor' | 'manual';
export type ViewMode = 'grid' | 'helix';
export type SortOrder = 'newest' | 'oldest' | 'recordId';

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

interface ChainSightState {
  // UI States
  isSequencerOpen: boolean;
  isMicroscopeOpen: boolean;
  isSettingsOpen: boolean;
  activeRecordId: string | null;
  isLoading: boolean;
  viewMode: ViewMode;
  
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
  // Additional mock data loading function for demo purposes
  loadMockData: () => void;
}

export const useChainSightStore = create<ChainSightState>((set) => ({
  // UI States
  isSequencerOpen: false,
  isMicroscopeOpen: false,
  isSettingsOpen: false,
  activeRecordId: null,
  isLoading: false,
  viewMode: 'grid',
  
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
  
  // Mock data for demo purposes
  loadMockData: () => {
    set({ isLoading: true });
    
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
        isLoading: false 
      });
    }, 1500);
  },
})); 