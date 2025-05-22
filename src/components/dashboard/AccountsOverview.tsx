
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  creditLimit?: number;
  color: string;
};

interface AccountsOverviewProps {
  accounts: Account[];
}

export const AccountsOverview: React.FC<AccountsOverviewProps> = ({ accounts }) => {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Accounts Overview</CardTitle>
        <a href="/accounts" className="text-sm text-primary hover:underline">
          Manage
        </a>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-4">
          {accounts.map((account) => {
            const percentage = account.creditLimit 
              ? (account.balance / account.creditLimit) * 100
              : (account.balance / totalBalance) * 100;
            
            return (
              <div key={account.id} className="px-6 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="h-4 w-4 rounded-full mr-3"
                      style={{ backgroundColor: account.color }}
                    />
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{account.type}</p>
                    </div>
                  </div>
                  <p className="font-medium">₹{account.balance.toFixed(2)}</p>
                </div>
                
                {account.creditLimit && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Balance Used</span>
                      <span className={cn(
                        percentage > 80 ? "text-finance-red" : "text-muted-foreground"
                      )}>
                        ₹{account.balance.toFixed(2)} of ₹{account.creditLimit.toFixed(2)}
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={cn(
                        "h-2",
                        percentage > 80 ? "text-finance-red" : ""
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
          
          {accounts.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No accounts added yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
