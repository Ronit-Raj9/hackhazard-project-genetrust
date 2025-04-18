'use client';

import { useChainSightStore, Transaction } from '@/lib/stores/chainSightStore';
import { ExternalLink, AlertCircle, Clock, CheckCircle, XCircle, Filter, DatabaseIcon, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface TransactionHistoryProps {
  compact?: boolean;
  limit?: number;
  showFilters?: boolean;
}

// Map of transaction types to friendly names
const typeLabels: Record<Transaction['type'], string> = {
  sample: 'Sample',
  experiment: 'Experiment',
  access: 'Access Control',
  workflow: 'Workflow',
  ip: 'IP Rights',
  other: 'Other'
};

// Map of status to icons
const statusIcons = {
  pending: <Clock className="h-4 w-4 text-yellow-400" />,
  confirmed: <CheckCircle className="h-4 w-4 text-green-400" />,
  failed: <XCircle className="h-4 w-4 text-red-400" />
};

export const TransactionHistory = ({ 
  compact = false, 
  limit,
  showFilters = true 
}: TransactionHistoryProps) => {
  const { transactionHistory, clearTransactionHistory } = useChainSightStore();
  const [typeFilter, setTypeFilter] = useState<Transaction['type'] | 'all'>('all');
  
  // Apply filters
  const filteredHistory = transactionHistory.filter(tx => 
    typeFilter === 'all' || tx.type === typeFilter
  );
  
  // Apply limit
  const displayedHistory = limit ? filteredHistory.slice(0, limit) : filteredHistory;
  
  if (displayedHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 border border-dashed border-indigo-500/20 rounded-lg bg-black/20">
        <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3">
          <AlertCircle className="h-6 w-6 text-indigo-400" />
        </div>
        <p className="text-gray-400 text-sm">No transaction history available</p>
        <p className="text-gray-500 text-xs mt-1">Transactions will appear here once you register a sample or perform other actions</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-lg overflow-hidden border border-indigo-500/30">
        <div className="p-4 border-b border-indigo-500/30 bg-indigo-900/20 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Transaction History</h3>
              <p className="text-xs text-gray-400">Blockchain transactions and their status</p>
            </div>
          </div>
          
          {showFilters && (
            <div className="flex space-x-2">
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as Transaction['type'] | 'all')}
                  className="appearance-none bg-indigo-900/30 text-white text-sm rounded-md px-3 py-1.5 pr-8 border border-indigo-600/30 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Types</option>
                  <option value="sample">Samples</option>
                  <option value="experiment">Experiments</option>
                  <option value="access">Access Control</option>
                  <option value="workflow">Workflow</option>
                  <option value="ip">IP Rights</option>
                  <option value="other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-400">
                  <Filter className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto bg-black/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-indigo-950/50 border-b border-indigo-500/20">
                <th className="font-medium p-3 text-left text-indigo-200">Transaction</th>
                {!compact && <th className="font-medium p-3 text-left text-indigo-200">Type</th>}
                <th className="font-medium p-3 text-left text-indigo-200">Hash</th>
                <th className="font-medium p-3 text-left text-indigo-200">Time</th>
                <th className="font-medium p-3 text-left text-indigo-200">Status</th>
                <th className="font-medium p-3 text-left text-indigo-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedHistory.map((tx, index) => (
                <tr key={tx.hash} className={index % 2 === 0 ? "bg-transparent" : "bg-indigo-900/10"}>
                  <td className="p-3 align-middle text-white">{tx.description}</td>
                  {!compact && (
                    <td className="p-3 align-middle">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'sample' ? 'bg-blue-900/30 text-blue-300' : 
                        tx.type === 'experiment' ? 'bg-purple-900/30 text-purple-300' : 
                        tx.type === 'access' ? 'bg-green-900/30 text-green-300' : 
                        tx.type === 'workflow' ? 'bg-amber-900/30 text-amber-300' : 
                        tx.type === 'ip' ? 'bg-pink-900/30 text-pink-300' : 
                        'bg-gray-900/30 text-gray-300'
                      }`}>
                        {typeLabels[tx.type]}
                      </span>
                    </td>
                  )}
                  <td className="p-3 align-middle font-mono text-xs text-gray-400">
                    {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                  </td>
                  <td className="p-3 align-middle text-xs text-gray-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 align-middle">
                    <div className="flex items-center">
                      {statusIcons[tx.status]}
                      <span className={`ml-1.5 text-xs ${
                        tx.status === 'pending' ? 'text-yellow-400' : 
                        tx.status === 'confirmed' ? 'text-green-400' : 
                        'text-red-400'
                      }`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 align-middle">
                    <a 
                      href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 flex items-center"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-indigo-500/30 bg-indigo-900/20 flex justify-end">
          <button 
            className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-white text-xs rounded-md border border-indigo-500/30 transition-colors"
            onClick={clearTransactionHistory}
          >
            Clear History
          </button>
        </div>
      </div>
    </div>
  );
}; 