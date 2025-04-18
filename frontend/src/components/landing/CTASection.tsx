'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import AnimatedButton from './AnimatedButton'
import { useAuth } from '@/lib/hooks/useAuth'

export default function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })
  const { isAuthenticated, isInitialized } = useAuth()
  
  return (
    <section 
      ref={sectionRef}
      className="relative py-24 bg-gradient-to-b from-indigo-950 to-gray-900 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[url('/dna-pattern.svg')] bg-repeat opacity-5" />
      
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Gene Editing Workflow?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join GeneTrust AI Studio today and experience the future of genetic research
            </p>
            
            {/* Only show login/register buttons for non-authenticated users */}
            {(!isAuthenticated && isInitialized) ? (
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <AnimatedButton 
                  href="/register" 
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg"
                >
                  Get Started Now
                </AnimatedButton>
                
                <AnimatedButton 
                  href="/login" 
                  variant="outline"
                  className="px-8 py-4 text-white border-white hover:bg-white/10 text-lg"
                  icon={<ArrowRight className="ml-2 h-5 w-5" />}
                >
                  Login
                </AnimatedButton>
              </div>
            ) : isAuthenticated ? (
              <div className="flex justify-center">
                <AnimatedButton 
                  href="/dashboard" 
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg"
                >
                  Go to Dashboard
                </AnimatedButton>
              </div>
            ) : (
              <div className="h-16">
                {/* Empty space while initializing */}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Abstract DNA decoration */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-r from-indigo-600/0 via-indigo-600/10 to-indigo-600/0" />
      <motion.div 
        className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-[120%] h-32"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        <svg viewBox="0 0 1200 120" className="w-full h-full fill-indigo-600/20">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      </motion.div>
    </section>
  )
} 