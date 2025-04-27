import { useState, useCallback, useEffect } from 'react';
import { transactionAPI } from '../api';
import { useAuth } from './useAuth';

export type TransactionType = 'sample' | 'experiment' | 'access' | 'workflow' | 'ip' | 'other';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface Transaction {
  _id?: string;
  hash: string;
  description: string;
  type: TransactionType;
  timestamp: number | Date;
  status: TransactionStatus;
  blockNumber?: number;
  gasUsed?: number;
  metadata?: Record<string, any>;
  entityId?: string;
}

export interface TransactionFilter {
  type?: TransactionType | TransactionType[];
  status?: TransactionStatus | TransactionStatus[];
  fromDate?: Date;
  toDate?: Date;
  entityId?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface UseDashboardTransactionsResult {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  totalTransactions: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  fetchTransactions: (filters?: TransactionFilter) => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  clearTransactions: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

export function useDashboardTransactions(initialFilters?: TransactionFilter): UseDashboardTransactionsResult {
  const { isAuthenticated } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialFilters?.page || 1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialFilters?.limit || 10);
  const [filters, setFilters] = useState<TransactionFilter>(initialFilters || {});
  
  // Fetch transactions with filters
  const fetchTransactions = useCallback(async (newFilters?: TransactionFilter) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update filters if new ones are provided
      const currentFilters = newFilters ? { ...filters, ...newFilters } : filters;
      setFilters(currentFilters);
      
      // If page is provided, update current page
      if (newFilters?.page) {
        setCurrentPage(newFilters.page);
      }
      
      // If limit is provided, update page size
      if (newFilters?.limit) {
        setPageSize(newFilters.limit);
      }
      
      const response = await transactionAPI.getUserTransactions({
        ...currentFilters,
        page: newFilters?.page || currentPage,
        limit: newFilters?.limit || pageSize
      });
      
      const { transactions, total, page, limit, totalPages } = response.data.data;
      
      setTransactions(transactions);
      setTotalTransactions(total);
      setCurrentPage(page);
      setPageSize(limit);
      setTotalPages(totalPages);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, filters, currentPage, pageSize]);
  
  // Go to a specific page
  const goToPage = useCallback(async (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    await fetchTransactions({ ...filters, page });
  }, [fetchTransactions, filters, totalPages]);
  
  // Clear transaction history
  const clearTransactions = useCallback(async () => {
    try {
      await transactionAPI.clearTransactions();
      
      // Clear local state
      setTransactions([]);
      setTotalTransactions(0);
      setCurrentPage(1);
      setTotalPages(1);
      
      return Promise.resolve();
    } catch (err) {
      console.error('Error clearing transaction history:', err);
      setError('Failed to clear transaction history');
      return Promise.reject(err);
    }
  }, []);

  // Refresh transactions (simple refresh without additional parameters)
  const refreshTransactions = useCallback(async () => {
    await fetchTransactions();
  }, [fetchTransactions]);
  
  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated, fetchTransactions]);
  
  return {
    transactions,
    isLoading,
    error,
    totalTransactions,
    currentPage,
    totalPages,
    pageSize,
    fetchTransactions,
    goToPage,
    clearTransactions,
    refreshTransactions
  };
} 