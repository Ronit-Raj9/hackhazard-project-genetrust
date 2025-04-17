'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Info, Award, FileText } from 'lucide-react';

interface IPRightsData {
  title: string;
  inventors: string;
  description: string;
  rightType: 'patent' | 'trademark' | 'copyright';
}

export const IPRights = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<IPRightsData>({
    title: '',
    inventors: '',
    description: '',
    rightType: 'patent',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (rightType: 'patent' | 'trademark' | 'copyright') => {
    setFormData(prev => ({ ...prev, rightType }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('IP Rights data:', formData);
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setFormData({
          title: '',
          inventors: '',
          description: '',
          rightType: 'patent',
        });
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error registering IP rights:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xl font-bold text-white">Register Intellectual Property Rights</h2>
      </div>
      <p className="text-sm text-gray-300 mb-6">
        Record and protect intellectual property claims for genomic research
      </p>

      {showSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-900/30 border border-green-700 rounded-lg mb-6"
        >
          <h3 className="text-green-400 font-medium mb-1">IP Rights Registration Successful!</h3>
          <p className="text-sm text-gray-300">
            Your intellectual property claim has been permanently recorded on the blockchain with a timestamp. This can serve as evidence for priority of discovery.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                Title of IP
                <span title="Name of the intellectual property" className="cursor-help text-gray-500">
                  <Info size={14} />
                </span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter title of intellectual property"
                className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                Inventor(s) / Creator(s)
                <span title="Names of all inventors or creators" className="cursor-help text-gray-500">
                  <Info size={14} />
                </span>
              </label>
              <input
                type="text"
                name="inventors"
                value={formData.inventors}
                onChange={handleChange}
                placeholder="Enter names of inventors or creators (comma separated)"
                className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                IP Right Type
                <span title="Type of intellectual property right" className="cursor-help text-gray-500">
                  <Info size={14} />
                </span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div 
                  className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                    formData.rightType === 'patent' 
                      ? 'border-indigo-500 bg-indigo-900/20' 
                      : 'border-gray-700 bg-black/20 hover:bg-black/30'
                  }`}
                  onClick={() => handleTypeChange('patent')}
                >
                  <div className="mr-3">
                    <div 
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.rightType === 'patent' 
                          ? 'border-indigo-500' 
                          : 'border-gray-500'
                      }`}
                    >
                      {formData.rightType === 'patent' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Patent</div>
                    <div className="text-xs text-gray-400">For inventions & processes</div>
                  </div>
                </div>
                
                <div 
                  className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                    formData.rightType === 'trademark' 
                      ? 'border-indigo-500 bg-indigo-900/20' 
                      : 'border-gray-700 bg-black/20 hover:bg-black/30'
                  }`}
                  onClick={() => handleTypeChange('trademark')}
                >
                  <div className="mr-3">
                    <div 
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.rightType === 'trademark' 
                          ? 'border-indigo-500' 
                          : 'border-gray-500'
                      }`}
                    >
                      {formData.rightType === 'trademark' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Trademark</div>
                    <div className="text-xs text-gray-400">For brands & identifiers</div>
                  </div>
                </div>
                
                <div 
                  className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                    formData.rightType === 'copyright' 
                      ? 'border-indigo-500 bg-indigo-900/20' 
                      : 'border-gray-700 bg-black/20 hover:bg-black/30'
                  }`}
                  onClick={() => handleTypeChange('copyright')}
                >
                  <div className="mr-3">
                    <div 
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.rightType === 'copyright' 
                          ? 'border-indigo-500' 
                          : 'border-gray-500'
                      }`}
                    >
                      {formData.rightType === 'copyright' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Copyright</div>
                    <div className="text-xs text-gray-400">For creative works</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                IP Description
                <span title="Detailed description of the intellectual property" className="cursor-help text-gray-500">
                  <Info size={14} />
                </span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of the intellectual property, including its novelty, usefulness, and key features"
                className="w-full px-3 py-2 h-32 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-purple-900/20 rounded-lg border border-purple-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-purple-400" />
              <h3 className="text-sm font-medium text-purple-400">IP Rights Protection</h3>
            </div>
            <p className="text-xs text-gray-300 mb-1">
              This will create a verifiable, timestamped record of your intellectual property claim on the blockchain. This can be used as evidence for priority of invention or discovery.
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
                'Register IP Rights'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}; 