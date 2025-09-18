import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function CashflowForecast({
  history,
  monthsAhead = 3,
  bare = false,
}: {
  history: { month: string; revenue: number }[];
  monthsAhead?: number;
  bare?: boolean;
}) {
  // naive projection: average of last 3 months
  const last = history.slice(-3);
  const avg = last.length ? last.reduce((s, d) => s + d.revenue, 0) / last.length : 0;
  const future = Array.from({ length: monthsAhead }).map((_, i) => ({
    month: `+${i + 1}m`,
    revenue: Math.max(0, Math.round(avg)),
  }));
  const data = [...history.slice(-6), ...future];

  const Chart = (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" hide={false} />
          <YAxis hide />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  if (bare) return Chart;
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Cashflow Forecast</h3>
      {Chart}
    </div>
  );
}
