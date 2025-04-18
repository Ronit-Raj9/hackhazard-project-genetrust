'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useBlockchainStore } from '@/lib/store';

export function ExplanationText() {
  const { dataToVerify } = useBlockchainStore();
  const dataType = dataToVerify?.type || 'data';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Blockchain Verification
        </h2>
        
        <div className="space-y-4 text-gray-600">
          <p>
          GeneTrust AI Studio leverages blockchain technology to provide immutable, 
            tamper-proof records of your {dataType === 'prediction' ? 'CRISPR predictions' : 'lab monitoring data'}.
          </p>
          
          <h3 className="text-lg font-medium text-gray-700 mt-6">Benefits</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="font-medium">Immutability:</span> Once recorded on the blockchain, 
              your data cannot be altered or deleted, ensuring the integrity of your research.
            </li>
            <li>
              <span className="font-medium">Transparency:</span> Anyone can verify that your data 
              was logged at a specific point in time, without requiring access to your private systems.
            </li>
            <li>
              <span className="font-medium">Reproducibility:</span> Other researchers can validate 
              your experimental conditions or predictions, enhancing scientific reproducibility.
            </li>
            <li>
              <span className="font-medium">Ownership:</span> Your wallet address is associated with 
              the data, providing proof of your research ownership.
            </li>
          </ul>
          
          <h3 className="text-lg font-medium text-gray-700 mt-6">How It Works</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Review the data you wish to verify</li>
            <li>Click the "Verify Data on Blockchain" button</li>
            <li>Connect your Base wallet if prompted</li>
            <li>Approve the transaction in your wallet</li>
            <li>Once confirmed, you'll receive a transaction hash and link to view on the explorer</li>
          </ol>
          
          <p className="mt-4 text-sm text-gray-500">
            Note: Blockchain verification requires a small gas fee on the Base network.
          </p>
        </div>
      </Card>
    </motion.div>
  );
} 