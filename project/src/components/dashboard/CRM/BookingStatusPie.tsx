import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Consistent status color mapping (Tailwind palette hexes)
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', // amber-500
  accepted: '#3b82f6', // blue-500
  active: '#3b82f6',   // blue-500
  delivered: '#0ea5e9', // sky-500
  returned: '#14b8a6',  // teal-500
  completed: '#10b981', // emerald-500
  paid: '#10b981',      // emerald-500
  cancelled: '#ef4444', // red-500
  rejected: '#ef4444',  // red-500
  declined: '#ef4444',  // red-500
};
// Fallback palette if an unknown status appears
const FALLBACK_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function BookingStatusPie({ data, bare = false, height = 256, title = 'Booking Statuses' }: { data: { name: string; value: number }[]; bare?: boolean; height?: number; title?: string }) {
  const Chart = (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((d, index) => {
              const key = String(d.name || '').toLowerCase();
              const fill = STATUS_COLORS[key] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  if (bare) return Chart;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      {Chart}
    </div>
  );
}
