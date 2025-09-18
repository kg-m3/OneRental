import { Card } from '../../../components/ui/Card';

export default function CustomerSegmentation({ data, isLoading = false, bare = false }: { data: { segment: string; count: number; revenue: number }[]; isLoading?: boolean; bare?: boolean }) {
  const Content = (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="text-xs text-gray-500 px-2 py-1">Segment</th>
              <th className="text-xs text-gray-500 px-2 py-1">Customers</th>
              <th className="text-xs text-gray-500 px-2 py-1">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.segment}>
                <td className="text-xs text-gray-700 px-2 py-1 whitespace-nowrap">{row.segment}</td>
                <td className="text-xs text-gray-700 px-2 py-1 text-center">{row.count}</td>
                <td className="text-xs text-gray-700 px-2 py-1 text-center">${row.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );

  if (bare) return Content;

  return (
    <Card title="Customer Segmentation" subtitle="See your most valuable customer groups" isLoading={isLoading}>
      {Content}
    </Card>
  );
}
