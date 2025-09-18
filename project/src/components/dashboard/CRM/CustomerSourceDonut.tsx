import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#1e40af', '#06b6d4', '#6366f1', '#0ea5e9'];

export default function CustomerSourceDonut({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 h-72">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Customer Sources</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} label>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
