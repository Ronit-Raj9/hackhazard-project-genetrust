'use client';

import { useAuthState, useAuthMethods, useAuth } from '@/lib/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User } from 'lucide-react';
import { toast } from 'sonner';
import { User as UserType } from '@/lib/contexts/AuthContext';

export const UserInfo = () => {
  const { user, isLoading } = useAuthState();
  const { user: storeUser, isLoading: storeIsLoading } = useAuth();
  const { logout } = useAuthMethods();
  
  // Use either context or store user
  const userInfo = user || storeUser;
  const isUserLoading = isLoading || storeIsLoading;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('You have been logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!userInfo) {
    return null;
  }

  // Safe access to properties that might not exist in both user types
  const displayName = (userInfo as any).name || 'User';
  const displayEmail = (userInfo as any).email;
  const displayWalletAddress = (userInfo as any).walletAddress;
  const displayProfileImage = (userInfo as any).profileImageUrl;
  
  // Get initial for avatar
  const getInitial = () => {
    if (displayName && displayName !== 'User') {
      return displayName[0].toUpperCase();
    }
    if (displayEmail) {
      return displayEmail[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 border-indigo-600/30 bg-indigo-900/20 hover:bg-indigo-800/30 text-indigo-100">
          <Avatar className="h-8 w-8 border border-indigo-500/30">
            <AvatarImage src={displayProfileImage} alt={displayName} />
            <AvatarFallback className="bg-indigo-700 text-indigo-200 text-xs">
              {getInitial()}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[100px] truncate hidden md:inline">
            {displayName || 
             (displayEmail ? displayEmail.split('@')[0] : '') || 
             (displayWalletAddress ? displayWalletAddress.substring(0, 6) + '...' + displayWalletAddress.substring(38) : '')}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="bg-gray-900 border border-indigo-800/50 text-indigo-100">
        <div className="flex items-center gap-2 p-2 border-b border-indigo-800/30">
          <Avatar className="h-10 w-10">
            <AvatarImage src={displayProfileImage} alt={displayName} />
            <AvatarFallback className="bg-indigo-700 text-indigo-200">
              {getInitial()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-indigo-300/70">
              {displayEmail || 
               (displayWalletAddress ? displayWalletAddress.substring(0, 6) + '...' + displayWalletAddress.substring(38) : "No email")}
            </p>
          </div>
        </div>
        
        <DropdownMenuItem 
          className="hover:bg-indigo-900/50 hover:text-indigo-300 focus:bg-indigo-900/50"
          onClick={() => toast.info('Profile settings coming soon')}
        >
          <User className="mr-2 h-4 w-4 text-indigo-400" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="hover:bg-indigo-900/50 hover:text-indigo-300 focus:bg-indigo-900/50"
          onClick={() => toast.info('Settings coming soon')}
        >
          <Settings className="mr-2 h-4 w-4 text-indigo-400" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="hover:bg-red-900/30 hover:text-red-300 focus:bg-red-900/30 text-red-400"
          onClick={handleLogout}
          disabled={isUserLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isUserLoading ? 'Logging out...' : 'Logout'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 