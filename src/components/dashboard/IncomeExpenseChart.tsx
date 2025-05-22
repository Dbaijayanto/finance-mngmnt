
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

type MonthlyData = {
  name: string;
  income: number;
  expenses: number;
};

interface IncomeExpenseChartProps {
  data: MonthlyData[];
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data }) => {
  return (
    <Card className="dashboard-card h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
              />
              <Legend />
              <Bar dataKey="income" fill="#25D366" name="Income" />
              <Bar dataKey="expenses" fill="#FF5252" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
