export type ActivityItem = {
  id: string;
  type: 'booking' | 'payment' | 'equipment';
  message: string;
  date: string;
};

export default function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="flex items-start gap-3">
            <div className={`mt-1 h-2 w-2 rounded-full ${a.type === 'booking' ? 'bg-blue-600' : a.type === 'payment' ? 'bg-green-600' : 'bg-gray-500'}`} />
            <div>
              <div className="text-sm text-gray-800">{a.message}</div>
              <div className="text-xs text-gray-500">{new Date(a.date).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
