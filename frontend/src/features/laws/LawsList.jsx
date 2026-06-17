import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { DataGrid } from '@mui/x-data-grid';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LawFormModal from './LawFormModal';
import PageHeader from '../../components/common/PageHeader';

const STATUS_OPTIONS = ['active', 'inactive', 'repealed'];

const LawsList = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);
  
  const [laws, setLaws] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  
  const [categories, setCategories] = useState([]);

  // Filters (Persisted in sessionStorage)
  const [search, setSearch] = useState(() => {
    return sessionStorage.getItem('lawsSearch') || '';
  });
  const debouncedSearch = useDebounce(search, 500);
  const [filters, setFilters] = useState(() => {
    const saved = sessionStorage.getItem('lawsFilters');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (e) {
        // Fallback to default
      }
    }
    return { act: 'all', category: 'all', status: 'all' };
  });
  const [showFilters, setShowFilters] = useState(() => {
    return sessionStorage.getItem('lawsShowFilters') === 'true';
  });

  useEffect(() => {
    // Fetch dynamic categories
    const loadCategories = async () => {
      try {
        const response = await api.get('/stats/laws/by-category');
        if (response.data?.success) {
          const fetchedCats = response.data.data.map(item => item.category);
          setCategories(fetchedCats.sort());
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    sessionStorage.setItem('lawsSearch', search);
  }, [search]);

  useEffect(() => {
    sessionStorage.setItem('lawsFilters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    sessionStorage.setItem('lawsShowFilters', showFilters);
  }, [showFilters]);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editLaw, setEditLaw] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmAction, setConfirmAction] = useState('');

  const fetchLaws = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '/laws';
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      };

      if (debouncedSearch) {
        endpoint = '/search/laws';
        params.q = debouncedSearch;
      } else if (filters.act !== 'all') {
        endpoint = `/laws/filter/act/${filters.act}`;
      } else if (filters.category !== 'all') {
        endpoint = `/laws/filter/category/${filters.category}`;
      } else if (filters.status !== 'all') {
        endpoint = `/laws/filter/status/${filters.status}`;
      }

      const response = await api.get(endpoint, { params });
      
      if (response.data.success) {
        setLaws(response.data.data.map((item, index) => {
          let cat = item.category || item.offenseCategory || item.chapter_title || '—';
          if (cat && typeof cat === 'string' && cat !== '—') {
            cat = cat.charAt(0).toUpperCase() + cat.slice(1);
          }
          return {
            ...item,
            id: item._id || item.id || index,
            category: cat
          };
        }));
        setTotalCount(response.data.metadata?.total || response.data.data.length);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load laws data');
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch, filters]);

  useEffect(() => {
    fetchLaws();
  }, [fetchLaws]);

  const handleDelete = async () => {
    try {
      await api.delete(`/laws/${confirmId}`);
      toast.success('Law deleted permanently');
      fetchLaws();
    } catch (err) {
      toast.error('Failed to delete law');
    } finally {
      setConfirmId(null);
    }
  };

  const handleArchive = async () => {
    try {
      await api.patch(`/laws/${confirmId}/archive`);
      toast.success('Law archived');
      fetchLaws();
    } catch (err) {
      toast.error('Failed to archive law');
    } finally {
      setConfirmId(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.patch(`/laws/${id}/restore`);
      toast.success('Law restored');
      fetchLaws();
    } catch (err) {
      toast.error('Failed to restore law');
    }
  };

  const removeFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: 'all' }));
  };

  const columns = [
    { 
      field: 'act', 
      headerName: 'ACT', 
      width: 80,
      renderCell: (params) => (
        <span className="font-sans font-medium text-[11px] uppercase text-[var(--color-ink-secondary)]">
          {params.value || '—'}
        </span>
      )
    },
    { 
      field: 'section', 
      headerName: '§SECTION', 
      width: 100,
      renderCell: (params) => (
        <span className="font-mono font-bold text-[13px] text-[var(--color-gold-bright)] uppercase tracking-[0.04em]">
          §{String(params.value).replace('§', '')}
        </span>
      )
    },
    { 
      field: 'category', 
      headerName: 'CATEGORY', 
      width: 140,
      renderCell: (params) => (
        <span className="font-sans text-[12px] text-[var(--color-parchment-dim)] truncate block w-full max-w-[120px]">
          {params.value || '—'}
        </span>
      )
    },
    { 
      field: 'title', 
      headerName: 'TITLE', 
      flex: 1, 
      minWidth: 200,
      renderCell: (params) => (
        <span className="font-serif text-[15px] text-[var(--color-parchment)] line-clamp-2">
          {params.value || '—'}
        </span>
      )
    },
    { 
      field: 'status', 
      headerName: 'STATUS', 
      width: 100,
      renderCell: (params) => {
        const val = (params.value || 'active').toLowerCase();
        let badgeClass = 'badge-active';
        if (val === 'repealed') badgeClass = 'badge-repealed';
        if (val === 'inactive') badgeClass = 'badge-inactive';
        return <span className={badgeClass}>{val}</span>;
      }
    },
    { 
      field: 'actions', 
      headerName: 'ACTIONS', 
      width: 200, 
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-2 font-sans text-[12px] text-[var(--color-maroon-bright)]">
          <button onClick={() => navigate(`/laws/${params.row.id}`)} className="hover:underline">View</button>
          
          {role === 'admin' && (
            <>
              <span className="text-[var(--color-rule)]">·</span>
              <button onClick={() => { setEditLaw(params.row); setShowForm(true); }} className="hover:underline">Edit</button>
              
              {params.row.isArchived ? (
                <>
                  <span className="text-[var(--color-rule)]">·</span>
                  <button onClick={() => handleRestore(params.row.id)} className="hover:underline">Restore</button>
                </>
              ) : (
                <>
                  <span className="text-[var(--color-rule)]">·</span>
                  <button onClick={() => { setConfirmId(params.row.id); setConfirmAction('archive'); }} className="hover:underline">Archive</button>
                </>
              )}
              
              <span className="text-[var(--color-rule)]">·</span>
              <button onClick={() => { setConfirmId(params.row.id); setConfirmAction('delete'); }} className="hover:underline text-[#E57373]">Delete</button>
            </>
          )}
        </div>
      )
    },
  ];

  const totalPages = Math.ceil(totalCount / paginationModel.pageSize) || 1;
  const startCount = paginationModel.page * paginationModel.pageSize + 1;
  const endCount = Math.min((paginationModel.page + 1) * paginationModel.pageSize, totalCount);

  return (
    <div className="h-full flex flex-col">
      <Helmet>
        <title>Laws Directory — Nyayakosha</title>
      </Helmet>

      <PageHeader 
        eyebrow="LAWS & ACTS"
        title="Laws Directory"
        subtitle={`${totalCount} sections across the corpus`}
      />

      {/* Toolbar */}
      <div className="mb-4">
        {/* Search Bar Line */}
        <div className="flex">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search laws by section, title, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[46px] bg-[var(--color-bg-base)] border-0 border-b border-[var(--color-rule)] rounded-none px-0 text-[var(--color-parchment)] font-serif italic text-[15px] focus:border-l-[3px] focus:border-l-[var(--color-maroon)] focus:pl-3 transition-all placeholder:text-[var(--color-ink-secondary)]"
            />
            <button className="absolute right-0 top-0 bottom-0 px-4 font-sans font-medium text-[12px] uppercase tracking-[0.06em] text-[var(--color-parchment)] flex items-center bg-[var(--color-bg-surface)] border-l border-b border-[var(--color-rule)] hover:bg-[var(--color-maroon-muted)] transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Filter Toggles & Actions Line */}
        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <div className="flex items-center gap-4">
            <select 
              value={paginationModel.pageSize}
              onChange={(e) => setPaginationModel({ ...paginationModel, pageSize: Number(e.target.value), page: 0 })}
              className="btn-secondary py-[8px] pl-3 pr-8 appearance-none bg-transparent"
              style={{ width: 'auto' }}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
            {role === 'admin' && (
              <button 
                onClick={() => { setEditLaw(null); setShowForm(true); }}
                className="btn-primary"
              >
                Add Law
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel (Pattern 5.6) */}
        {showFilters && (
          <div className="mt-4 bg-[var(--color-bg-surface)] border border-[var(--color-rule)] rounded-[4px] p-4">
            <h3 className="font-sans font-medium uppercase text-[9px] tracking-[0.12em] text-[var(--color-ink-secondary)] mb-4">
              FILTER BY
            </h3>
            <hr className="rule mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <select 
                value={filters.act}
                onChange={(e) => setFilters(prev => ({ ...prev, act: e.target.value, category: 'all', status: 'all' }))}
                className="btn-secondary text-left"
              >
                <option value="all">Act</option>
                <option value="IPC">IPC</option>
                <option value="CrPC">CrPC</option>
                <option value="HMA">Hindu Marriage Act</option>
              </select>

              <select 
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, act: 'all', status: 'all' }))}
                className="btn-secondary text-left"
              >
                <option value="all">Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select 
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, act: 'all', category: 'all' }))}
                className="btn-secondary text-left capitalize"
              >
                <option value="all">Status</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <hr className="rule mb-3" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-sans text-[11px] text-[var(--color-ink-secondary)] mr-2">Active filters:</span>
              {Object.entries(filters).map(([key, val]) => {
                if (val === 'all') return null;
                return (
                  <div key={key} className="bg-[var(--color-maroon-muted)] border border-[var(--color-maroon)] text-[var(--color-gold)] font-sans text-[11px] rounded-[2px] px-2 py-1 flex items-center gap-2 capitalize">
                    {key}: {val}
                    <button onClick={() => removeFilter(key)} className="text-[var(--color-maroon-bright)] hover:text-[#E57373]">×</button>
                  </div>
                );
              })}
              {Object.values(filters).every(v => v === 'all') && (
                <span className="font-sans text-[11px] text-[var(--color-parchment-dim)] italic">None</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* The Laws Table */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <DataGrid
          rows={laws}
          columns={columns}
          loading={loading}
          hideFooter={true}
          getRowHeight={() => 'auto'}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-main': {
              backgroundColor: 'var(--color-bg-base)',
            },
            '& .MuiDataGrid-row': {
              minHeight: '52px !important',
              borderBottom: '1px solid var(--color-rule)',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(139, 26, 46, 0.06)',
              }
            },
            '& .MuiDataGrid-cell': {
              borderBottom: 'none',
              paddingY: '12px',
            },
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: '2px solid var(--color-rule)',
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            }
          }}
        />
        
        {/* Custom Pagination (Pattern 5.8) */}
        <div className="flex justify-between items-center py-4 border-t border-[var(--color-rule)] bg-[var(--color-bg-base)]">
          <button 
            disabled={paginationModel.page === 0}
            onClick={() => setPaginationModel(prev => ({ ...prev, page: prev.page - 1 }))}
            className="font-sans text-[13px] text-[var(--color-maroon-bright)] disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
          >
            ← Previous
          </button>
          
          <div className="text-center">
            <div className="font-mono text-[13px] text-[var(--color-parchment)]">
              Page {paginationModel.page + 1} of {totalPages}
            </div>
            <div className="font-sans text-[11px] text-[var(--color-ink-secondary)] mt-1">
              Showing {totalCount === 0 ? 0 : startCount}–{endCount} of {totalCount} sections
            </div>
          </div>

          <button 
            disabled={paginationModel.page >= totalPages - 1}
            onClick={() => setPaginationModel(prev => ({ ...prev, page: prev.page + 1 }))}
            className="font-sans text-[13px] text-[var(--color-maroon-bright)] disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
          >
            Next →
          </button>
        </div>
      </div>

      {showForm && (
        <LawFormModal 
          initialData={editLaw} 
          onClose={() => setShowForm(false)} 
          onSuccess={() => { setShowForm(false); fetchLaws(); }} 
        />
      )}

      {confirmId && (
        <ConfirmDialog
          open={!!confirmId}
          title={confirmAction === 'delete' ? 'Delete Law Permanently' : 'Archive Law'}
          message={confirmAction === 'delete' ? 'Are you sure you want to permanently delete this law? This action cannot be undone.' : 'Are you sure you want to archive this law?'}
          onConfirm={confirmAction === 'delete' ? handleDelete : handleArchive}
          onCancel={() => setConfirmId(null)}
          confirmText={confirmAction === 'delete' ? 'Delete' : 'Archive'}
          confirmColor={confirmAction === 'delete' ? 'error' : 'warning'}
        />
      )}
    </div>
  );
};

export default LawsList;
