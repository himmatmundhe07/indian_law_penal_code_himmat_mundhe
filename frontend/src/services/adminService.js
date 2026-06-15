import api from './api';
import { API_ROUTES } from '../utils/constants';

export const fetchAllUsers     = (params = {}) => api.get(API_ROUTES.ADMIN_USERS, { params });
export const fetchUserById     = (id)          => api.get(API_ROUTES.ADMIN_USER_BY_ID(id));
export const banUser           = (id)          => api.patch(API_ROUTES.ADMIN_BAN_USER(id));
export const unbanUser         = (id)          => api.patch(API_ROUTES.ADMIN_UNBAN_USER(id));
export const changeUserRole    = (id, role)    => api.patch(API_ROUTES.ADMIN_CHANGE_ROLE(id), { role });
export const fetchReports      = (params = {}) => api.get(API_ROUTES.ADMIN_REPORTS, { params });
export const resolveReport     = (id)          => api.patch(API_ROUTES.ADMIN_RESOLVE_REPORT(id));
export const fetchSystemHealth = ()            => api.get(API_ROUTES.ADMIN_HEALTH);
export const fetchSystemLogs   = (params = {}) => api.get(API_ROUTES.ADMIN_LOGS, { params });
export const toggleMaintenance = ()            => api.post(API_ROUTES.ADMIN_MAINTENANCE);
export const clearCache        = ()            => api.delete(API_ROUTES.ADMIN_CLEAR_CACHE);
export const fetchSecurityEvents = (params={}) => api.get(API_ROUTES.ADMIN_SECURITY, { params });
