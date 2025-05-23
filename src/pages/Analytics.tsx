import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTransactions } from '@/hooks/use-transactions';
import { useBudgetCategories } from '@/hooks/use-budget-categories';
import { useAccounts } from '@/hooks/use-accounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('1m');
  const { transactions } = useTransactions();
  const { budgetCategories } = useBudgetCategories();
  const { accounts } = useAccounts();

  // Get date range based on selected time range
  const getDateRange = () => {
    const endDate = endOfMonth(new Date());
    let startDate;

    switch (timeRange) {
      case '3m':
        startDate = startOfMonth(subMonths(new Date(), 2));
        break;
      case '6m':
        startDate = startOfMonth(subMonths(new Date(), 5));
        break;
      case '1y':
        startDate = startOfMonth(subMonths(new Date(), 11));
        break;
      default: // 1m
        startDate = startOfMonth(new Date());
    }

    return { startDate, endDate };
  };

  // Filter transactions by date range
  const getFilteredTransactions = () => {
    const { startDate, endDate } = getDateRange();
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
  };

  // Calculate monthly spending data
  const getMonthlyData = () => {
    const filteredTransactions = getFilteredTransactions();
    const monthlyData: { [key: string]: number } = {};

    filteredTransactions.forEach(t => {
      if (t.type === 'expense') {
        const month = format(new Date(t.date), 'MMM yyyy');
        monthlyData[month] = (monthlyData[month] || 0) + Math.abs(t.amount);
      }
    });

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount,
    }));
  };

  // Calculate category spending data
  const getCategoryData = () => {
    const filteredTransactions = getFilteredTransactions();
    const categoryData: { [key: string]: number } = {};

    filteredTransactions.forEach(t => {
      if (t.type === 'expense') {
        categoryData[t.category] = (categoryData[t.category] || 0) + Math.abs(t.amount);
      }
    });

    return Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Calculate total income and expenses
  const getTotals = () => {
    const filteredTransactions = getFilteredTransactions();
    return filteredTransactions.reduce(
      (acc, t) => {
        if (t.type === 'income') {
          acc.income += t.amount;
        } else {
          acc.expenses += Math.abs(t.amount);
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  const { income, expenses } = getTotals();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your financial trends and insights
            </p>
          </div>
          <Select value={timeRange} onValueChange={(value: '1m' | '3m' | '6m' | '1y') => setTimeRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{income.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{expenses.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(income - expenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{(income - expenses).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {income > 0 ? (((income - expenses) / income) * 100).toFixed(1) : '0'}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spending']}
                  />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spending']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics; 