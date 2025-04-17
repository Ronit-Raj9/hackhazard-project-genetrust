'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Test, FlaskConical, Shield, GitBranch, Award } from 'lucide-react';
import { RegisterSample } from './RegisterSample';
import { RegisterExperiment } from './RegisterExperiment';
import { AccessControl } from './AccessControl';
import { WorkflowManager } from './WorkflowManager';
import { IPRights } from './IPRights';

type TabType = 'samples' | 'experiments' | 'access' | 'workflow' | 'ip';

export const GenomicDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('samples');

  const tabs = [
    { id: 'samples', label: 'Samples', icon: Test, description: 'Register CRISPR samples with quality assessment' },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical, description: 'Document genomic experiments and locations' },
    { id: 'access', label: 'Access Control', icon: Shield, description: 'Manage user permissions to genomic data' },
    { id: 'workflow', label: 'Workflow', icon: GitBranch, description: 'Track genomic editing process stages' },
    { id: 'ip', label: 'IP Rights', icon: Award, description: 'Register intellectual property related to research' },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">CRISPR Gene Editing Dashboard</h1>
        <p className="text-gray-400">
          Secure genomic data management on blockchain with complete transparency and auditability
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 rounded-xl p-6 border border-indigo-500/20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-8">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`relative flex flex-col items-center text-center p-4 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-indigo-600/30 text-white border border-indigo-500/50' 
                    : 'bg-black/20 text-gray-400 border border-gray-800 hover:bg-black/30'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <TabIcon size={20} className={isActive ? 'text-indigo-400' : 'text-gray-500'} />
                </div>
                <h3 className="font-medium text-sm">{tab.label}</h3>
                <p className="text-xs mt-1 text-gray-500">{tab.description}</p>
                
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-indigo-500"
                    initial={false}
                  />
                )}
              </button>
            );
          })}
        </div>
        
        <div className="bg-black/50 rounded-xl p-6 border border-gray-800">
          {activeTab === 'samples' && <RegisterSample />}
          {activeTab === 'experiments' && <RegisterExperiment />}
          {activeTab === 'access' && <AccessControl />}
          {activeTab === 'workflow' && <WorkflowManager />}
          {activeTab === 'ip' && <IPRights />}
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-black/30 rounded-lg border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-2">How Blockchain Ensures Data Integrity</h3>
        <p className="text-xs text-gray-400 mb-3">
          All genomic data and related transactions are securely stored on the blockchain with the following benefits:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-black/20 rounded-lg border border-gray-800">
            <h4 className="text-xs font-medium text-indigo-400 mb-1">Immutable Records</h4>
            <p className="text-xs text-gray-500">Once data is recorded, it cannot be altered or deleted, ensuring complete audit trails</p>
          </div>
          <div className="p-3 bg-black/20 rounded-lg border border-gray-800">
            <h4 className="text-xs font-medium text-indigo-400 mb-1">Decentralized Storage</h4>
            <p className="text-xs text-gray-500">Data is distributed across multiple nodes, eliminating single points of failure</p>
          </div>
          <div className="p-3 bg-black/20 rounded-lg border border-gray-800">
            <h4 className="text-xs font-medium text-indigo-400 mb-1">Cryptographic Security</h4>
            <p className="text-xs text-gray-500">Advanced encryption ensures only authorized parties can access sensitive genomic information</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 