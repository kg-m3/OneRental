import CountUp from 'react-countup';

type Stats = {
  totalActiveEquipment: number;
  pendingRequests: number;
  confirmedThisMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  rentalHoursThisMonth?: number;
  totalRevenueAllTime?: number;
};

export default function StatsCards({ stats }: { stats: Stats }) {
  const diff = stats.revenueThisMonth - stats.revenueLastMonth;
  const diffPct = stats.revenueLastMonth > 0 ? (diff / stats.revenueLastMonth) * 100 : 0;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {[
        { label: 'Active Equipment', value: stats.totalActiveEquipment },
        { label: 'Pending Requests', value: stats.pendingRequests },
        { label: 'Confirmed (Month)', value: stats.confirmedThisMonth },
  { label: 'Total Rental Time (Hours)', value: stats.rentalHoursThisMonth ?? 0 },
        { label: 'Total Revenue', value: stats.totalRevenueAllTime ?? 0, currency: true },
      ].map((card) => (
        <div key={card.label} className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="text-2xl font-semibold">
            {card.currency ? 'R' : ''}
            <CountUp end={card.value} duration={1.2} />
          </p>
        </div>
      ))}
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-500">Revenue (Month)</p>
        <p className="text-2xl font-semibold">R<CountUp end={stats.revenueThisMonth} duration={1.2} /></p>
        <p className={`text-xs mt-1 ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {diff >= 0 ? '+' : ''}{diff.toFixed(0)} ({diffPct.toFixed(1)}%) vs last month
        </p>
      </div>
    </div>
  );
}
