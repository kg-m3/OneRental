import { ArrowTrendingUpIcon, ExclamationCircleIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Card } from '../../../components/ui/Card';

type InsightType = 'opportunity' | 'warning' | 'prediction';
type InsightImpact = 'low' | 'medium' | 'high';

type Insight = {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: InsightImpact;
  icon: JSX.Element;
  action?: { text: string; onClick: () => void };
};

function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

const CONFIG = {
  utilizationWindowDays: 60,
  utilizationHighThreshold: 0.8,
  idleThresholdDays: 30,
  maintenanceBookedDays: 200,
  demandLiftThresholdPercent: 30,
  insightsCap: 6,
} as const;

function generateInsights(equipment: any[], bookings: any[]): Insight[] {
  const now = new Date();
  const last60Start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - CONFIG.utilizationWindowDays);
  const last30Start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

  // Group bookings by equipment
  const bookingsByEq: Record<string, any[]> = {};
  bookings.forEach((b) => {
    const arr = bookingsByEq[b.equipment_id] || (bookingsByEq[b.equipment_id] = []);
    arr.push(b);
  });

  const insights: Insight[] = [];

  equipment.forEach((eq) => {
    const eqBookings = (bookingsByEq[eq.id] || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Utilization proxy over last 60 days
    let bookedDays60 = 0;
    eqBookings.forEach((b) => {
      const sd = new Date(b.start_date);
      const ed = new Date(b.end_date);
      // Count overlap with last 60 window
      const start = sd < last60Start ? last60Start : sd;
      const end = ed > now ? now : ed;
      if (end > start) bookedDays60 += daysBetween(start, end);
    });
  const util60 = Math.min(1, bookedDays60 / CONFIG.utilizationWindowDays);

    // 1) Price Optimization: high utilization → suggest price increase
  if (util60 >= CONFIG.utilizationHighThreshold) {
      insights.push({
        id: `price-${eq.id}`,
        type: 'opportunity',
        title: `Increase price for ${eq.title}`,
        description: `${Math.round(util60 * 100)}% utilization in the last 60 days. Consider a 8–12% increase on peak days (Fri–Mon).`,
        impact: 'high',
        icon: <CurrencyDollarIcon className="h-6 w-6" />,
        action: { text: 'View pricing analysis', onClick: () => {} },
      });
    }

    // 2) Idle Equipment: no bookings in last 30–45 days
    const latestBooking = eqBookings[0];
    const daysSinceLast = latestBooking ? daysBetween(new Date(latestBooking.end_date), now) : 999;
  if (daysSinceLast >= CONFIG.idleThresholdDays) {
      const impact: InsightImpact = daysSinceLast >= 60 ? 'high' : 'medium';
      insights.push({
        id: `idle-${eq.id}`,
        type: 'opportunity',
        title: `${eq.title} is idle`,
        description: `${eq.title} hasn’t been booked for ${daysSinceLast} days. Try a temporary discount or promote in high-demand locations.`,
        impact,
        icon: <ClockIcon className="h-6 w-6" />,
        action: { text: 'Create promotion', onClick: () => {} },
      });
    }

    // 3) Maintenance Alert: many booked days → recommend maintenance
    const totalBookedDays = eqBookings.reduce((sum, b) => {
      const sd = new Date(b.start_date); const ed = new Date(b.end_date);
      return sum + daysBetween(sd, ed);
    }, 0);
    if (totalBookedDays >= CONFIG.maintenanceBookedDays) {
      insights.push({
        id: `maint-${eq.id}`,
        type: 'warning',
        title: `Maintenance due for ${eq.title}`,
        description: `${totalBookedDays} booked days in recent history. Schedule maintenance to reduce failure risk.`,
        impact: 'high',
        icon: <ExclamationCircleIcon className="h-6 w-6" />,
        action: { text: 'Schedule maintenance', onClick: () => {} },
      });
    }
  });

  // 4) Demand Forecast: last 30 days vs trailing baseline across all equipment
  const last30Count = bookings.filter((b) => new Date(b.created_at) >= last30Start).length;
  const prev30Start = new Date(last30Start); prev30Start.setDate(prev30Start.getDate() - 30);
  const prev30Count = bookings.filter((b) => new Date(b.created_at) >= prev30Start && new Date(b.created_at) < last30Start).length;
  if (prev30Count > 0) {
    const lift = Math.round(((last30Count - prev30Count) / prev30Count) * 100);
    if (lift >= CONFIG.demandLiftThresholdPercent) {
      insights.push({
        id: 'forecast-global',
        type: 'prediction',
        title: 'Demand uptick expected',
        description: `Bookings are up ${lift}% vs the prior 30 days. Expect elevated demand in the next month.`,
        impact: lift >= 60 ? 'high' : 'medium',
        icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
        action: { text: 'Optimize availability', onClick: () => {} },
      });
    }
  }

  // 5) Per-category (type) demand insights
  const byType: Record<string, any[]> = {};
  bookings.forEach((b) => {
    const type = b.equipment?.type || 'Other';
    const arr = byType[type] || (byType[type] = []);
    arr.push(b);
  });
  Object.entries(byType).forEach(([type, arr]) => {
    const last30 = arr.filter((b) => new Date(b.created_at) >= last30Start).length;
    const prev30 = arr.filter((b) => new Date(b.created_at) >= prev30Start && new Date(b.created_at) < last30Start).length;
    if (prev30 > 0) {
      const lift = Math.round(((last30 - prev30) / prev30) * 100);
      if (lift >= CONFIG.demandLiftThresholdPercent) {
        insights.push({
          id: `forecast-${type}`,
          type: 'prediction',
          title: `${type} demand rising`,
          description: `${type} bookings up ${lift}% vs previous month. Consider increasing availability and pricing on peak days.`,
          impact: lift >= 60 ? 'high' : 'medium',
          icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
          action: { text: 'Optimize availability', onClick: () => {} },
        });
      }
    }
  });

  // Rank by impact and cap to top 6
  const rank = (i: Insight) => (i.impact === 'high' ? 3 : i.impact === 'medium' ? 2 : 1);
  return insights.sort((a, b) => rank(b) - rank(a)).slice(0, CONFIG.insightsCap);
}

export default function PredictiveInsights({ equipment: _equipment, bookings: _bookings, isLoading = false, bare = false }: { equipment: any[]; bookings: any[]; isLoading?: boolean; bare?: boolean }) {
  // Dismiss/snooze state via localStorage
  const storageKey = 'predictive-insights:dismissed';
  const dismissed = (() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
  })() as Record<string, { until?: number }>;

  const rawInsights = generateInsights(_equipment || [], _bookings || []);
  const nowMs = Date.now();
  const insights = rawInsights.filter((i) => {
    const s = dismissed[i.id];
    return !s || !s.until || s.until < nowMs;
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-primary-50 text-primary-700';
      case 'medium': return 'bg-amber-50 text-amber-700';
      case 'low': return 'bg-gray-50 text-gray-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-50 text-green-700';
      case 'warning': return 'bg-red-50 text-red-700';
      case 'prediction': return 'bg-blue-50 text-blue-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const Content = (
      <div className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`rounded-full p-2 ${getTypeColor(insight.type)}`}>{insight.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium text-gray-900">{insight.title}</h4>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getImpactColor(insight.impact)}`}>{insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} impact</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{insight.description}</p>
                <div className="mt-2 flex items-center gap-3">
                  {insight.action && (
                    <button
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                      onClick={() => {
                        // Navigate to relevant tab (hash-based for now)
                        if (insight.type === 'prediction') {
                          window.location.hash = '#/dashboard?tab=stats';
                        } else {
                          window.location.hash = '#/dashboard?tab=equipment';
                        }
                        insight.action?.onClick();
                      }}
                    >
                      {insight.action.text}
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  )}
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      const until = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
                      const next = { ...dismissed, [insight.id]: { until } };
                      localStorage.setItem(storageKey, JSON.stringify(next));
                      // Optimistic UI: no re-render control available here; rely on filter next mount
                    }}
                  >
                    Snooze 7d
                  </button>
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      const next = { ...dismissed, [insight.id]: { until: Number.MAX_SAFE_INTEGER } };
                      localStorage.setItem(storageKey, JSON.stringify(next));
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
  );

  if (bare) return Content;

  return (
    <Card title="Smart Insights" subtitle="AI-powered recommendations based on your business data" isLoading={isLoading} className="h-full">
      {Content}
    </Card>
  );
}
