import api from './api';
import { API_ROUTES } from '../utils/constants';

export const fetchTotalCount  = () => api.get(API_ROUTES.STATS_COUNT);
export const fetchActiveCount = () => api.get(API_ROUTES.STATS_ACTIVE);
export const fetchRepealedCount = () => api.get(API_ROUTES.STATS_REPEALED);
export const fetchByAct       = () => api.get(API_ROUTES.STATS_BY_ACT);
export const fetchByCategory  = () => api.get(API_ROUTES.STATS_BY_CATEGORY);
export const fetchByState     = () => api.get(API_ROUTES.STATS_BY_STATE);
export const fetchByCourt     = () => api.get(API_ROUTES.STATS_BY_COURT);
export const fetchRecentStats = () => api.get(API_ROUTES.STATS_RECENT);
export const fetchTrending    = () => api.get(API_ROUTES.STATS_TRENDING);
export const fetchBookmarks   = () => api.get(API_ROUTES.STATS_BOOKMARKS);
