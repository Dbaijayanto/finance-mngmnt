import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { AccountsOverview } from '@/components/dashboard/AccountsOverview';
import { DollarSign, ArrowDown, ArrowUp } from 'lucide-react';
import { useAccounts } from '@/hooks/use-accounts';
import { useTransactions } from '@/hooks/use-transactions';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const [dateFilter, setDateFilter] = useState({
    startDate: startOfMonth(subMonths(new Date(), 6)),
    endDate: endOfMonth(new Date()),
  });

  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { transactions, isLoading: transactionsLoading } = useTransactions({
    startDate: dateFilter.startDate,
    endDate: dateFilter.endDate,
  });

  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Calculate monthly income and expenses
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());
  const previousMonthStart = startOfMonth(subMonths(new Date(), 1));
  const previousMonthEnd = endOfMonth(subMonths(new Date(), 1));
  
  const currentMonthTransactions = transactions.filter(
    tx => new Date(tx.date) >= currentMonthStart && new Date(tx.date) <= currentMonthEnd
  );
  
  const previousMonthTransactions = transactions.filter(
    tx => new Date(tx.date) >= previousMonthStart && new Date(tx.date) <= previousMonthEnd
  );
  
  const currentMonthIncome = currentMonthTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const currentMonthExpenses = currentMonthTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const previousMonthIncome = previousMonthTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const previousMonthExpenses = previousMonthTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  // Calculate income/expense trend percentages
  const incomeTrendPercentage = previousMonthIncome === 0 
    ? 100 
    : ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100;
    
  const expenseTrendPercentage = previousMonthExpenses === 0 
    ? 0 
    : ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;

  // Prepare monthly income/expense data
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      month: format(date, 'MMM'),
      startDate: startOfMonth(date),
      endDate: endOfMonth(date),
    };
  }).reverse();

  const monthlyData = last6Months.map(({ month, startDate, endDate }) => {
    const monthTransactions = transactions.filter(
      tx => new Date(tx.date) >= startDate && new Date(tx.date) <= endDate
    );
    
    const income = monthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const expenses = monthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    return {
      name: month,
      income,
      expenses,
    };
  });

  // Show most recent transactions first
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const isLoading = accountsLoading || transactionsLoading;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slide-in">
        <div>
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your financial summary.</p>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-[120px] w-full" />
              ))}
            </>
          ) : (
            <>
              <StatCard 
                title="Total Balance"
                value={`₹${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              
                trend={{ value: 0, isPositive: true }}
              />
              <StatCard 
                title="Monthly Income"
                value={`₹${currentMonthIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                icon={<ArrowDown className="h-5 w-5" />}
                trend={{ value: Math.round(incomeTrendPercentage), isPositive: incomeTrendPercentage >= 0 }}
              />
              <StatCard 
                title="Monthly Expenses"
                value={`₹${currentMonthExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                icon={<ArrowUp className="h-5 w-5" />}
                trend={{ value: Math.round(Math.abs(expenseTrendPercentage)), isPositive: expenseTrendPercentage <= 0 }}
              />
            </>
          )}
        </div>
        
        {/* Charts and tables */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <IncomeExpenseChart data={monthlyData} />
          )}
        </div>
        
        {/* Accounts and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <>
              <Skeleton className="h-[350px] w-full" />
              <Skeleton className="h-[350px] w-full" />
            </>
          ) : (
            <>
              <AccountsOverview accounts={accounts} />
              <RecentTransactions transactions={recentTransactions} />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
