import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import { toast } from 'react-toastify';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import LawHistoryDrawer from './LawHistoryDrawer';

export default function LawDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [law, setLaw] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchLawDetails();
    fetchLawSummary();
  }, [id]);

  const fetchLawDetails = async () => {
    try {
      const res = await api.get(`/laws/${id}`);
      if (res.data.success) {
        let lawData = res.data.data;
        let cat = lawData.category || lawData.chapter_title || 'Uncategorized';
        if (cat && typeof cat === 'string') {
          cat = cat.charAt(0).toUpperCase() + cat.slice(1);
        }
        lawData.category = cat;
        setLaw(lawData);
      }
    } catch (err) {
      toast.error('Failed to load law details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLawSummary = async () => {
    try {
      const res = await api.get(`/laws/${id}/summary`);
      if (res.data.success) setSummary(res.data.data);
    } catch (err) {
      // It's okay if summary fails, just don't show it
    }
  };

  if (loading) return <SkeletonLoader fullPage={true} />;
  if (!law) return <div className="p-8 text-center text-[var(--color-parchment)] font-serif">Law not found</div>;

  const statusLower = (law.status || 'active').toLowerCase();
  let badgeClass = 'badge-active';
  if (statusLower === 'repealed') badgeClass = 'badge-repealed';
  if (statusLower === 'inactive') badgeClass = 'badge-inactive';

  return (
    <div className="max-w-[760px] mx-auto pb-16">
      <Helmet>
        <title>{law.title} — Nyayakosha</title>
      </Helmet>

      <button 
        onClick={() => navigate(-1)}
        className="font-sans text-[11px] text-[var(--color-maroon-bright)] hover:underline mb-6 flex items-center"
      >
        ← Back to Laws Directory
      </button>

      <hr className="rule mb-4" />
      
      {/* Header Info */}
      <div className="font-sans text-[11px] uppercase tracking-[0.06em] text-[var(--color-ink-secondary)] mb-3">
        {law.act} · §{law.section} · {law.category}
      </div>

      <h1 className="font-serif font-bold text-[32px] text-[var(--color-parchment)] leading-tight mb-6">
        {law.title}
      </h1>

      <hr className="rule mb-6" />

      {/* Meta Bar */}
      <div className="flex items-center gap-6 mb-8">
        <span className={badgeClass}>{statusLower}</span>
        <div className="font-sans text-[12px] text-[var(--color-ink-secondary)]">
          <span className="text-[var(--color-parchment-dim)]">Bailable:</span> {law.bailable ? 'Yes' : 'No'}
        </div>
        <div className="font-sans text-[12px] text-[var(--color-ink-secondary)]">
          <span className="text-[var(--color-parchment-dim)]">Cognizable:</span> {law.cognizable ? 'Yes' : 'No'}
        </div>
      </div>

      {/* Description Area */}
      <div className="mb-10">
        <h3 className="font-serif font-semibold text-[15px] text-[var(--color-gold)] mb-3">
          Description
        </h3>
        <p className="font-serif text-[16px] leading-[1.65] text-[var(--color-parchment)] whitespace-pre-wrap">
          {law.description}
        </p>
      </div>

      <hr className="rule mb-6" />

      {/* Details Table */}
      <div className="mb-8">
        <h3 className="font-sans font-medium uppercase text-[9px] tracking-[0.12em] text-[var(--color-ink-secondary)] mb-4">
          DETAILS
        </h3>
        <div className="grid grid-cols-[120px_1fr] gap-y-3 font-sans text-[13px]">
          <div className="text-[var(--color-parchment-dim)]">Punishment</div>
          <div className="text-[var(--color-ink)]">{law.punishment || '—'}</div>
          
          <div className="text-[var(--color-parchment-dim)]">Court</div>
          <div className="text-[var(--color-ink)]">{law.court || '—'}</div>
          
          <div className="text-[var(--color-parchment-dim)]">State</div>
          <div className="text-[var(--color-ink)]">{law.state || 'All India'}</div>
          
          <div className="text-[var(--color-parchment-dim)]">Importance</div>
          <div className="text-[var(--color-ink)]">{law.importance || 5} / 10</div>
        </div>
      </div>

      {/* AI Summary Section */}
      {summary && (
        <>
          <hr className="rule mb-6" />
          <div className="mb-8">
            <h3 className="font-sans font-medium uppercase text-[9px] tracking-[0.12em] text-[var(--color-ink-secondary)] mb-4">
              SUMMARY (from /laws/:id/summary)
            </h3>
            <p className="font-serif text-[15px] leading-[1.6] text-[var(--color-parchment-dim)]">
              {summary.summary || summary}
            </p>
          </div>
        </>
      )}

      <hr className="rule mb-6" />

      {/* Footer Actions */}
      <div>
        <button 
          onClick={() => setShowHistory(true)}
          className="font-sans text-[13px] text-[var(--color-maroon-bright)] hover:underline flex items-center gap-1"
        >
          [View Revision History →]
        </button>
      </div>

      <LawHistoryDrawer 
        id={id} 
        open={showHistory} 
        onClose={() => setShowHistory(false)} 
      />
    </div>
  );
}
