
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  credit_limit?: number;
  created_at: string;
  updated_at: string;
}

interface CreateAccountInput {
  name: string;
  type: string;
  balance: number;
  color: string;
  credit_limit?: number;
}

export function useAccounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const fetchAccounts = async (): Promise<Account[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
      throw error;
    }
    
    return data || [];
  };

  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: fetchAccounts,
    enabled: !!user,
  });

  const createAccount = useMutation({
    mutationFn: async (newAccount: CreateAccountInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          ...newAccount,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating account:', error);
        toast.error('Failed to create account');
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      toast.success('Account created successfully');
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Account> & { id: string }) => {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating account:', error);
        toast.error('Failed to update account');
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      toast.success('Account updated successfully');
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      toast.success('Account deleted successfully');
    },
  });

  return {
    accounts,
    isLoading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}
