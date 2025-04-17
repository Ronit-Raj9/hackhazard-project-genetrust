'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import dynamic from 'next/dynamic'

import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import InteractiveDNASection from './InteractiveDNASection'
import TechStackSection from './TechStackSection'
import CTASection from './CTASection'
import Footer from './Footer'
import MousePositionProvider from './MousePositionProvider'
import SmoothScrollProvider from './SmoothScrollProvider'

// Dynamic import for CustomCursor to avoid SSR issues
const CustomCursor = dynamic(() => import('./CustomCursor'), { ssr: false })

export default function LandingPage() {
  useEffect(() => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger)
    
    // Create scroll-based animations with better transitions
    const sections = document.querySelectorAll('section')
    
    // Background color transition
    gsap.fromTo(
      'body',
      { backgroundColor: '#0f172a' }, // dark blue
      {
        backgroundColor: '#020617', // darker blue
        scrollTrigger: {
          trigger: sections[1],
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
        },
      }
    )
    
    // Animate sections as they come into view
    sections.forEach((section, index) => {
      if (index > 0) { // Skip hero section
        gsap.fromTo(
          section,
          { 
            opacity: 0,
            y: 50 
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'top 30%',
              scrub: 1,
              toggleActions: 'play none none reverse',
            }
          }
        )
      }
    })
    
    return () => {
      // Clean up ScrollTrigger instances when component unmounts
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])
  
  return (
    <MousePositionProvider>
      <SmoothScrollProvider>
        <div className="bg-gray-900 text-white overflow-hidden">
          {/* Custom cursor */}
          <CustomCursor />
          
          {/* Hero section with 3D DNA */}
          <HeroSection />
          
          {/* Features with animated cards */}
          <FeaturesSection />
          
          {/* Interactive DNA section */}
          <InteractiveDNASection />
          
          {/* Tech stack logos */}
          <TechStackSection />
          
          {/* Call to action */}
          <CTASection />
          
          {/* Footer */}
          <Footer />
        </div>
      </SmoothScrollProvider>
    </MousePositionProvider>
  )
} 