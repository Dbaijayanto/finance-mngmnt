import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  DollarSign, 
  CreditCard, 
  PieChart, 
  BarChart3, 
  Home,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { CircleDollarSign } from "lucide-react";

export const Sidebar: React.FC = () => {
  const currentPath = window.location.pathname;
  const { user, signOut } = useAuth();
  
  // Get user initials from email
  const getUserInitials = (email: string) => {
    return email
      .split('@')[0] // Get the part before @
      .charAt(0) // Take first character
      .toUpperCase();
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Accounts', href: '/accounts', icon: DollarSign },
    { name: 'Transactions', href: '/transactions', icon: CreditCard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Budgets', href: '/budgets', icon: PieChart },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-8">
        <h1 className="text-xl font-bold text-white flex items-center">
          
          ₹ FinancePro
        </h1>
      </div>
      
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navigation.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "sidebar-link",
                isActive && "active"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {user && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                {getUserInitials(user.email || '')}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user.email?.split('@')[0]}</p>
                <p className="text-xs text-sidebar-foreground/70">{user.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              className="text-sidebar-foreground hover:text-white hover:bg-sidebar-accent"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
