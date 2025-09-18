import { Card } from '../../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueAnalysis({ data, isLoading = false, bare = false, height = 256 }: { data: { month: string; revenue: number; profit: number }[]; isLoading?: boolean; bare?: boolean; height?: number }) {
  const Chart = (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
          <Bar dataKey="profit" fill="#10b981" name="Profit" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  if (bare) return Chart;

  return (
    <Card title="Revenue Analysis" subtitle="Monthly revenue and profit trends" isLoading={isLoading}>
      {Chart}
    </Card>
  );
}
