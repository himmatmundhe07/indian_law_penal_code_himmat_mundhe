import React, { useEffect, useState } from 'react';
import { Drawer, CircularProgress } from '@mui/material';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function LawHistoryDrawer({ id, open, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && id) {
      fetchHistory();
    }
  }, [open, id]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/laws/${id}/history`);
      if (res.data.success) {
        setHistory(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load law history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer 
      anchor="right" 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--color-bg-elevated)',
          borderLeft: '1px solid var(--color-rule)',
          backgroundImage: 'none',
          boxShadow: 'none',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(13, 11, 14, 0.88)'
        }
      }}
    >
      <div className="flex flex-col h-full p-8">
        <div className="flex justify-between items-center mb-6 border-b border-[var(--color-rule)] pb-4">
          <h2 className="font-serif font-semibold text-[20px] text-[var(--color-parchment)] border-l-[4px] border-[var(--color-maroon)] pl-4">
            Revision History
          </h2>
          <button 
            onClick={onClose}
            className="font-sans font-medium text-[12px] text-[var(--color-parchment-dim)] hover:text-[var(--color-parchment)] uppercase tracking-[0.05em]"
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <CircularProgress sx={{ color: 'var(--color-maroon)' }} />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center font-sans text-[13px] text-[var(--color-ink-secondary)] mt-10 italic">
            No history records found for this law.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pl-2">
            <div className="relative border-l border-[var(--color-rule)] ml-[3px] pb-8">
              {history.map((entry, idx) => (
                <div key={idx} className="mb-8 relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute w-[6px] h-[6px] rounded-full bg-[var(--color-maroon)] top-[6px] left-[-3px]"></div>
                  
                  {/* Timestamp */}
                  <div className="font-mono text-[11px] text-[var(--color-parchment-dim)] mb-1">
                    {new Date(entry.updatedAt || entry.date).toLocaleString()}
                  </div>
                  
                  {/* Action / Title */}
                  <div className="font-sans font-medium text-[13px] text-[var(--color-parchment)] mb-1">
                    {entry.action || 'Record Updated'}
                  </div>
                  
                  {/* Description */}
                  <div className="font-sans text-[13px] text-[var(--color-ink)] mb-1 leading-relaxed">
                    {entry.description || entry.change || 'Modifications made to the law record.'}
                  </div>
                  
                  {/* By User */}
                  <div className="font-sans text-[11px] text-[var(--color-ink-secondary)]">
                    by {entry.updatedBy || 'System Admin'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
