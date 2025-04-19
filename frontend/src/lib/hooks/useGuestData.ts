'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook for managing guest user data
 * This hook provides utilities for components to work with guest data
 * and properly fallback to regular API data for logged-in users
 */
export function useGuestData<T>(
  key: string, 
  initialData: T,
  apiFetchFn?: () => Promise<T>
) {
  const { isGuest, getGuestData, storeGuestData, isAuthenticated, user } = useAuth();
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data based on auth state
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (isGuest()) {
          // Guest user - get data from localStorage
          const guestData = getGuestData(key) as T;
          
          if (guestData) {
            setData(guestData);
          } else {
            // No guest data saved yet, use initial data
            setData(initialData);
            // Store initial data
            storeGuestData(key, initialData);
          }
        } else if (isAuthenticated && apiFetchFn) {
          // Regular user - fetch data from API
          const apiData = await apiFetchFn();
          setData(apiData);
        } else {
          // Fallback - use initial data
          setData(initialData);
        }
      } catch (err: any) {
        console.error(`Error loading ${key} data:`, err);
        setError(err.message || `Failed to load ${key} data`);
        // Fallback to initial data on error
        setData(initialData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key, isAuthenticated, user?.id]);

  // Function to update data
  const updateData = (newData: T) => {
    setData(newData);
    
    if (isGuest()) {
      // For guest users, save to localStorage
      storeGuestData(key, newData);
    }
    // For regular users, data updates should be handled separately
    // through API calls by the component using this hook
  };

  return {
    data,
    setData: updateData,
    isLoading,
    error,
    isGuest: isGuest(),
  };
}

/**
 * For cases where you need more direct control over guest data without loading
 */
export function useGuestDataManager() {
  const { isGuest, getGuestData, storeGuestData } = useAuth();
  
  return {
    isGuest: isGuest(),
    getGuestData,
    storeGuestData,
    
    // Helper to check if a key exists in guest data
    hasGuestData: (key: string): boolean => {
      return !!getGuestData(key);
    },
    
    // Helper to clear a specific key
    clearGuestData: (key: string): void => {
      if (typeof window !== 'undefined' && isGuest()) {
        const guestUser = JSON.parse(localStorage.getItem('guest_user') || '{}');
        if (guestUser && guestUser.guestId) {
          localStorage.removeItem(`guest_data_${guestUser.guestId}_${key}`);
        }
      }
    }
  };
} 