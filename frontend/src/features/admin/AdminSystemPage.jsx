import React, { useEffect, useState } from 'react';
import { Helmet }    from 'react-helmet-async';
import { toast }     from 'react-toastify';
import api           from '../../services/api';
import { API_ROUTES } from '../../utils/constants';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import PageHeader from '../../components/common/PageHeader';

export default function AdminSystemPage() {
  const [health,   setHealth]   = useState(null);
  const [logs,     setLogs]     = useState([]);
  const [security, setSecurity] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const loadSystem = async () => {
    setLoading(true);
    try {
      const [h, l, s] = await Promise.allSettled([
        api.get(API_ROUTES.ADMIN_HEALTH),
        api.get(API_ROUTES.ADMIN_LOGS),
        api.get(API_ROUTES.ADMIN_SECURITY),
      ]);
      if (h.status === 'fulfilled') setHealth(h.value.data?.data || h.value.data);
      if (l.status === 'fulfilled') setLogs(l.value.data?.data || l.value.data || []);
      if (s.status === 'fulfilled') setSecurity(s.value.data?.data || s.value.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSystem(); }, []);

  const handleToggleMaintenance = async () => {
    try {
      await api.post(API_ROUTES.ADMIN_MAINTENANCE);
      toast.success('Maintenance mode toggled');
      loadSystem();
    } catch { toast.error('Failed to toggle maintenance mode'); }
  };

  const handleClearCache = async () => {
    try {
      await api.delete(API_ROUTES.ADMIN_CLEAR_CACHE);
      toast.success('Cache cleared');
    } catch { toast.error('Failed to clear cache'); }
  };

  const formatHealthValue = (val) => {
    if (typeof val === 'boolean') return val ? 'OK' : 'FAIL';
    if (typeof val === 'object' && val !== null) {
      // Handle the object issue
      return val.uptime || val.memory || val.status || JSON.stringify(val);
    }
    return String(val);
  };

  return (
    <div className="pb-16 max-w-[960px] mx-auto">
      <Helmet>
        <title>System Settings — Nyayakosha</title>
      </Helmet>

      <PageHeader 
        eyebrow="ADMINISTRATION"
        title="System Diagnostics"
        subtitle="Live monitoring, logs, and system operations"
      />

      {loading ? <SkeletonLoader rows={8} /> : (
        <div className="space-y-10">
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleToggleMaintenance}
              className="btn-secondary"
            >
              Toggle Maintenance
            </button>
            <button
              onClick={handleClearCache}
              className="btn-secondary"
            >
              Clear Cache
            </button>
            <button
              onClick={loadSystem}
              className="btn-secondary"
            >
              Refresh Data
            </button>
          </div>

          {/* Health status */}
          {health && (
            <div>
              <h2 className="font-sans font-medium uppercase text-[9px] tracking-[0.12em] text-[var(--color-ink-secondary)] mb-4">
                SYSTEM HEALTH
              </h2>
              <hr className="rule mb-6" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(health).map(([key, val]) => (
                  <div key={key} className="bg-[var(--color-bg-surface)] border border-[var(--color-rule)] rounded-[4px] p-5">
                    <p className="font-sans font-medium uppercase text-[10px] tracking-[0.06em] text-[var(--color-ink-secondary)] mb-2">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="font-mono font-bold text-[18px] text-[var(--color-parchment)]">
                      {formatHealthValue(val)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System logs */}
            <div>
              <h2 className="font-sans font-medium uppercase text-[9px] tracking-[0.12em] text-[var(--color-ink-secondary)] mb-4">
                SYSTEM LOGS
              </h2>
              <hr className="rule mb-6" />
              
              <div className="bg-[#0D0B0E] border border-[var(--color-rule)] rounded-[4px] p-4 max-h-[400px] overflow-y-auto">
                <div className="font-mono text-[12px] space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-[var(--color-ink-secondary)] italic">No logs available.</p>
                  ) : logs.map((log, i) => (
                    <div
                      key={i}
                      className={`px-3 py-2 border-l-[3px] ${
                        log.level === 'error' ? 'border-[#E57373] text-[#E57373]'
                        : log.level === 'warn'  ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                        : 'border-[var(--color-parchment-dim)] text-[var(--color-parchment)]'
                      }`}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                    >
                      <span className="opacity-60 mr-3 text-[11px]">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('en-IN') : ''}
                      </span>
                      {log.message || JSON.stringify(log)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security events */}
            <div>
              <h2 className="font-sans font-medium uppercase text-[9px] tracking-[0.12em] text-[var(--color-ink-secondary)] mb-4">
                SECURITY AUDIT
              </h2>
              <hr className="rule mb-6" />
              
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-rule)] rounded-[4px] p-4 max-h-[400px] overflow-y-auto">
                <div className="space-y-3">
                  {security.length === 0 ? (
                    <p className="font-sans text-[13px] text-[var(--color-ink-secondary)] italic">No security events recorded.</p>
                  ) : security.map((evt, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 bg-[var(--color-bg-base)] border border-[var(--color-rule)] rounded-[2px]">
                      <span className="font-sans text-[14px] text-[#E57373] mt-0.5">⚠️</span>
                      <div className="flex-1">
                        <div className="font-sans text-[13px] text-[var(--color-parchment)] mb-1">
                          {evt.event || evt.message || JSON.stringify(evt)}
                        </div>
                        <div className="font-mono text-[10px] text-[var(--color-ink-secondary)]">
                          {evt.timestamp ? new Date(evt.timestamp).toLocaleString('en-IN') : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
