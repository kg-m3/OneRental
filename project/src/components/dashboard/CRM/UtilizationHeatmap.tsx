import { Card } from '../../../components/ui/Card';


// Fallback: recharts does not have HeatMapChart, so we use a custom grid
export default function UtilizationHeatmap({ data, isLoading = false, bare = false }: { data: { equipment: string; days: number[] }[]; isLoading?: boolean; bare?: boolean }) {
  // Assume days is an array of 30 numbers (utilization per day)
  const Content = (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="text-xs text-gray-500 px-2 py-1">Equipment</th>
              {Array.from({ length: 30 }, (_, i) => (
                <th key={i} className="text-xs text-gray-400 px-1">{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.equipment}>
                <td className="text-xs text-gray-700 px-2 py-1 whitespace-nowrap">{row.equipment}</td>
                {row.days.map((val, i) => (
                  <td
                    key={i}
                    className={`w-4 h-4 text-center ${val > 0.8 ? 'bg-green-500' : val > 0.5 ? 'bg-yellow-400' : val > 0.2 ? 'bg-amber-200' : 'bg-gray-100'}`}
                    title={`Day ${i + 1}: ${(val * 100).toFixed(0)}%`}
                  >
                    {/* Optionally show value */}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );

  if (bare) return Content;

  return (
    <Card title="Utilization Heatmap" subtitle="Visualize equipment usage patterns" isLoading={isLoading}>
      {Content}
    </Card>
  );
}
