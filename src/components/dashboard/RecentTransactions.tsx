
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Transaction } from '@/hooks/use-transactions';
import { Link } from 'react-router-dom';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
        <Link to="/transactions" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const transactionDate = new Date(transaction.date);
            
            return (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between px-6 py-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center">
                  <div className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center mr-3",
                    transaction.type === 'income' ? "bg-finance-green/10 text-finance-green" : "bg-finance-red/10 text-finance-red"
                  )}>
                    {transaction.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(transactionDate, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={transaction.type === 'income' ? "text-finance-green" : "text-finance-red"}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                  <Badge variant="outline" className="mt-1">
                    {transaction.category}
                  </Badge>
                </div>
              </div>
            );
          })}
          
          {transactions.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No recent transactions
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
