import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { loadAnalyticsDashboard } from './analyticsSlice';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import PageHeader from '../../components/common/PageHeader';

const CHART_COLORS = ['#8B1A2E', '#C9952A', '#2D6A4F', '#1A4A6B', '#6B2D6B', '#4A3010'];

function ChartCard({ title, children, loading }) {
  return (
    <div className="bg-[var(--color-bg-surface)] rounded-[4px] p-6 border border-[var(--color-rule)] h-full">
      <h3 className="font-serif text-[18px] text-[var(--color-parchment)] mb-6">{title}</h3>
      {loading ? <SkeletonLoader rows={4} /> : children}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const dispatch  = useDispatch();
  const analytics = useSelector((s) => s.analytics);
  const { loading, error } = analytics;

  useEffect(() => { dispatch(loadAnalyticsDashboard()); }, [dispatch]);

  if (error) {
    return (
      <div className="p-8 border border-[#7A1C1C] bg-[rgba(122,28,28,0.1)] text-[#E57373] rounded-[4px]">
        <h2 className="font-serif text-[20px] mb-2">Failed to Load Analytics</h2>
        <p className="font-sans text-[14px]">{error}</p>
        <button onClick={() => dispatch(loadAnalyticsDashboard())} className="btn-danger mt-4">Retry</button>
      </div>
    );
  }

  const normalizeArray = (data, nameKey = 'name', valueKey = 'count') => {
    if (!data) return [];
    if (Array.isArray(data)) return data.map(d => ({
      name:  d[nameKey] || d._id || d.name || 'Unspecified',
      value: d[valueKey] || d.count || d.total || d.value || 0,
    }));
    return [];
  };

  const categoryData   = normalizeArray(analytics.byCategory,   '_id',      'count');
  const stateData      = normalizeArray(analytics.byState,       '_id',      'count');
  const courtData      = normalizeArray(analytics.byCourt,       '_id',      'count');
  const viewedData     = normalizeArray(analytics.mostViewed,    'title',    'views');
  const bookmarkData   = normalizeArray(analytics.mostBookmarked,'title',    'bookmarkCount');
  const trendData      = normalizeArray(analytics.searchTrends,  'keyword',  'count');
  const complexityData = normalizeArray(analytics.complexity,    '_id',      'count');
  const activityData   = normalizeArray(analytics.userActivity,  'date',     'actions');

  return (
    <div className="pb-16">
      <Helmet>
        <title>Analytics Dashboard — Nyayakosha</title>
      </Helmet>

      <PageHeader 
        eyebrow="ANALYTICS"
        title="Analytics Dashboard"
        subtitle="System-wide usage patterns and content metrics"
      />

      {/* POPULARITY & REACH */}
      <div className="mb-10">
        <h2 className="font-sans font-medium uppercase text-[9px] tracking-[0.12em] text-[var(--color-ink-secondary)] mb-4">
          POPULARITY & REACH
        </h2>
        <hr className="rule mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Most Viewed Laws" loading={loading}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={viewedData.slice(0, 8)} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule)" horizontal={false} />
                <XAxis 
                  type="number" 
                  tick={{ fontFamily: 'var(--font-sans)', fontSize: 10, fill: 'var(--color-ink-secondary)' }} 
                  axisLine={{ stroke: 'var(--color-rule)' }}
                  tickLine={{ stroke: 'var(--color-rule)' }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontFamily: 'var(--font-sans)', fontSize: 10, fill: 'var(--color-ink-secondary)' }} 
                  width={140} 
                  axisLine={{ stroke: 'var(--color-rule)' }}
                  tickLine={{ stroke: 'var(--color-rule)' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-rule)', borderRadius: '2px', color: 'var(--color-parchment)', fontFamily: 'var(--font-sans)', fontSize: '12px' }} 
                  itemStyle={{ color: 'var(--color-gold-bright)' }}
                />
                <Bar dataKey="value" fill="var(--color-maroon)" name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Most Bookmarked Laws" loading={loading}>
            <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2">
              {bookmarkData.slice(0, 10).map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="font-serif text-[15px] text-[var(--color-parchment)] truncate mr-4">
                      {i + 1}. {item.name}
                    </p>
                    <span className="font-sans text-[11px] text-[var(--color-gold-bright)] flex-shrink-0">
                      {item.value} bookmarks
                    </span>
                  </div>
                  <div className="h-[4px] bg-[var(--color-bg-base)] w-full">
                    <div
                      className="h-full bg-[var(--color-maroon)]"
                      style={{
                        width: `${Math.min(100, (item.value / (bookmarkData[0]?.value || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
              {bookmarkData.length === 0 && (
                <p className="font-sans text-[12px] text-[var(--color-ink-secondary)] italic">No bookmark data available</p>
              )}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* DISTRIBUTION */}
      <div className="mb-10">
        <h2 className="font-sans font-medium uppercase text-[9px] tracking-[0.12em] text-[var(--color-ink-secondary)] mb-4">
          DISTRIBUTION
        </h2>
        <hr className="rule mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Laws by Category" loading={loading}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} margin={{ top: 5, right: 20, left: -20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontFamily: 'var(--font-sans)', fontSize: 10, fill: 'var(--color-ink-secondary)' }} 
                  angle={-35} 
                  textAnchor="end" 
                  interval={0} 
                  axisLine={{ stroke: 'var(--color-rule)' }}
                  tickLine={{ stroke: 'var(--color-rule)' }}
                />
                <YAxis 
                  tick={{ fontFamily: 'var(--font-sans)', fontSize: 10, fill: 'var(--color-ink-secondary)' }} 
                  axisLine={{ stroke: 'var(--color-rule)' }}
                  tickLine={{ stroke: 'var(--color-rule)' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-rule)', borderRadius: '2px', color: 'var(--color-parchment)', fontFamily: 'var(--font-sans)', fontSize: '12px' }} 
                  itemStyle={{ color: 'var(--color-gold-bright)' }}
                />
                <Bar dataKey="value" name="Laws">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Laws by State" loading={loading}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stateData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stateData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-rule)', borderRadius: '2px', color: 'var(--color-parchment)', fontFamily: 'var(--font-sans)', fontSize: '12px' }} 
                  itemStyle={{ color: 'var(--color-gold-bright)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Laws by Court" loading={loading}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={courtData} layout="vertical" margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule)" horizontal={false} />
                <XAxis 
                  type="number" 
                  tick={{ fontFamily: 'var(--font-sans)', fontSize: 10, fill: 'var(--color-ink-secondary)' }} 
                  axisLine={{ stroke: 'var(--color-rule)' }}
                  tickLine={{ stroke: 'var(--color-rule)' }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontFamily: 'var(--font-sans)', fontSize: 10, fill: 'var(--color-ink-secondary)' }} 
                  width={140} 
                  axisLine={{ stroke: 'var(--color-rule)' }}
                  tickLine={{ stroke: 'var(--color-rule)' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-rule)', borderRadius: '2px', color: 'var(--color-parchment)', fontFamily: 'var(--font-sans)', fontSize: '12px' }} 
                  itemStyle={{ color: 'var(--color-gold-bright)' }}
                />
                <Bar dataKey="value" fill="var(--color-active)" name="Laws" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Complexity Distribution" loading={loading}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={complexityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                >
                  {complexityData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-rule)', borderRadius: '2px', color: 'var(--color-parchment)', fontFamily: 'var(--font-sans)', fontSize: '12px' }} 
                  itemStyle={{ color: 'var(--color-gold-bright)' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-ink-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* ACTIVITY */}
      <div className="mb-10">
        <h2 className="font-sans font-medium uppercase text-[9px] tracking-[0.12em] text-[var(--color-ink-secondary)] mb-4">
          ACTIVITY
        </h2>
        <hr className="rule mb-6" />

        <div className="mb-6">
          <ChartCard title="User Activity Over Time" loading={loading}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={activityData} margin={{ left: -20, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontFamily: 'var(--font-sans)', fontSize: 10, fill: 'var(--color-ink-secondary)' }} 
                  axisLine={{ stroke: 'var(--color-rule)' }}
                  tickLine={{ stroke: 'var(--color-rule)' }}
                />
                <YAxis 
                  tick={{ fontFamily: 'var(--font-sans)', fontSize: 10, fill: 'var(--color-ink-secondary)' }} 
                  axisLine={{ stroke: 'var(--color-rule)' }}
                  tickLine={{ stroke: 'var(--color-rule)' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-rule)', borderRadius: '2px', color: 'var(--color-parchment)', fontFamily: 'var(--font-sans)', fontSize: '12px' }} 
                  itemStyle={{ color: 'var(--color-gold-bright)' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-gold)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--color-bg-surface)', stroke: 'var(--color-gold)', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: 'var(--color-gold)', stroke: 'var(--color-gold-bright)' }}
                  name="Actions"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div>
          <ChartCard title="Top Search Trends" loading={loading}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trendData.slice(0, 10)} margin={{ top: 5, right: 20, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontFamily: 'var(--font-sans)', fontSize: 10, fill: 'var(--color-ink-secondary)' }} 
                  angle={-35} 
                  textAnchor="end" 
                  interval={0} 
                  axisLine={{ stroke: 'var(--color-rule)' }}
                  tickLine={{ stroke: 'var(--color-rule)' }}
                />
                <YAxis 
                  tick={{ fontFamily: 'var(--font-sans)', fontSize: 10, fill: 'var(--color-ink-secondary)' }} 
                  axisLine={{ stroke: 'var(--color-rule)' }}
                  tickLine={{ stroke: 'var(--color-rule)' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-rule)', borderRadius: '2px', color: 'var(--color-parchment)', fontFamily: 'var(--font-sans)', fontSize: '12px' }} 
                  itemStyle={{ color: 'var(--color-gold-bright)' }}
                />
                <Bar dataKey="value" fill="var(--color-maroon-bright)" name="Searches" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
