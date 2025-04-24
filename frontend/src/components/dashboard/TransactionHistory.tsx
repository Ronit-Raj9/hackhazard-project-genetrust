'use client';

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { 
  ExternalLink, AlertCircle, Clock, CheckCircle, XCircle, 
  Filter, ArrowLeft, ArrowRight, Loader2, DownloadCloud, RefreshCw 
} from 'lucide-react';
import { useTransactionHistory, TransactionType, TransactionStatus, Transaction } from '@/lib/hooks/useTransactionHistory';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionHistoryProps {
  compact?: boolean;
  limit?: number;
}

export const TransactionHistory = ({ 
  compact = false, 
  limit 
}: TransactionHistoryProps) => {
  const { isAuthenticated, wallet } = useAuth();
  const { 
    transactions, isLoading, error,
    fetchTransactions, syncWithBackend,
    totalTransactions, totalPages, currentPage,
    goToPage, exportToCsv, clearHistory
  } = useTransactionHistory();

  const [refreshing, setRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await syncWithBackend();
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your transaction history? This cannot be undone.')) {
      await clearHistory();
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await exportToCsv();
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initData = async () => {
      if (isAuthenticated && wallet.isConnected && isMounted) {
        await syncWithBackend();
        await fetchTransactions();
      }
    };
    
    initData();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, wallet.isConnected, syncWithBackend, fetchTransactions]);
  
  // Get types for coloring
  const typeColors: Record<TransactionType, string> = {
    sample: 'bg-emerald-900/20 text-emerald-300 border-emerald-500/30',
    experiment: 'bg-blue-900/20 text-blue-300 border-blue-500/30',
    access: 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30',
    workflow: 'bg-purple-900/20 text-purple-300 border-purple-500/30',
    ip: 'bg-pink-900/20 text-pink-300 border-pink-500/30',
    other: 'bg-gray-900/20 text-gray-300 border-gray-700/30',
  };
  
  const typeLabels: Record<TransactionType, string> = {
    sample: 'Sample',
    experiment: 'Experiment',
    access: 'Access Control',
    workflow: 'Workflow',
    ip: 'IP Rights',
    other: 'Other',
  };
  
  const statusColors: Record<TransactionStatus, string> = {
    pending: 'text-yellow-400',
    confirmed: 'text-green-400',
    failed: 'text-red-400',
  };
  
  const statusIcons: Record<TransactionStatus, React.ReactNode> = {
    pending: <Clock className="h-3 w-3 text-yellow-400" />,
    confirmed: <CheckCircle className="h-3 w-3 text-green-400" />,
    failed: <XCircle className="h-3 w-3 text-red-400" />,
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-indigo-500/30 bg-indigo-900/10 p-6 text-center shadow-md backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center shadow-inner">
            <AlertCircle className="h-6 w-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Authentication Required</h3>
          <p className="text-gray-400 text-sm max-w-md">
            Please log in to view your transaction history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">Transaction History</h2>
          {totalTransactions > 0 && (
            <Badge variant="outline" className="bg-indigo-900/30 text-indigo-300 border-indigo-500/30">
              {totalTransactions} transactions
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            disabled={isLoading || refreshing}
            className="p-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-white rounded-md border border-indigo-500/30 transition-colors shadow-sm"
            title="Refresh transactions"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleExport}
            disabled={isLoading || exportLoading || transactions.length === 0}
            className="p-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-white rounded-md border border-indigo-500/30 transition-colors shadow-sm"
            title="Export to CSV"
          >
            {exportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DownloadCloud className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col space-y-3 p-4 border border-dashed border-indigo-500/20 rounded-lg bg-black/20 backdrop-blur-sm"
          >
            <div className="space-y-3 w-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-3 bg-indigo-900/10 rounded-md border border-indigo-500/10">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-red-500/30 bg-red-900/10 p-3 shadow-md"
          >
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </motion.div>
        ) : transactions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 border border-dashed border-indigo-500/20 rounded-lg bg-black/20 backdrop-blur-sm"
          >
            <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-2 shadow-inner">
              <AlertCircle className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-base font-medium text-white mb-1">No transactions found</h3>
            <p className="text-gray-400 text-sm">Your transaction history will appear here</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="rounded-lg overflow-hidden border border-indigo-500/30 shadow-lg bg-gradient-to-b from-indigo-950/20 to-black/40">
              <div className="bg-gradient-to-r from-indigo-800/20 to-indigo-600/10 border-b border-indigo-500/30 p-3">
                <div className="text-xs uppercase tracking-wider text-indigo-300 font-medium">Recent Transactions</div>
              </div>
              <div className="overflow-x-auto bg-black/40 backdrop-blur-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-indigo-950/50 border-b border-indigo-500/20">
                      <th className="font-medium py-2.5 px-4 text-left text-indigo-300">Transaction</th>
                      {!compact && <th className="font-medium py-2.5 px-4 text-left text-indigo-300">Type</th>}
                      <th className="font-medium py-2.5 px-4 text-left text-indigo-300">Hash</th>
                      <th className="font-medium py-2.5 px-4 text-left text-indigo-300">Time</th>
                      <th className="font-medium py-2.5 px-4 text-left text-indigo-300">Status</th>
                      <th className="font-medium py-2.5 px-4 text-left text-indigo-300">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {transactions.map((tx, index) => {
                        // Ensure type safety for the transaction object
                        const type = tx.type as TransactionType;
                        const status = tx.status as TransactionStatus;
                        
                        return (
                          <motion.tr 
                            key={tx.hash} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              transition: { delay: index * 0.05 }
                            }}
                            className={`border-b border-indigo-500/10 hover:bg-indigo-800/10 transition-colors`}
                          >
                            <td className="py-3 px-4 align-middle font-medium text-white">{tx.description}</td>
                            {!compact && (
                              <td className="py-3 px-4 align-middle">
                                <Badge variant="outline" className={`px-2 py-0.5 ${typeColors[type]}`}>
                                  {typeLabels[type]}
                                </Badge>
                              </td>
                            )}
                            <td className="py-3 px-4 align-middle font-mono text-xs text-gray-400">
                              {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                            </td>
                            <td className="py-3 px-4 align-middle text-xs text-gray-400">
                              {new Date(tx.timestamp instanceof Date ? tx.timestamp.getTime() : tx.timestamp).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <div className="flex items-center">
                                {statusIcons[status]}
                                <span className={`ml-1 text-xs ${statusColors[status]}`}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <a 
                                href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center transition-colors group"
                              >
                                <span className="text-xs">View</span>
                                <ExternalLink className="h-3 w-3 ml-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </a>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div className="p-3 border-t border-indigo-500/30 bg-gradient-to-r from-indigo-900/20 to-indigo-900/10 flex justify-between items-center">
                  <div className="text-xs text-gray-400">
                    Showing {transactions.length} of {totalTransactions} transactions
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                        className={`p-1.5 rounded-md ${
                          currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30'
                        } transition-colors`}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <span className="text-white text-xs bg-indigo-900/30 px-2 py-1 rounded-md border border-indigo-500/20">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading}
                        className={`p-1.5 rounded-md ${
                          currentPage === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30'
                        } transition-colors`}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {transactions.length > 0 && (
                <div className="p-3 border-t border-indigo-500/30 flex justify-end">
                  <button 
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-white text-xs rounded-md border border-red-500/30 transition-colors"
                    onClick={handleClearHistory}
                  >
                    Clear History
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 