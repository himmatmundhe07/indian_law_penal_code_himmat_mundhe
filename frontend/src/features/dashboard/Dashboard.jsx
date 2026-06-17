import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import { API_ROUTES }  from '../../utils/constants';
import SkeletonLoader  from '../../components/common/SkeletonLoader';
import PageHeader from '../../components/common/PageHeader';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts';

const CHART_COLORS = ['#8B1A2E', '#C9952A', '#2D6A4F', '#1A4A6B', '#6B2D6B', '#4A3010'];

function StatCard({ label, value }) {
  // Use specific logic to parse out [object Object] if it slips through
  const displayValue = typeof value === 'object' && value !== null 
    ? (value.count ?? value.total ?? Object.values(value)[0] ?? 0) 
    : (value ?? 0);

  return (
    <div className="bg-[var(--color-bg-surface)] border-l-[3px] border-[var(--color-maroon)] p-5 rounded-[4px]">
      <h3 className="font-sans font-medium uppercase text-[9px] tracking-[0.06em] text-[var(--color-ink-secondary)] mb-2">
        {label}
      </h3>
      <p className="font-mono font-bold text-[36px] leading-none text-[var(--color-gold-bright)] uppercase tracking-[0.04em]">
        {displayValue.toLocaleString()}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [stats,   setStats]   = useState({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [total, active, repealed, byAct, byCat, byState, byCourt, bookmarks] =
        await Promise.allSettled([
          api.get(API_ROUTES.STATS_COUNT),
          api.get(API_ROUTES.STATS_ACTIVE),
          api.get(API_ROUTES.STATS_REPEALED),
          api.get(API_ROUTES.STATS_BY_ACT),
          api.get(API_ROUTES.STATS_BY_CATEGORY),
          api.get(API_ROUTES.STATS_BY_STATE),
          api.get(API_ROUTES.STATS_BY_COURT),
          api.get(API_ROUTES.STATS_BOOKMARKS),
        ]);

      const safeCount = (r) => {
        if (r.status !== 'fulfilled') return 0;
        const d = r.value?.data;
        return d?.data?.count ?? d?.data?.total ?? d?.data?.active ?? d?.data?.repealed ?? d?.count ?? d?.total ?? (typeof d === 'number' ? d : 0);
      };

      const safeData = (r) => r.status === 'fulfilled' ? (r.value?.data?.data || r.value?.data || []) : [];

      setStats({
        total:     safeCount(total),
        active:    safeCount(active),
        repealed:  safeCount(repealed),
        bookmarks: safeCount(bookmarks),
        byAct:     safeData(byAct),
        byCat:     safeData(byCat),
        byState:   safeData(byState),
        byCourt:   safeData(byCourt),
      });

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const normalizeChart = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(d => ({ 
      name: d.act || d.category || d.state || d.court || d._id || d.name || 'Unspecified', 
      value: d.count || d.total || 0 
    }));
  };

  if (error) {
    return (
      <div className="p-8 border border-[#7A1C1C] bg-[rgba(122,28,28,0.1)] text-[#E57373] rounded-[4px]">
        <h2 className="font-serif text-[20px] mb-2">Failed to Load Statistics</h2>
        <p className="font-sans text-[14px]">{error}</p>
        <button onClick={loadStats} className="btn-danger mt-4">Retry</button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Statistics Overview — Nyayakosha</title>
        <meta name="description" content="Live statistics and counts from the Indian legal database." />
      </Helmet>

      <div>
        <PageHeader 
          eyebrow="DASHBOARD"
          title="Statistics Overview"
          subtitle={lastUpdated ? `Live statistical aggregation — Last updated at ${lastUpdated}` : 'Live statistical aggregation'}
        />

        {loading ? <SkeletonLoader rows={6} /> : (
          <>
            {/* Top stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard label="Total Laws" value={stats.total} />
              <StatCard label="Active Laws" value={stats.active} />
              <StatCard label="Repealed Laws" value={stats.repealed} />
              <StatCard label="Total Bookmarks" value={stats.bookmarks} />
            </div>

            <hr className="rule mb-6" />
            <h2 className="font-sans font-medium uppercase text-[9px] tracking-[0.12em] text-[var(--color-ink-secondary)] mb-6">
              DISTRIBUTION
            </h2>

            {/* Bar charts for distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { title: 'By Act',      data: normalizeChart(stats.byAct)    },
                { title: 'By Category', data: normalizeChart(stats.byCat)    },
                { title: 'By State',    data: normalizeChart(stats.byState)  },
                { title: 'By Court',    data: normalizeChart(stats.byCourt)  },
              ].map(({ title, data }) => (
                <div
                  key={title}
                  className="bg-[var(--color-bg-surface)] rounded-[4px] p-6 border border-[var(--color-rule)]"
                >
                  <h3 className="font-serif text-[18px] text-[var(--color-parchment)] mb-6">{title}</h3>
                  {data.length === 0 ? (
                    <p className="font-sans text-[12px] text-[var(--color-ink-secondary)] italic">No data available</p>
                  ) : (
                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ bottom: 40, left: -20, right: 10, top: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule)" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontFamily: 'var(--font-sans)', fontSize: 10, fill: 'var(--color-ink-secondary)' }} 
                            axisLine={{ stroke: 'var(--color-rule)' }}
                            tickLine={{ stroke: 'var(--color-rule)' }}
                            angle={-30} 
                            textAnchor="end" 
                            interval={0} 
                            tickFormatter={(value) => (typeof value === 'string' && value.length > 15) ? value.substring(0, 15) + '...' : value}
                          />
                          <YAxis 
                            tick={{ fontFamily: 'var(--font-sans)', fontSize: 10, fill: 'var(--color-ink-secondary)' }} 
                            axisLine={{ stroke: 'var(--color-rule)' }}
                            tickLine={{ stroke: 'var(--color-rule)' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'var(--color-bg-elevated)', 
                              border: '1px solid var(--color-rule)',
                              borderRadius: '2px',
                              fontFamily: 'var(--font-sans)',
                              fontSize: '12px',
                              color: 'var(--color-parchment)'
                            }} 
                            itemStyle={{ color: 'var(--color-gold-bright)' }}
                          />
                          <Bar dataKey="value" name="Count">
                            {data.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
