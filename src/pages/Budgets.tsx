import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useBudgetCategories, BudgetCategory } from '@/hooks/use-budget-categories';
import { useTransactions } from '@/hooks/use-transactions';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Budget category form schema
const budgetCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  budget_amount: z.coerce.number().min(0.01, "Budget amount must be greater than 0"),
  color: z.string().min(1, "Color is required"),
});

type BudgetCategoryFormValues = z.infer<typeof budgetCategorySchema>;

const Budgets = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
  const { budgetCategories, isLoading, createBudgetCategory, updateBudgetCategory, deleteBudgetCategory } = useBudgetCategories();
  const { transactions } = useTransactions();

  const form = useForm<BudgetCategoryFormValues>({
    resolver: zodResolver(budgetCategorySchema),
    defaultValues: {
      name: '',
      budget_amount: 0,
      color: '#0ea5e9', // Default color
    },
  });

  const handleOpenDialog = (category?: BudgetCategory) => {
    if (category) {
      setSelectedCategory(category);
      form.reset({
        name: category.name,
        budget_amount: category.budget_amount,
        color: category.color,
      });
    } else {
      setSelectedCategory(null);
      form.reset({
        name: '',
        budget_amount: 0,
        color: '#0ea5e9',
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: BudgetCategoryFormValues) => {
    try {
      if (selectedCategory) {
        await updateBudgetCategory.mutateAsync({
          id: selectedCategory.id,
          ...values,
        });
      } else {
        await createBudgetCategory.mutateAsync({
          name: values.name,
          color: values.color,
          budget_amount: values.budget_amount,
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Budget category form error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this budget category?")) {
      try {
        await deleteBudgetCategory.mutateAsync(id);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  // Calculate spending for each category
  const calculateCategorySpending = (categoryName: string) => {
    return transactions
      .filter(t => t.category === categoryName && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Budgets</h1>
            <p className="text-muted-foreground mt-1">
              Manage your budget categories and track spending
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2" size={18} /> Add Category
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading budget categories...</div>
        ) : budgetCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No budget categories found. Add a category to get started.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgetCategories.map((category) => {
              const spending = calculateCategorySpending(category.name);
              const progress = Math.min((spending / category.budget_amount) * 100, 100);
              
              return (
                <div
                  key={category.id}
                  className="p-4 rounded-lg border bg-card"
                  style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{category.name}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${spending.toFixed(2)} spent
                      </span>
                      <span className="text-muted-foreground">
                        ${category.budget_amount.toFixed(2)} budget
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-sm text-muted-foreground">
                      {progress.toFixed(0)}% of budget used
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Category' : 'Add Category'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Category name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Amount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="color"
                          className="h-10 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={createBudgetCategory.isPending || updateBudgetCategory.isPending}>
                    {selectedCategory ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Budgets; 