export type Filters = {
  range: 'week' | 'month' | 'custom';
  from?: string;
  to?: string;
  equipmentId?: string;
  customerId?: string;
};

export default function FiltersBar({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs text-gray-500">Range</label>
        <select className="border rounded px-2 py-1" value={filters.range} onChange={(e) => setFilters({ ...filters, range: e.target.value as Filters['range'] })}>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      {filters.range === 'custom' && (
        <>
          <div>
            <label className="block text-xs text-gray-500">From</label>
            <input type="date" className="border rounded px-2 py-1" value={filters.from || ''} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-gray-500">To</label>
            <input type="date" className="border rounded px-2 py-1" value={filters.to || ''} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          </div>
        </>
      )}
    </div>
  );
}
