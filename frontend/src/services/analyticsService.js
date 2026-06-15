import api from './api';
import { API_ROUTES } from '../utils/constants';

export const fetchMostViewed     = () => api.get(API_ROUTES.ANALYTICS_MOST_VIEWED);
export const fetchMostBookmarked = () => api.get(API_ROUTES.ANALYTICS_MOST_BOOKMARKED);
export const fetchByCategory     = () => api.get(API_ROUTES.ANALYTICS_BY_CATEGORY);
export const fetchByState        = () => api.get(API_ROUTES.ANALYTICS_BY_STATE);
export const fetchByCourt        = () => api.get(API_ROUTES.ANALYTICS_BY_COURT);
export const fetchRecentUpdates  = () => api.get(API_ROUTES.ANALYTICS_RECENT_UPDATES);
export const fetchPopularity     = () => api.get(API_ROUTES.ANALYTICS_POPULARITY);
export const fetchSearchTrends   = () => api.get(API_ROUTES.ANALYTICS_SEARCH_TRENDS);
export const fetchUserActivity   = () => api.get(API_ROUTES.ANALYTICS_USER_ACTIVITY);
export const fetchComplexity     = () => api.get(API_ROUTES.ANALYTICS_COMPLEXITY);
