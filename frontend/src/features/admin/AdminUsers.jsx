import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { DataGrid } from '@mui/x-data-grid';
import api from '../../services/api';
import { API_ROUTES } from '../../utils/constants';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';

const ROLE_OPTIONS = ['user', 'admin', 'moderator'];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, id: null, isBanned: false });
  const [roleTarget, setRoleTarget] = useState({ id: null, role: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ROUTES.ADMIN_USERS);
      if (response.data.success) {
        setUsers(response.data.data.map(user => ({
          ...user,
          id: user._id
        })));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleConfirmBanToggle = async () => {
    const { id, isBanned } = confirmState;
    setConfirmState({ open: false, id: null, isBanned: false });
    
    try {
      const endpoint = isBanned ? API_ROUTES.ADMIN_UNBAN_USER(id) : API_ROUTES.ADMIN_BAN_USER(id);
      await api.patch(endpoint);
      toast.success(`User successfully ${isBanned ? 'unbanned' : 'banned'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleRoleChange = async () => {
    try {
      await api.patch(API_ROUTES.ADMIN_CHANGE_ROLE(roleTarget.id), { role: roleTarget.role });
      toast.success(`User role updated to ${roleTarget.role}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
    setRoleTarget({ id: null, role: '' });
  };

  const columns = [
    { 
      field: 'name', 
      headerName: 'NAME', 
      flex: 1, 
      minWidth: 150,
      renderCell: (params) => (
        <span className="font-serif text-[15px] text-[var(--color-parchment)]">
          {params.value || '—'}
        </span>
      )
    },
    { 
      field: 'email', 
      headerName: 'EMAIL', 
      flex: 1, 
      minWidth: 200,
      renderCell: (params) => (
        <span className="font-sans text-[13px] text-[var(--color-parchment-dim)] truncate">
          {params.value || '—'}
        </span>
      )
    },
    { 
      field: 'role', 
      headerName: 'ROLE', 
      width: 150,
      renderCell: (params) => (
        <select
          value={roleTarget.id === params.row.id ? roleTarget.role : params.value}
          onChange={(e) => setRoleTarget({ id: params.row.id, role: e.target.value })}
          className="btn-secondary py-1 text-[11px] min-h-0 h-auto"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r.toUpperCase()}</option>
          ))}
        </select>
      )
    },
    { 
      field: 'isBanned', 
      headerName: 'STATUS', 
      width: 120,
      renderCell: (params) => (
        <span className={params.value ? 'badge-repealed' : 'badge-active'}>
          {params.value ? 'BANNED' : 'ACTIVE'}
        </span>
      )
    },
    { 
      field: 'actions', 
      headerName: 'ACTIONS', 
      width: 250, 
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-2 font-sans text-[12px] text-[var(--color-maroon-bright)]">
          <button 
            onClick={() => setConfirmState({ open: true, id: params.row.id, isBanned: params.row.isBanned })}
            className="hover:underline"
          >
            {params.row.isBanned ? 'Unban' : 'Ban'}
          </button>
          
          {roleTarget.id === params.row.id && (
            <>
              <span className="text-[var(--color-rule)]">·</span>
              <button 
                onClick={handleRoleChange}
                className="hover:underline text-[var(--color-gold)] font-medium"
              >
                Save Role
              </button>
            </>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <Helmet>
        <title>User Management — Nyayakosha</title>
      </Helmet>

      <PageHeader 
        eyebrow="ADMINISTRATION"
        title="User Management"
        subtitle="Manage system users, roles, and access restrictions"
      />

      <div className="flex-1 bg-[var(--color-bg-base)] border-y border-[var(--color-rule)] overflow-hidden flex flex-col mt-4">
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          hideFooter={false}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
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
              backgroundColor: 'var(--color-bg-base)',
              color: 'var(--color-ink-secondary)',
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '2px solid var(--color-rule)',
              backgroundColor: 'var(--color-bg-base)',
              color: 'var(--color-parchment-dim)',
            },
            '& .MuiTablePagination-root': {
              color: 'var(--color-parchment-dim)',
            },
            '& .MuiSvgIcon-root': {
              color: 'var(--color-ink-secondary)',
            }
          }}
        />
      </div>

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.isBanned ? 'Unban User' : 'Ban User'}
        message={confirmState.isBanned
          ? 'This user will regain access to the platform.'
          : 'This user will be banned and lose access immediately.'}
        onConfirm={handleConfirmBanToggle}
        onCancel={() => setConfirmState({ open: false, id: null, isBanned: false })}
        variant={confirmState.isBanned ? 'success' : 'danger'}
      />
    </div>
  );
};

export default AdminUsers;
