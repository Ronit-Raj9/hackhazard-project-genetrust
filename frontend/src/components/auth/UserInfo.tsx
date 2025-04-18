'use client';

import { useAuthState, useAuthMethods } from '@/lib/hooks/useAuth';
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

export const UserInfo = () => {
  const { user, isLoading } = useAuthState();
  const { logout } = useAuthMethods();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('You have been logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 border-indigo-600/30 bg-indigo-900/20 hover:bg-indigo-800/30 text-indigo-100">
          <Avatar className="h-8 w-8 border border-indigo-500/30">
            <AvatarImage src={user.profileImageUrl} alt={user.name || "User"} />
            <AvatarFallback className="bg-indigo-700 text-indigo-200 text-xs">
              {user.name ? user.name[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[100px] truncate hidden md:inline">
            {user.name || user.email?.split('@')[0] || user.walletAddress?.substring(0, 6) + '...' + user.walletAddress?.substring(38)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="bg-gray-900 border border-indigo-800/50 text-indigo-100">
        <div className="flex items-center gap-2 p-2 border-b border-indigo-800/30">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profileImageUrl} alt={user.name || "User"} />
            <AvatarFallback className="bg-indigo-700 text-indigo-200">
              {user.name ? user.name[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{user.name || "User"}</p>
            <p className="text-xs text-indigo-300/70">{user.email || user.walletAddress?.substring(0, 6) + '...' + user.walletAddress?.substring(38) || "No email"}</p>
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
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 