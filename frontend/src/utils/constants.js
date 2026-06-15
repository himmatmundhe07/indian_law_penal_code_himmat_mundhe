export const API_ROUTES = {
  // Auth
  REGISTER:         '/auth/register',
  LOGIN:            '/auth/login',
  LOGOUT:           '/auth/logout',
  PROFILE:          '/auth/profile',

  // Profile & Auth Extra
  CHANGE_PASSWORD:  '/auth/change-password',
  SESSIONS:         '/auth/sessions',

  // Laws CRUD
  LAWS:             '/laws',
  LAW_BY_ID:        (id) => `/laws/${id}`,
  LAW_RECENT:       '/laws/recent',
  LAW_ARCHIVED:     '/laws/archived',
  ARCHIVE_LAW:      (id) => `/laws/${id}/archive`,
  RESTORE_LAW:      (id) => `/laws/${id}/restore`,

  // Search
  SEARCH_LAWS:      '/search/laws',

  // Filters
  FILTER_BY_ACT:        (act)       => `/laws/filter/act/${act}`,
  FILTER_BY_CHAPTER:    (chId)      => `/laws/filter/chapter/${chId}`,
  FILTER_BY_SECTION:    (secNum)    => `/laws/filter/section/${secNum}`,

  // Analytics
  ANALYTICS_MOST_VIEWED:     '/analytics/laws/most-viewed',
  ANALYTICS_MOST_BOOKMARKED: '/analytics/laws/most-bookmarked',
  ANALYTICS_BY_CATEGORY:     '/analytics/laws/by-category',
  ANALYTICS_BY_STATE:        '/analytics/laws/by-state',
  ANALYTICS_BY_COURT:        '/analytics/laws/by-court',
  ANALYTICS_RECENT_UPDATES:  '/analytics/laws/recent-updates',
  ANALYTICS_POPULARITY:      '/analytics/laws/popularity',
  ANALYTICS_SEARCH_TRENDS:   '/analytics/laws/search-trends',
  ANALYTICS_USER_ACTIVITY:   '/analytics/laws/user-activity',
  ANALYTICS_COMPLEXITY:      '/analytics/laws/complexity',

  // Stats
  STATS_COUNT:       '/stats/laws/count',
  STATS_ACTIVE:      '/stats/laws/active',
  STATS_REPEALED:    '/stats/laws/repealed',
  STATS_RECENT:      '/stats/laws/recent',
  STATS_BY_ACT:      '/stats/laws/by-act',
  STATS_BY_CATEGORY: '/stats/laws/by-category',
  STATS_BY_STATE:    '/stats/laws/by-state',
  STATS_BY_COURT:    '/stats/laws/by-court',
  STATS_TRENDING:    '/stats/laws/trending',
  STATS_BOOKMARKS:   '/stats/laws/bookmarks',

  // Admin
  ADMIN_USERS:          '/admin/users',
  ADMIN_USER_BY_ID:     (id) => `/admin/users/${id}`,
  ADMIN_BAN_USER:       (id) => `/admin/users/${id}/ban`,
  ADMIN_UNBAN_USER:     (id) => `/admin/users/${id}/unban`,
  ADMIN_CHANGE_ROLE:    (id) => `/admin/users/${id}/role`,
  ADMIN_REPORTS:        '/admin/reports',
  ADMIN_RESOLVE_REPORT: (id) => `/admin/reports/${id}/resolve`,
  ADMIN_HEALTH:         '/admin/system/health',
  ADMIN_LOGS:           '/admin/system/logs',
  ADMIN_MAINTENANCE:    '/admin/system/maintenance',
  ADMIN_CLEAR_CACHE:    '/admin/cache/clear',
  ADMIN_SECURITY:       '/admin/security/events',
};
