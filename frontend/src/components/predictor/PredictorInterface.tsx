'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, Play, Check, X, ArrowRight, ClipboardCopy, Download, Terminal, AlertCircle } from 'lucide-react';
import Lottie from 'lottie-react';
import { toast } from 'sonner';

// Types for DNA sequences
interface Base {
  letter: string;
  position: number;
  isEdited: boolean;
  editType?: 'substitution' | 'insertion' | 'deletion';
  originalBase?: string;
  confidence?: number;
}

interface PredictionResult {
  originalSequence: Base[];
  predictedSequence: Base[];
  editCount: number;
  editSites: number[];
}

// Lottie animation for DNA loading
const dnaLoadingAnimation = {
  v: "5.7.1",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "DNA Loading",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "DNA Strand",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { 
          a: 1, 
          k: [
            { t: 0, s: [0], e: [360] },
            { t: 60, s: [360] }
          ], 
          ix: 10 
        },
        p: { a: 0, k: [100, 100, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: { a: 0, k: [100, 100, 100], ix: 6 }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              d: 1,
              ty: "el",
              s: { a: 0, k: [80, 80], ix: 2 },
              p: { a: 0, k: [0, 0], ix: 3 },
              nm: "Ellipse Path 1",
              mn: "ADBE Vector Shape - Ellipse",
              hd: false
            },
            {
              ty: "st",
              c: { a: 0, k: [0.267, 0.384, 0.929, 1], ix: 3 },
              o: { a: 0, k: 100, ix: 4 },
              w: { a: 0, k: 8, ix: 5 },
              lc: 2,
              lj: 1,
              ml: 4,
              bm: 0,
              d: [
                { n: "d", nm: "dash", v: { a: 0, k: 20, ix: 1 } },
                { n: "g", nm: "gap", v: { a: 0, k: 20, ix: 2 } }
              ],
              nm: "Stroke 1",
              mn: "ADBE Vector Graphic - Stroke",
              hd: false
            }
          ],
          nm: "Ellipse 1",
          np: 3,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Inner Strand",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { 
          a: 1, 
          k: [
            { t: 0, s: [0], e: [-360] },
            { t: 60, s: [-360] }
          ], 
          ix: 10 
        },
        p: { a: 0, k: [100, 100, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: { a: 0, k: [60, 60, 100], ix: 6 }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              d: 1,
              ty: "el",
              s: { a: 0, k: [80, 80], ix: 2 },
              p: { a: 0, k: [0, 0], ix: 3 },
              nm: "Ellipse Path 1",
              mn: "ADBE Vector Shape - Ellipse",
              hd: false
            },
            {
              ty: "st",
              c: { a: 0, k: [0.957, 0.243, 0.275, 1], ix: 3 },
              o: { a: 0, k: 100, ix: 4 },
              w: { a: 0, k: 8, ix: 5 },
              lc: 2,
              lj: 1,
              ml: 4,
              bm: 0,
              d: [
                { n: "d", nm: "dash", v: { a: 0, k: 10, ix: 1 } },
                { n: "g", nm: "gap", v: { a: 0, k: 10, ix: 2 } }
              ],
              nm: "Stroke 1",
              mn: "ADBE Vector Graphic - Stroke",
              hd: false
            }
          ],
          nm: "Ellipse 1",
          np: 3,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ],
  markers: []
};

export default function PredictorInterface() {
  // State for sequence input and validation
  const [sequence, setSequence] = useState<string>('');
  const [isValidSequence, setIsValidSequence] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // State for prediction process
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  // State for prediction results
  const [result, setResult] = useState<PredictionResult | null>(null);
  
  // Ref for console log auto-scroll
  const consoleRef = useRef<HTMLDivElement>(null);
  
  // Processing steps
  const processingSteps = [
    'Initializing prediction system',
    'Analyzing DNA sequence structure',
    'Identifying CRISPR PAM sites',
    'Calculating gRNA binding efficiency',
    'Simulating Cas9 cleavage',
    'Predicting DNA repair outcomes',
    'Generating final edit predictions'
  ];
  
  // Handle input change with validation
  const handleSequenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSequence = e.target.value.toUpperCase();
    setSequence(newSequence);
    
    // Validate that input only contains A, T, G, C
    const isValid = /^[ATGC]*$/.test(newSequence);
    setIsValidSequence(isValid);
    
    if (!isValid && newSequence) {
      setErrorMessage('Invalid sequence: Only A, T, G, C nucleotides are allowed');
    } else if (newSequence.length < 10 && newSequence.length > 0) {
      setIsValidSequence(false);
      setErrorMessage('Sequence must be at least 10 nucleotides long');
    } else {
      setErrorMessage('');
    }
  };
  
  // Add log entry
  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };
  
  // Simulate prediction process
  const runPrediction = async () => {
    if (!isValidSequence || sequence.length < 10) return;
    
    setIsLoading(true);
    setResult(null);
    setLogs([]);
    setProcessingStep(0);
    
    // Initial log
    addLog(`[${new Date().toLocaleTimeString()}] Starting CRISPR prediction for sequence of length ${sequence.length}`);
    
    try {
      // Simulate processing through each step
      for (let i = 0; i < processingSteps.length; i++) {
        setProcessingStep(i);
        addLog(`[${new Date().toLocaleTimeString()}] ${processingSteps[i]}...`);
        
        // Simulate processing time between 1-2 seconds
        await new Promise(resolve => 
          setTimeout(resolve, 1000 + Math.random() * 1000)
        );
      }
      
      // Generate a mock result based on the input sequence
      const mockResult = generateMockResult(sequence);
      
      addLog(`[${new Date().toLocaleTimeString()}] Prediction complete: Found ${mockResult.editCount} potential edits`);
      setResult(mockResult);
    } catch (error) {
      console.error("Prediction error:", error);
      addLog(`[${new Date().toLocaleTimeString()}] Error during prediction: ${error}`);
    } finally {
      setIsLoading(false);
      setProcessingStep(processingSteps.length);
    }
  };
  
  // Generate mock prediction result based on input
  const generateMockResult = (seq: string): PredictionResult => {
    // Convert raw sequence to Base array for original
    const originalSequence: Base[] = seq.split('').map((letter, index) => ({
      letter,
      position: index,
      isEdited: false
    }));
    
    // Create a copy for predicted sequence
    const predictedSequence: Base[] = JSON.parse(JSON.stringify(originalSequence));
    
    // Randomly select 1-3 positions to edit
    const editCount = Math.floor(Math.random() * 3) + 1;
    const potentialEditPositions = Array.from({ length: seq.length }, (_, i) => i);
    
    // Select random positions for edits
    const editPositions: number[] = [];
    for (let i = 0; i < editCount; i++) {
      if (potentialEditPositions.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * potentialEditPositions.length);
      const position = potentialEditPositions.splice(randomIndex, 1)[0];
      editPositions.push(position);
    }
    
    // Apply edits to predicted sequence
    editPositions.forEach(position => {
      const originalBase = originalSequence[position].letter;
      let newBase: string;
      
      // Simple substitution logic (A→T, T→A, G→C, C→G)
      switch (originalBase) {
        case 'A': newBase = 'T'; break;
        case 'T': newBase = 'A'; break;
        case 'G': newBase = 'C'; break;
        case 'C': newBase = 'G'; break;
        default: newBase = originalBase;
      }
      
      // Apply the edit
      predictedSequence[position] = {
        letter: newBase,
        position,
        isEdited: true,
        editType: 'substitution',
        originalBase,
        confidence: 0.7 + Math.random() * 0.3 // Random confidence between 0.7-1.0
      };
    });
    
    return {
      originalSequence,
      predictedSequence,
      editCount,
      editSites: editPositions
    };
  };
  
  // Auto-scroll the console log
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);
  
  // Copy result to clipboard
  const copyToClipboard = () => {
    if (!result) return;
    
    const predictedSequence = result.predictedSequence.map(base => base.letter).join('');
    navigator.clipboard.writeText(predictedSequence)
      .then(() => {
        toast.success('Sequence copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy sequence');
      });
  };
  
  // Download result as JSON
  const downloadJson = () => {
    if (!result) return;
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'crispr-prediction.json');
    linkElement.click();
  };
  
  return (
    <div className="space-y-6">
      {/* Main input console */}
      <motion.div 
        className="rounded-xl overflow-hidden backdrop-blur-md bg-gray-900/50 border border-indigo-900/30 p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center">
          <Dna className="mr-2 h-5 w-5" />
          <span>DNA Sequence Input</span>
        </h2>
        
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={sequence}
              onChange={handleSequenceChange}
              placeholder="Enter DNA sequence (A, T, G, C nucleotides only)..."
              className={`w-full h-32 bg-gray-950 border ${isValidSequence ? 'border-gray-700 focus:border-indigo-500' : 'border-red-500'} rounded-lg p-3 text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              spellCheck={false}
              disabled={isLoading}
            />
            
            {/* Error message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div 
                  className="mt-2 text-red-400 text-sm flex items-center" 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Sample buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSequence('ATGCTAGCTAGCTAGCTAGCTAGCTAGCTA')}
              disabled={isLoading}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-300 transition-colors"
            >
              Sample DNA
            </button>
            <button
              onClick={() => setSequence('ATGCCCAAATTTGGGCCCAAATTTGGGCCC')}
              disabled={isLoading}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-300 transition-colors"
            >
              CRISPR Target
            </button>
            <button
              onClick={() => setSequence('')}
              disabled={isLoading}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>
          
          {/* Predict button */}
          <motion.button
            onClick={runPrediction}
            disabled={!isValidSequence || sequence.length < 10 || isLoading}
            className={`w-full py-3 rounded-lg flex items-center justify-center text-white font-medium transition-all ${
              isValidSequence && sequence.length >= 10 && !isLoading
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-400 hover:from-indigo-500 hover:to-indigo-300 shadow-lg shadow-indigo-600/20'
                : 'bg-gray-700 cursor-not-allowed'
            }`}
            whileHover={isValidSequence && sequence.length >= 10 && !isLoading ? { scale: 1.02 } : {}}
            whileTap={isValidSequence && sequence.length >= 10 && !isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <span className="flex items-center">
                Analyzing DNA
                <span className="ml-2 inline-block w-5 h-5">
                  <Lottie 
                    animationData={dnaLoadingAnimation} 
                    loop={true}
                  />
                </span>
              </span>
            ) : (
              <span className="flex items-center">
                <Play className="mr-2 h-5 w-5" />
                Predict CRISPR Edits
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>
      
      {/* Processing console */}
      <AnimatePresence>
        {(isLoading || logs.length > 0) && (
          <motion.div 
            className="rounded-xl overflow-hidden backdrop-blur-md bg-gray-900/50 border border-indigo-900/30 p-5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center">
              <Terminal className="mr-2 h-5 w-5" />
              <span>Processing Log</span>
            </h2>
            
            {/* Progress bar */}
            <div className="h-1 w-full bg-gray-800 rounded-full mb-4 overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${(processingStep / processingSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Console output */}
            <div 
              ref={consoleRef}
              className="font-mono text-sm text-green-300 bg-gray-950 rounded-lg p-3 h-40 overflow-y-auto"
            >
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
              {isLoading && (
                <div className="animate-pulse">
                  {'> '}<span className="text-gray-300 animate-blink">█</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Results section */}
      <AnimatePresence>
        {result && (
          <motion.div 
            className="rounded-xl overflow-hidden backdrop-blur-md bg-gray-900/50 border border-indigo-900/30 p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-indigo-300 flex items-center">
                <Check className="mr-2 h-5 w-5 text-green-400" />
                <span>Prediction Results</span>
              </h2>
              
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors"
                  title="Copy sequence"
                >
                  <ClipboardCopy size={16} />
                </button>
                <button
                  onClick={downloadJson}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors"
                  title="Download as JSON"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
            
            {/* Edit count badge */}
            <div className="mb-6">
              <motion.div 
                className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-900/50 border border-indigo-500/30 text-indigo-300"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Dna className="mr-2 h-4 w-4" />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {result.editCount} Edit{result.editCount !== 1 ? 's' : ''} Found
                </motion.span>
              </motion.div>
            </div>
            
            {/* Sequences comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original sequence */}
              <div className="rounded-lg bg-gray-950 border border-gray-800 p-3">
                <h3 className="text-gray-400 text-sm font-medium mb-2">Original Sequence</h3>
                <div className="font-mono text-sm overflow-x-auto whitespace-nowrap pb-2">
                  {result.originalSequence.map((base, index) => (
                    <motion.span
                      key={index}
                      className="inline-block px-0.5 rounded"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.01, duration: 0.2 }}
                    >
                      {base.letter}
                    </motion.span>
                  ))}
                </div>
              </div>
              
              {/* Predicted sequence */}
              <div className="rounded-lg bg-gray-950 border border-indigo-900/30 p-3">
                <h3 className="text-indigo-400 text-sm font-medium mb-2">Predicted Sequence</h3>
                <div className="font-mono text-sm overflow-x-auto whitespace-nowrap pb-2">
                  {result.predictedSequence.map((base, index) => (
                    <motion.span
                      key={index}
                      className={`inline-block px-0.5 rounded ${
                        base.isEdited ? 'bg-red-900/50 text-red-300' : ''
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.01, duration: 0.2 }}
                      title={base.isEdited ? `Changed from ${base.originalBase} (${Math.round(base.confidence! * 100)}% confidence)` : ''}
                    >
                      {base.letter}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Edits explanation */}
            <div className="mt-6 rounded-lg bg-gray-900 p-4 border border-gray-800">
              <h3 className="text-gray-300 font-medium mb-3">Detected Edits</h3>
              <ul className="space-y-2">
                {result.editSites.map((position, index) => {
                  const baseInfo = result.predictedSequence[position];
                  return (
                    <motion.li 
                      key={index}
                      className="flex items-center text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <ArrowRight className="h-4 w-4 text-indigo-400 mr-2 flex-shrink-0" />
                      <span>
                        Position {position + 1}: 
                        <span className="text-red-400 mx-1">{baseInfo.originalBase}</span> 
                        →
                        <span className="text-green-400 mx-1">{baseInfo.letter}</span>
                        ({Math.round(baseInfo.confidence! * 100)}% confidence)
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 