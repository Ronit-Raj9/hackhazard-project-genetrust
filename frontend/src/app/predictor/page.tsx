"use client";

// Add next.js dynamic marker to prevent prerendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMousePositionContext } from "@/components/landing/MousePositionProvider";
import { Loader2, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";

// DNA base types
type BaseType = "A" | "T" | "G" | "C";
type BasePair = { top: BaseType, bottom: BaseType };

// Score type for prediction results
type Score = {
  efficiency: number;
  specificity: number;
  stability: number;
  overall: number;
};

export default function CRISPRPredictor() {
  const [dnaSequence, setDnaSequence] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Score | null>(null);
  const [animateEntry, setAnimateEntry] = useState<boolean>(true);
  const [targetSite, setTargetSite] = useState<string>("");
  const { mousePosition } = useMousePositionContext();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reset form state
  const resetForm = () => {
    setDnaSequence("");
    setResults(null);
    setError(null);
    setTargetSite("");
  };

  // Convert DNA sequence to base pairs
  const getBasePairs = (sequence: string): BasePair[] => {
    return sequence.toUpperCase().split("").map(base => {
      switch (base) {
        case "A": return { top: "A", bottom: "T" };
        case "T": return { top: "T", bottom: "A" };
        case "G": return { top: "G", bottom: "C" };
        case "C": return { top: "C", bottom: "G" };
        default: return { top: "A", bottom: "T" }; // Default for non-ATGC characters
      }
    });
  };

  // Simulated CRISPR prediction function
  const predictCRISPR = async (sequence: string): Promise<Score> => {
    // In a real application, this would make an API call to a backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (sequence.length < 10) {
          reject(new Error("Sequence too short for meaningful prediction"));
          return;
        }
        
        // Generate random scores between 0.65 and 0.98
        const getRandomScore = () => 0.65 + Math.random() * 0.33;
        
        const result: Score = {
          efficiency: getRandomScore(),
          specificity: getRandomScore(),
          stability: getRandomScore(),
          overall: 0
        };
        
        // Calculate weighted overall score
        result.overall = (
          result.efficiency * 0.4 + 
          result.specificity * 0.35 + 
          result.stability * 0.25
        );
        
        // Set a random target site from the sequence
        const startIndex = Math.floor(Math.random() * (sequence.length - 23));
        setTargetSite(sequence.substring(startIndex, startIndex + 23));
        
        resolve(result);
      }, 3000); // Simulate API delay
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const results = await predictCRISPR(dnaSequence);
      setResults(results);
    } catch (err) {
      setError((err as Error).message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Animation to run on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateEntry(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden text-white" ref={containerRef}>
      {/* Entry animation overlay */}
      <AnimatePresence>
        {animateEntry && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div 
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              GeneTrust Gene Predictor
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern" />
      
      {/* Ambient glow effects */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
      
      {/* Custom cursor */}
      <motion.div
        className="fixed w-8 h-8 rounded-full mix-blend-screen pointer-events-none z-50"
        animate={{ 
          x: mousePosition?.x - 16 || 0, 
          y: mousePosition?.y - 16 || 0,
          backgroundColor: loading ? "rgba(147, 51, 234, 0.5)" : "rgba(59, 130, 246, 0.5)"
        }}
        transition={{ type: "spring", damping: 20 }}
      />

      <motion.div 
        className="container mx-auto p-8 pt-24 max-w-4xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.7 }}
      >
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.7 }}
        >
          CRISPR Target Prediction
        </motion.h1>
        
        <motion.div 
          className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.7 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Sequence Input</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <textarea
                className="w-full h-40 bg-black/50 text-green-400 border border-blue-500/30 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                placeholder="Enter DNA sequence (A, T, G, C)..."
                value={dnaSequence}
                onChange={(e) => setDnaSequence(e.target.value.toUpperCase().replace(/[^ATGC]/g, ''))}
              />
              <div className="text-xs text-blue-300/70 mt-1">
                Only A, T, G, C bases accepted • Minimum 20 bases recommended
              </div>
            </div>
            
            <div className="flex justify-end">
              <motion.button
                type="submit"
                disabled={loading || dnaSequence.length < 10}
                className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${
                  loading || dnaSequence.length < 10
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Predict CRISPR Targets</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
        
        {/* DNA helix visualization */}
        {dnaSequence && !results && !error && !loading && (
          <motion.div
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 overflow-x-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-blue-300">DNA Sequence Preview</h2>
            <div className="flex justify-center">
              <div className="flex flex-col">
                <div className="flex space-x-1 mb-1">
                  {getBasePairs(dnaSequence.slice(0, 40)).map((pair, index) => (
                    <motion.div 
                      key={`top-${index}`}
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        pair.top === 'A' ? 'bg-green-500/30 text-green-300' :
                        pair.top === 'T' ? 'bg-red-500/30 text-red-300' :
                        pair.top === 'G' ? 'bg-blue-500/30 text-blue-300' :
                        'bg-yellow-500/30 text-yellow-300'
                      }`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.3 }}
                    >
                      {pair.top}
                    </motion.div>
                  ))}
                </div>
                
                <div className="flex items-center justify-center space-x-1 h-12">
                  {Array(Math.min(40, dnaSequence.length)).fill(0).map((_, index) => (
                    <motion.div 
                      key={`line-${index}`}
                      className="w-0.5 h-full bg-white/20"
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ delay: index * 0.02 + 0.1, duration: 0.2 }}
                    />
                  ))}
                </div>
                
                <div className="flex space-x-1">
                  {getBasePairs(dnaSequence.slice(0, 40)).map((pair, index) => (
                    <motion.div 
                      key={`bottom-${index}`}
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        pair.bottom === 'A' ? 'bg-green-500/30 text-green-300' :
                        pair.bottom === 'T' ? 'bg-red-500/30 text-red-300' :
                        pair.bottom === 'G' ? 'bg-blue-500/30 text-blue-300' :
                        'bg-yellow-500/30 text-yellow-300'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.3 }}
                    >
                      {pair.bottom}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            {dnaSequence.length > 40 && (
              <div className="text-center mt-4 text-blue-300/70 text-sm">
                Showing first 40 bases of {dnaSequence.length} total
              </div>
            )}
          </motion.div>
        )}
        
        {/* Loading animation */}
        {loading && (
          <motion.div 
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-10 mb-8 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-32 h-32 mb-6">
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-4 rounded-full border-4 border-t-transparent border-r-blue-400 border-b-purple-400 border-l-pink-400"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-mono text-blue-300">ANALYZING</span>
              </div>
            </div>
            
            <div className="text-blue-300 animate-pulse text-center">
              <p className="mb-2">Processing DNA sequence...</p>
              <p className="text-sm text-blue-300/70">Identifying potential CRISPR-Cas9 target sites</p>
            </div>
          </motion.div>
        )}
        
        {/* Error message */}
        {error && (
          <motion.div 
            className="backdrop-blur-md bg-red-900/20 border border-red-500/30 rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-400">Prediction Error</h3>
                <p className="text-red-300">{error}</p>
                <motion.button 
                  onClick={resetForm}
                  className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span>Reset and try again</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Results display */}
        {results && (
            <motion.div 
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-6 text-blue-300">CRISPR-Cas9 Prediction Results</h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-blue-300/70 mb-2">Identified Target Sequence:</h3>
              <div className="p-3 bg-black/30 border border-blue-500/20 rounded-lg font-mono text-green-400 overflow-x-auto">
                {targetSite}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-blue-300/70 mb-3">Prediction Scores</h3>
                
                <div className="space-y-4">
                  {/* Efficiency score */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-blue-300">Efficiency</span>
                      <span className="text-blue-300">{Math.round(results.efficiency * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${results.efficiency * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>
                  
                  {/* Specificity score */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-purple-300">Specificity</span>
                      <span className="text-purple-300">{Math.round(results.specificity * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${results.specificity * 100}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                      />
                    </div>
                  </div>
                  
                  {/* Stability score */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-pink-300">Stability</span>
                      <span className="text-pink-300">{Math.round(results.stability * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-pink-600 to-pink-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${results.stability * 100}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-blue-300/70 mb-3">Overall Suitability</h3>
                
                <div className="relative h-52 w-full bg-black/30 rounded-lg border border-blue-500/20 flex items-center justify-center p-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className="w-40 h-40 rounded-full border-8 border-blue-500/20"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    />
                    <motion.div 
                      className="absolute w-32 h-32 rounded-full border-8 border-purple-500/20"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1 }}
                    />
                  <motion.div
                      className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                    >
                      <div className="text-center">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                          {Math.round(results.overall * 100)}%
                        </div>
                        <div className="text-xs text-blue-300/70">OVERALL SCORE</div>
                      </div>
                  </motion.div>
                  </div>
                </div>
                
                <div className="mt-4 text-center text-sm">
                  <span className={
                    results.overall >= 0.85 ? "text-green-400" :
                    results.overall >= 0.7 ? "text-blue-400" :
                    results.overall >= 0.5 ? "text-yellow-400" : "text-red-400"
                  }>
                    {results.overall >= 0.85 ? "Excellent Target" :
                     results.overall >= 0.7 ? "Good Target" :
                     results.overall >= 0.5 ? "Average Target" : "Poor Target"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <motion.button 
                onClick={resetForm}
                className="px-5 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                <span>New Prediction</span>
              </motion.button>
            </div>
          </motion.div>
        )}
        
        <motion.div 
          className="text-center text-sm text-blue-300/50 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          GeneTrust Gene Predictor • Advanced Genomic Analysis Platform
        </motion.div>
      </motion.div>
    </div>
  );
} 