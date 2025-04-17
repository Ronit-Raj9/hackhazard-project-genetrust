'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, User, LogOut, Settings, Dna } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Determine navbar styles based on page and scroll
  const navbarClasses = isHomePage
    ? `fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-gray-900/90 backdrop-blur-md border-b border-indigo-900/30 shadow-md shadow-indigo-500/10' 
          : 'bg-transparent'
      }`
    : 'sticky top-0 z-50 bg-gray-900 border-b border-indigo-900/50 shadow-md shadow-indigo-500/10';

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center"
              >
                <Dna className="h-6 w-6 mr-2 text-indigo-400" />
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 group-hover:from-indigo-300 group-hover:to-cyan-300 transition-all duration-300">GENE</span>
                <span className="text-2xl font-bold text-white group-hover:text-indigo-200 transition-all duration-300">Forge</span>
              </motion.div>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {[
                { name: 'Home', href: '/' },
                { name: 'Dashboard', href: '/dashboard' },
                { name: 'ChainSight', href: '/chainSight' },
                { name: 'CRISPR Predictor', href: '/crispr-predictor' },
                { name: 'Lab Monitor', href: '/lab-monitor' }
              ].map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                    pathname === item.href 
                      ? 'text-indigo-400' 
                      : 'text-gray-300 hover:text-indigo-300'
                  } group`}
                >
                  {item.name}
                  {/* Active indicator underline */}
                  <span 
                    className={`absolute left-0 right-0 bottom-0 h-0.5 bg-indigo-500 transform origin-bottom scale-x-0 transition-transform duration-300 ${
                      pathname === item.href ? 'scale-x-100' : 'group-hover:scale-x-100'
                    }`} 
                  />
                  {/* Hover glow effect */}
                  <span className="absolute inset-0 rounded-md bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-300" />
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-gray-200 hover:text-white hover:bg-indigo-900/50 focus:bg-indigo-900/50">
                    <Avatar className="h-8 w-8 border border-indigo-600/50">
                      <AvatarImage src={user.profileImageUrl} alt={user.name || "User"} />
                      <AvatarFallback className="bg-indigo-900 text-indigo-200">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.name || "User"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900 border border-indigo-900/50 text-gray-200">
                  <DropdownMenuItem asChild className="hover:bg-indigo-900/50 hover:text-indigo-300 focus:bg-indigo-900/50">
                    <Link href="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-indigo-900/50 hover:text-indigo-300 focus:bg-indigo-900/50">
                    <Link href="/dashboard" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-400 hover:bg-red-900/30 hover:text-red-300 focus:bg-red-900/30">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-indigo-900/50 focus:bg-indigo-900/50 mr-2" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50" asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-indigo-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="sm:hidden bg-gray-900 border-t border-indigo-900/30"
        >
          <div className="pt-2 pb-3 space-y-1">
            {[
              { name: 'Home', href: '/' },
              { name: 'Dashboard', href: '/dashboard' },
              { name: 'ChainSight', href: '/chainSight' },
              { name: 'CRISPR Predictor', href: '/crispr-predictor' },
              { name: 'Lab Monitor', href: '/lab-monitor' }
            ].map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={`block px-3 py-2 text-base font-medium ${
                  pathname === item.href 
                    ? 'text-indigo-400 bg-indigo-900/30 border-l-4 border-indigo-500' 
                    : 'text-gray-300 hover:text-indigo-300 hover:bg-gray-800 border-l-4 border-transparent'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-indigo-900/30">
            {isAuthenticated && user ? (
              <div>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10 border border-indigo-600/50">
                      <AvatarImage src={user.profileImageUrl} alt={user.name || "User"} />
                      <AvatarFallback className="bg-indigo-900 text-indigo-200">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-200">{user.name || "User"}</div>
                    <div className="text-sm font-medium text-gray-400">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link href="/dashboard" className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-indigo-300 hover:bg-gray-800">
                    Dashboard
                  </Link>
                  <Link href="/dashboard" className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-indigo-300 hover:bg-gray-800">
                    Settings
                  </Link>
                  <button 
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-900/30"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center px-4">
                  <Button variant="ghost" className="text-gray-300 hover:text-white w-full text-left px-4 py-2 text-base font-medium" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
                <div className="mt-3 px-4 pb-4">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white w-full border border-indigo-500/50" asChild>
                    <Link href="/login">Get Started</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
} 