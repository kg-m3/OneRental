export type Customer = {
  id: string;
  name: string;
  email: string;
  totalBookings: number;
  totalRevenue: number;
  lastActive: string;
  contacted?: boolean;
};

export default function CustomerInsights({ customers }: { customers: Customer[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Top Customers</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Customer</th>
              <th className="py-2">Bookings</th>
              <th className="py-2">Revenue</th>
              <th className="py-2">Last Active</th>
              <th className="py-2">Contacted</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-t">
                <td className="py-2">
                  <div className="font-medium text-gray-800">{c.name}</div>
                  <div className="text-gray-500">{c.email}</div>
                </td>
                <td className="py-2">{c.totalBookings}</td>
                <td className="py-2">R{c.totalRevenue.toFixed(2)}</td>
                <td className="py-2">{new Date(c.lastActive).toLocaleDateString()}</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-xs ${c.contacted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.contacted ? 'Contacted' : 'Not contacted'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
