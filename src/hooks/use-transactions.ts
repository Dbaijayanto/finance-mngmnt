
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface Transaction {
  id: string;
  account_id: string;
  name: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
  updated_at: string;
}

interface CreateTransactionInput {
  account_id: string;
  name: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date?: string;
}

interface TransactionsFilter {
  startDate?: Date;
  endDate?: Date;
  type?: 'income' | 'expense' | 'all';
  category?: string;
  account_id?: string;
}

export function useTransactions(filters: TransactionsFilter = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const fetchTransactions = async (): Promise<Transaction[]> => {
    if (!user) return [];
    
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    // Apply filters
    if (filters.startDate) {
      query = query.gte('date', filters.startDate.toISOString());
    }
    
    if (filters.endDate) {
      query = query.lte('date', filters.endDate.toISOString());
    }
    
    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.account_id) {
      query = query.eq('account_id', filters.account_id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      throw error;
    }
    
    return (data as Transaction[]) || [];
  };

  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['transactions', user?.id, filters],
    queryFn: fetchTransactions,
    enabled: !!user,
  });

  const createTransaction = useMutation({
    mutationFn: async (newTransaction: CreateTransactionInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...newTransaction,
          user_id: user.id,
          date: newTransaction.date || new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating transaction:', error);
        toast.error('Failed to create transaction');
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      toast.success('Transaction created successfully');
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating transaction:', error);
        toast.error('Failed to update transaction');
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      toast.success('Transaction updated successfully');
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting transaction:', error);
        toast.error('Failed to delete transaction');
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      toast.success('Transaction deleted successfully');
    },
  });

  return {
    transactions,
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
