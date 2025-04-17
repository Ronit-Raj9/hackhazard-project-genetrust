'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Info, ShieldCheck } from 'lucide-react';

type AccessRole = 'admin' | 'write' | 'read';

interface AccessControlData {
  userWalletAddress: string;
  accessRole: AccessRole;
}

export const AccessControl = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AccessControlData>({
    userWalletAddress: '',
    accessRole: 'read',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (accessRole: AccessRole) => {
    setFormData(prev => ({ ...prev, accessRole }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Access control data:', formData);
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setFormData({
          userWalletAddress: '',
          accessRole: 'read',
        });
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error assigning access rights:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xl font-bold text-white">Manage Access Control</h2>
      </div>
      <p className="text-sm text-gray-300 mb-6">
        Assign and manage permissions for genomic data access
      </p>

      {showSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-900/30 border border-green-700 rounded-lg mb-6"
        >
          <h3 className="text-green-400 font-medium mb-1">Access Rights Assigned Successfully!</h3>
          <p className="text-sm text-gray-300">
            Access permissions have been permanently recorded on the blockchain. The user now has the specified level of access to the genomic data.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                User Wallet Address
                <span title="Ethereum address to grant access to" className="cursor-help text-gray-500">
                  <Info size={14} />
                </span>
              </label>
              <input
                type="text"
                name="userWalletAddress"
                value={formData.userWalletAddress}
                onChange={handleChange}
                placeholder="0x..."
                className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                Access Role
                <span title="Level of access to grant" className="cursor-help text-gray-500">
                  <Info size={14} />
                </span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div 
                  className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                    formData.accessRole === 'admin' 
                      ? 'border-purple-500 bg-purple-900/20' 
                      : 'border-gray-700 bg-black/20 hover:bg-black/30'
                  }`}
                  onClick={() => handleRoleChange('admin')}
                >
                  <div className="mr-3">
                    <div 
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.accessRole === 'admin' 
                          ? 'border-purple-500' 
                          : 'border-gray-500'
                      }`}
                    >
                      {formData.accessRole === 'admin' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Admin</div>
                    <div className="text-xs text-gray-400">Full control</div>
                  </div>
                </div>
                
                <div 
                  className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                    formData.accessRole === 'write' 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-gray-700 bg-black/20 hover:bg-black/30'
                  }`}
                  onClick={() => handleRoleChange('write')}
                >
                  <div className="mr-3">
                    <div 
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.accessRole === 'write' 
                          ? 'border-blue-500' 
                          : 'border-gray-500'
                      }`}
                    >
                      {formData.accessRole === 'write' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Write</div>
                    <div className="text-xs text-gray-400">Add and modify</div>
                  </div>
                </div>
                
                <div 
                  className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                    formData.accessRole === 'read' 
                      ? 'border-green-500 bg-green-900/20' 
                      : 'border-gray-700 bg-black/20 hover:bg-black/30'
                  }`}
                  onClick={() => handleRoleChange('read')}
                >
                  <div className="mr-3">
                    <div 
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.accessRole === 'read' 
                          ? 'border-green-500' 
                          : 'border-gray-500'
                      }`}
                    >
                      {formData.accessRole === 'read' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Read</div>
                    <div className="text-xs text-gray-400">View only</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-indigo-900/20 rounded-lg border border-indigo-900/50">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-indigo-400" />
              <h3 className="text-sm font-medium text-indigo-400">Access Control</h3>
            </div>
            <p className="text-xs text-gray-300 mb-1">
              This will grant the specified user permanent access rights to the genomic data. This action is recorded on the blockchain.
            </p>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium flex items-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-indigo-500 hover:to-purple-500'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                'Assign Access Rights'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}; 