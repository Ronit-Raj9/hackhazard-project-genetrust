'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface ExperimentData {
  specimenId: string;
  location: string;
  notes: string;
}

export const RegisterExperiment = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExperimentData>({
    specimenId: '',
    location: '',
    notes: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Experiment data:', formData);
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setFormData({
          specimenId: '',
          location: '',
          notes: '',
        });
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error registering experiment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xl font-bold text-white">Register Experiment Location & Notes</h2>
      </div>
      <p className="text-sm text-gray-300 mb-6">
        Track experiment location and notes for genomic samples
      </p>

      {showSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-900/30 border border-green-700 rounded-lg mb-6"
        >
          <h3 className="text-green-400 font-medium mb-1">Experiment Registration Successful!</h3>
          <p className="text-sm text-gray-300">
            Your experiment details have been permanently recorded on the blockchain. The transaction is being processed and will be confirmed shortly.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                Specimen ID
                <span title="ID of the specimen used in this experiment" className="cursor-help text-gray-500">
                  <Info size={14} />
                </span>
              </label>
              <input
                type="text"
                name="specimenId"
                value={formData.specimenId}
                onChange={handleChange}
                placeholder="Enter the specimen ID number"
                className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                Location
                <span title="Location where experiment was conducted" className="cursor-help text-gray-500">
                  <Info size={14} />
                </span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter experiment location (e.g., Lab A, Site B)"
                className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                Experiment Notes
                <span title="Detailed information about the experiment" className="cursor-help text-gray-500">
                  <Info size={14} />
                </span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Protocol details, conditions, results, and observations"
                className="w-full px-3 py-2 h-40 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-900/20 rounded-lg border border-blue-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-blue-400" />
              <h3 className="text-sm font-medium text-blue-400">Experiment Record</h3>
            </div>
            <p className="text-xs text-gray-300 mb-1">
              This will create a permanent record of the experiment. Your wallet address will be recorded as the researcher.
            </p>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium flex items-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-purple-500 hover:to-indigo-500'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                'Register Experiment'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}; 