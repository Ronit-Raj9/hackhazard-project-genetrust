type AuthContextType = {
  // ... existing code ...
  // Guest login
  continueAsGuest: () => Promise<boolean>;
  isGuest: () => boolean;
  getGuestData: (key: string) => any;
  storeGuestData: (key: string, data: any) => void;
  logoutGuest: () => void;
};

// Import and re-export the useAuth hook from the .ts file
import { useAuth, useAuthState, useAuthMethods, authEvents } from './useAuth.ts';
export { useAuth, useAuthState, useAuthMethods, authEvents };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ... existing code ...
  
  // Check if user is a guest
  const isGuest = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('guest_user');
  }, []);
  
  // Continue as guest
  const continueAsGuest = useCallback(async () => {
    try {
      // Create a unique guest ID
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Create guest user object
      const guestUser = {
        guestId,
        name: 'Guest User',
        email: 'guest@example.com',
        isGuest: true,
        createdAt: new Date().toISOString()
      };
      
      // Store in localStorage
      localStorage.setItem('guest_user', JSON.stringify(guestUser));
      
      // Update auth state
      setUser(guestUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Failed to create guest user:', error);
      return false;
    }
  }, []);
  
  // Get guest data from localStorage
  const getGuestData = useCallback((key: string) => {
    if (typeof window === 'undefined' || !isGuest()) return null;
    
    try {
      const guestUser = JSON.parse(localStorage.getItem('guest_user') || '{}');
      if (!guestUser || !guestUser.guestId) return null;
      
      const data = localStorage.getItem(`guest_data_${guestUser.guestId}_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error retrieving guest data for key ${key}:`, error);
      return null;
    }
  }, [isGuest]);
  
  // Store guest data in localStorage
  const storeGuestData = useCallback((key: string, data: any) => {
    if (typeof window === 'undefined' || !isGuest()) return;
    
    try {
      const guestUser = JSON.parse(localStorage.getItem('guest_user') || '{}');
      if (!guestUser || !guestUser.guestId) return;
      
      localStorage.setItem(`guest_data_${guestUser.guestId}_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Error storing guest data for key ${key}:`, error);
    }
  }, [isGuest]);
  
  // Clear guest data and logout
  const logoutGuest = useCallback(() => {
    if (typeof window === 'undefined' || !isGuest()) return;
    
    try {
      // Get guest ID to clear all associated data
      const guestUser = JSON.parse(localStorage.getItem('guest_user') || '{}');
      if (guestUser && guestUser.guestId) {
        // Find and remove all guest data items
        const guestDataPrefix = `guest_data_${guestUser.guestId}_`;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(guestDataPrefix)) {
            localStorage.removeItem(key);
          }
        }
      }
      
      // Remove guest user
      localStorage.removeItem('guest_user');
      
      // Update auth state
      setUser(null);
      setIsAuthenticated(false);
      
    } catch (error) {
      console.error('Error during guest logout:', error);
    }
  }, [isGuest]);

  // ... existing code ...

  useEffect(() => {
    // ... existing code ...
    
    // Check if there's a guest user when component mounts
    if (isGuest()) {
      try {
        const guestUser = JSON.parse(localStorage.getItem('guest_user') || '{}');
        if (guestUser && guestUser.guestId) {
          setUser(guestUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error restoring guest session:', error);
        localStorage.removeItem('guest_user');
      }
    }
  }, []);

  // ... existing code ...

  return (
    <AuthContext.Provider
      value={{
        // ... existing code ...
        continueAsGuest,
        isGuest,
        getGuestData,
        storeGuestData,
        logoutGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 