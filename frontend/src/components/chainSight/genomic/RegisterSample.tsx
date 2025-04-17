'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, AlertCircle, FileSymlink } from 'lucide-react';

interface SampleData {
  sampleId: string;
  sampleName: string;
  sourceOrganism: string;
  geneSequence: string;
  targetGene: string;
  collectionDate: string;
  storageLocation: string;
  qualityScore: string;
}

export const RegisterSample = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [formData, setFormData] = useState<SampleData>({
    sampleId: '',
    sampleName: '',
    sourceOrganism: '',
    geneSequence: '',
    targetGene: '',
    collectionDate: '',
    storageLocation: '',
    qualityScore: '98',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate blockchain transaction
    try {
      // In real implementation, this would be a call to a blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTxHash('0x' + Math.random().toString(16).substring(2, 34));
      setSuccess(true);
    } catch (error) {
      console.error('Error registering sample:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-10"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Sample Successfully Registered</h3>
        <p className="text-gray-400 mb-6">Your CRISPR sample has been securely registered on the blockchain</p>
        
        <div className="bg-black/30 rounded-lg p-4 mx-auto max-w-md mb-6 border border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">Transaction Hash</span>
            <div className="flex items-center gap-1">
              <a 
                href={`https://etherscan.io/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 text-xs"
              >
                View on Explorer
              </a>
              <FileSymlink className="w-3 h-3 text-indigo-400" />
            </div>
          </div>
          <p className="text-gray-300 font-mono text-sm truncate">{txHash}</p>
        </div>
        
        <button 
          onClick={() => {
            setSuccess(false);
            setFormData({
              sampleId: '',
              sampleName: '',
              sourceOrganism: '',
              geneSequence: '',
              targetGene: '',
              collectionDate: '',
              storageLocation: '',
              qualityScore: '98',
            });
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
        >
          Register Another Sample
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-1">Register CRISPR Sample</h2>
        <p className="text-gray-400 text-sm">
          All sample data will be cryptographically signed and stored on the blockchain for integrity verification
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="sampleId" className="block text-sm font-medium text-gray-400 mb-1">Sample ID</label>
            <input
              type="text"
              id="sampleId"
              name="sampleId"
              required
              value={formData.sampleId}
              onChange={handleChange}
              placeholder="CRISPR-2023-001"
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="sampleName" className="block text-sm font-medium text-gray-400 mb-1">Sample Name</label>
            <input
              type="text"
              id="sampleName"
              name="sampleName"
              required
              value={formData.sampleName}
              onChange={handleChange}
              placeholder="Human CRISPR Cas9 Sample A"
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="sourceOrganism" className="block text-sm font-medium text-gray-400 mb-1">Source Organism</label>
            <input
              type="text"
              id="sourceOrganism"
              name="sourceOrganism"
              required
              value={formData.sourceOrganism}
              onChange={handleChange}
              placeholder="Homo sapiens"
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="targetGene" className="block text-sm font-medium text-gray-400 mb-1">Target Gene</label>
            <input
              type="text"
              id="targetGene"
              name="targetGene"
              required
              value={formData.targetGene}
              onChange={handleChange}
              placeholder="BRCA1"
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="collectionDate" className="block text-sm font-medium text-gray-400 mb-1">Collection Date</label>
            <input
              type="date"
              id="collectionDate"
              name="collectionDate"
              required
              value={formData.collectionDate}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="storageLocation" className="block text-sm font-medium text-gray-400 mb-1">Storage Location</label>
            <input
              type="text"
              id="storageLocation"
              name="storageLocation"
              required
              value={formData.storageLocation}
              onChange={handleChange}
              placeholder="Lab B, Freezer 3, Shelf 2"
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="geneSequence" className="block text-sm font-medium text-gray-400 mb-1">Gene Sequence</label>
          <textarea
            id="geneSequence"
            name="geneSequence"
            required
            value={formData.geneSequence}
            onChange={handleChange}
            rows={4}
            placeholder="ATCGATCGATCGATCG..."
            className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label htmlFor="qualityScore" className="block text-sm font-medium text-gray-400 mb-1">
            Quality Score: {formData.qualityScore}
          </label>
          <input
            type="range"
            id="qualityScore"
            name="qualityScore"
            min="50"
            max="100"
            value={formData.qualityScore}
            onChange={handleChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low Quality</span>
            <span>High Quality</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-900/30 flex-shrink-0 mr-4">
            <AlertCircle className="h-6 w-6 text-indigo-400" />
          </div>
          <p className="text-sm text-gray-400">
            By registering this sample, you confirm that you have the necessary rights to store this genomic data and agree to our data handling policies.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isSubmitting 
                ? 'bg-indigo-800/50 text-gray-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                Register Sample
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}; 