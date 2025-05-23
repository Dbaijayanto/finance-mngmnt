import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTransactions, Transaction } from '@/hooks/use-transactions';
import { useBudgetCategories } from '@/hooks/use-budget-categories';
import { useAccounts } from '@/hooks/use-accounts';
import { format } from 'date-fns';
import { Calendar, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// Transaction form schema
const transactionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  account_id: z.string().min(1, "Account is required"),
  date: z.string().min(1, "Date is required"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

const Transactions = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'income' | 'expense',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    category: undefined as string | undefined,
    account_id: undefined as string | undefined,
  });
  
  const itemsPerPage = 10;
  
  const { transactions, isLoading, createTransaction, updateTransaction, deleteTransaction } = useTransactions(filters);
  const { budgetCategories } = useBudgetCategories();
  const { accounts } = useAccounts();
  
  // Pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      name: '',
      amount: 0,
      type: 'expense',
      category: '',
      account_id: '',
      date: new Date().toISOString().split('T')[0],
    },
  });
  
  const handleOpenDialog = (transaction?: Transaction) => {
    if (transaction) {
      setCurrentTransaction(transaction);
      form.reset({
        name: transaction.name,
        amount: Math.abs(transaction.amount),
        type: transaction.type,
        category: transaction.category,
        account_id: transaction.account_id,
        date: new Date(transaction.date).toISOString().split('T')[0],
      });
    } else {
      setCurrentTransaction(null);
      form.reset({
        name: '',
        amount: 0,
        type: 'expense',
        category: '',
        account_id: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: TransactionFormValues) => {
    try {
      if (currentTransaction) {
        await updateTransaction.mutateAsync({
          id: currentTransaction.id,
          name: values.name,
          amount: values.type === 'expense' ? -Math.abs(values.amount) : Math.abs(values.amount),
          category: values.category,
          type: values.type,
          account_id: values.account_id,
          date: new Date(values.date).toISOString(),
        });
      } else {
        await createTransaction.mutateAsync({
          name: values.name,
          amount: values.type === 'expense' ? -Math.abs(values.amount) : Math.abs(values.amount),
          category: values.category,
          type: values.type,
          account_id: values.account_id,
          date: new Date(values.date).toISOString(),
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Transaction form error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction.mutateAsync(id);
        toast.success("Transaction deleted successfully");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete transaction");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all your financial transactions
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="mt-4 sm:mt-0">
            <Plus className="mr-2" size={18} /> Add Transaction
          </Button>
        </div>

        <div className="bg-background rounded-lg border shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b">
            <div className="mb-4 sm:mb-0 w-full sm:w-auto">
              <Select 
                value={filters.type} 
                onValueChange={(value) => setFilters({...filters, type: value as 'all' | 'income' | 'expense'})}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {accounts.length > 0 && (
              <div className="mb-4 sm:mb-0 w-full sm:w-auto ml-0 sm:ml-2">
                <Select 
                  value={filters.account_id || "all"} 
                  onValueChange={(value) => setFilters({...filters, account_id: value === "all" ? undefined : value})}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {budgetCategories.length > 0 && (
              <div className="w-full sm:w-auto ml-0 sm:ml-2">
                <Select 
                  value={filters.category || "all"} 
                  onValueChange={(value) => setFilters({...filters, category: value === "all" ? undefined : value})}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {budgetCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="p-8 text-center">Loading transactions...</div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No transactions found. Add a new transaction to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => {
                    const account = accounts.find(a => a.id === transaction.account_id);
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2 text-muted-foreground" />
                            {format(new Date(transaction.date), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.category}</Badge>
                        </TableCell>
                        <TableCell>{account?.name || 'Unknown Account'}</TableCell>
                        <TableCell className={cn(
                          "text-right font-medium",
                          transaction.type === 'income' ? "text-green-600" : "text-red-600"
                        )}>
                          {transaction.type === 'income' ? '+' : '-'}
                          ₹{Math.abs(transaction.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(transaction)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(transaction.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="p-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p => Math.max(1, p - 1));
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Groceries, Salary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" min="0.01" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {budgetCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {currentTransaction ? 'Update' : 'Add'} Transaction
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Transactions;
