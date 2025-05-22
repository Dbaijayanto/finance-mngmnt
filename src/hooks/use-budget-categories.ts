
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface BudgetCategory {
  id: string;
  name: string;
  color: string;
  budget_amount: number;
  created_at: string;
  updated_at: string;
}

interface CreateBudgetCategoryInput {
  name: string;
  color: string;
  budget_amount: number;
}

export function useBudgetCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const fetchBudgetCategories = async (): Promise<BudgetCategory[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('budget_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching budget categories:', error);
      toast.error('Failed to load budget categories');
      throw error;
    }
    
    return data || [];
  };

  const { data: budgetCategories = [], isLoading, error } = useQuery({
    queryKey: ['budgetCategories', user?.id],
    queryFn: fetchBudgetCategories,
    enabled: !!user,
  });

  const createBudgetCategory = useMutation({
    mutationFn: async (newCategory: CreateBudgetCategoryInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('budget_categories')
        .insert({
          ...newCategory,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating budget category:', error);
        toast.error('Failed to create budget category');
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetCategories', user?.id] });
      toast.success('Budget category created successfully');
    },
  });

  const updateBudgetCategory = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BudgetCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('budget_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating budget category:', error);
        toast.error('Failed to update budget category');
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetCategories', user?.id] });
      toast.success('Budget category updated successfully');
    },
  });

  const deleteBudgetCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budget_categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting budget category:', error);
        toast.error('Failed to delete budget category');
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetCategories', user?.id] });
      toast.success('Budget category deleted successfully');
    },
  });

  return {
    budgetCategories,
    isLoading,
    error,
    createBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
  };
}
