type Id = number | string

export const ENDPOINTS = {
  // ─── Authentication ──────────────────────────────────────────────────────────
  AUTH: {
    LOGIN:           '/auth/login',
    LOGOUT:          '/auth/logout',
    REFRESH:         '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD:  '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // ─── Profile (own user) ──────────────────────────────────────────────────────
  PROFILE: {
    GET:                '/profile',
    UPDATE:             '/profile',
    AVATAR:             '/profile/avatar',
    SETTINGS:           '/profile/settings',
    ASSESSMENT_HISTORY: '/profile/assessment-history',
    TEAM:               '/profile/team',
  },

  /**
   * @deprecated Use `ENDPOINTS.ADMIN.USERS.*` instead.
   * The legacy `/users` surface mixes manager- and admin-scope semantics; admin-only
   * user management migrated to `/admin/users` per USM-01..05.
   */
  USERS: {
    LIST:       '/users',
    DETAIL:     (id: Id) => `/users/${id}`,
    UPDATE:     (id: Id) => `/users/${id}`,
    BY_TEAM:    (teamId: Id) => `/users/by-team/${teamId}`,
    DEACTIVATE: (id: Id) => `/users/${id}/deactivate-or-delete`,
    REACTIVATE: (id: Id) => `/users/${id}/reactivate`,
  },

  // ─── Teams ───────────────────────────────────────────────────────────────────
  TEAMS: {
    LIST:             '/teams',
    DETAIL:           (id: Id) => `/teams/${id}`,
    UPDATE:           (id: Id) => `/teams/${id}`,
    DELETE:           (id: Id) => `/teams/${id}`,
    MEMBERS:          (id: Id) => `/teams/${id}/members`,
    MEMBER:           (teamId: Id, userId: Id) => `/teams/${teamId}/members/${userId}`,
    MEMBER_NOTES:     (teamId: Id, userId: Id) => `/teams/${teamId}/members/${userId}/notes`,
    MEMBER_LOGS:      (teamId: Id, userId: Id) => `/teams/${teamId}/members/${userId}/logs`,
    ADD_MANAGER:      (teamId: Id, userId: Id) => `/teams/${teamId}/managers/${userId}`,
    REMOVE_MANAGER:   (teamId: Id, userId: Id) => `/teams/${teamId}/managers/${userId}`,
  },

  // ─── Team Members ────────────────────────────────────────────────────────────
  TEAM_MEMBERS: {
    LIST:        '/team-members',
    ADD_BY_USER: '/team-members/by-user',
    ADD_BY_TEAM: '/team-members/by-team',
    UPDATE:      (id: Id) => `/team-members/${id}`,
    DELETE:      (id: Id) => `/team-members/${id}`,
  },

  // ─── Skills / Taxonomy (general read) ───────────────────────────────────────
  SKILLS: {
    LIST:   '/skills',
    DETAIL: (id: Id) => `/skills/${id}`,
    UPDATE: (id: Id) => `/skills/${id}`,
    DELETE: (id: Id) => `/skills/${id}`,
  },

  // ─── Departments (general read) ──────────────────────────────────────────────
  DEPARTMENTS: {
    LIST:           '/departments',
    DETAIL:         (id: Id) => `/departments/${id}`,
    UPDATE:         (id: Id) => `/departments/${id}`,
    DELETE:         (id: Id) => `/departments/${id}`,
    ADD_MANAGER:    (deptId: Id, userId: Id) => `/departments/${deptId}/managers/${userId}`,
    REMOVE_MANAGER: (deptId: Id, userId: Id) => `/departments/${deptId}/managers/${userId}`,
  },

  // ─── Careers (general read) ──────────────────────────────────────────────────
  CAREERS: {
    LIST:           '/careers',
    DETAIL:         (id: Id) => `/careers/${id}`,
    UPDATE:         (id: Id) => `/careers/${id}`,
    DELETE:         (id: Id) => `/careers/${id}`,
    ADD_MANAGER:    (careerId: Id, userId: Id) => `/careers/${careerId}/managers/${userId}`,
    REMOVE_MANAGER: (careerId: Id, userId: Id) => `/careers/${careerId}/managers/${userId}`,
  },

  // ─── Skill Assessments ───────────────────────────────────────────────────────
  ASSESSMENTS: {
    LIST:           '/assessments',
    CREATE:         '/assessments',
    DETAIL:         (id: Id) => `/assessments/${id}`,
    MANAGER_REVIEW: (id: Id) => `/assessments/${id}/manager-review`,
    LOGS:           (id: Id) => `/assessments/${id}/logs`,
    EXPORT:         '/assessments/export',
  },

  // ─── Development Goals ───────────────────────────────────────────────────────
  GOALS: {
    LIST:     '/goals',
    CREATE:   '/goals',
    UPDATE:   (id: Id) => `/goals/${id}`,
    COMPLETE: (id: Id) => `/goals/${id}/complete`,
    ACCEPT:   (id: Id) => `/goals/${id}/accept`,
    REJECT:   (id: Id) => `/goals/${id}/reject`,
    SUGGEST:  '/goals/suggest',
  },

  // ─── Documents ───────────────────────────────────────────────────────────────
  DOCUMENTS: {
    LIST:        '/documents',
    CREATE:      '/documents',
    DETAIL:      (id: Id) => `/documents/${id}`,
    UPDATE:      (id: Id) => `/documents/${id}`,
    DELETE:      (id: Id) => `/documents/${id}`,
    UPLOAD:      '/documents/upload',
    ASSIGN:      (id: Id) => `/documents/${id}/assign`,
    ASSIGN_TEAM: (id: Id) => `/documents/${id}/assign-team`,
    AI_TAGS:     (id: Id) => `/documents/${id}/ai-tags`,
  },

  // ─── My Upskill (assignee view) ──────────────────────────────────────────────
  MY_UPSKILL: {
    LIST:          '/my-upskill',
    UPDATE_STATUS: (assignmentId: Id) => `/my-upskill/${assignmentId}/status`,
  },

  // ─── Projects ────────────────────────────────────────────────────────────────
  PROJECTS: {
    LIST:               '/projects',
    CREATE:             '/projects',
    DETAIL:             (id: Id) => `/projects/${id}`,
    UPDATE:             (id: Id) => `/projects/${id}`,
    DELETE:             (id: Id) => `/projects/${id}`,
    DASHBOARD:          (id: Id) => `/projects/${id}/dashboard`,
    SKILLS:             (id: Id) => `/projects/${id}/skills`,
    SKILL:              (projectId: Id, skillsetId: Id) => `/projects/${projectId}/skills/${skillsetId}`,
    MEMBERS:            (id: Id) => `/projects/${id}/members`,
    MEMBER:             (projectId: Id, userId: Id) => `/projects/${projectId}/members/${userId}`,
  },

  // ─── My Projects (staff view) ────────────────────────────────────────────────
  MY_PROJECTS: '/my-projects',

  // ─── Team learning progress ──────────────────────────────────────────────────
  TEAM_LEARNING: {
    PROGRESS: '/team/learning-progress',
    REMIND:   '/team/learning-progress/remind',
  },

  // ─── Notifications ───────────────────────────────────────────────────────────
  NOTIFICATIONS: {
    LIST:         '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_ONE:     (id: Id) => `/notifications/${id}/read`,
    MARK_ALL:     '/notifications/read-all',
  },

  // ─── Dashboard & Reporting ───────────────────────────────────────────────────
  DASHBOARD: {
    PERSONAL:        '/dashboard/personal',
    TEAM_MATRIX:     '/dashboard/team-matrix',
    COMPLETION_RATE: '/dashboard/completion-rate',
    TREND:           '/dashboard/trend',
  },

  // ─── Export ──────────────────────────────────────────────────────────────────
  EXPORT: {
    PROFILE_PDF:  '/export/profile/pdf',
    TEAM_MATRIX:  '/export/team-matrix',
  },

  // ─── Admin — User Management ─────────────────────────────────────────────────
  ADMIN: {
    USERS: {
      LIST:     '/admin/users',
      CREATE:   '/admin/users',
      DETAIL:   (id: Id) => `/admin/users/${id}`,
      DELETE:   (id: Id) => `/admin/users/${id}`,
      STATUS:   (id: Id) => `/admin/users/${id}/status`,
      ACTIVITY: (id: Id) => `/admin/users/${id}/activity`,
    },

    // Admin — Skill Taxonomy
    CAREERS: {
      LIST:   '/admin/careers',
      CREATE: '/admin/careers',
      DETAIL: (id: Id) => `/admin/careers/${id}`,
      UPDATE: (id: Id) => `/admin/careers/${id}`,
      DELETE: (id: Id) => `/admin/careers/${id}`,
    },
    DEPARTMENTS: {
      LIST:   '/admin/departments',
      CREATE: '/admin/departments',
      DETAIL: (id: Id) => `/admin/departments/${id}`,
      UPDATE: (id: Id) => `/admin/departments/${id}`,
      DELETE: (id: Id) => `/admin/departments/${id}`,
    },
    SKILLSETS: {
      LIST:   '/admin/skillsets',
      CREATE: '/admin/skillsets',
      DETAIL: (id: Id) => `/admin/skillsets/${id}`,
      UPDATE: (id: Id) => `/admin/skillsets/${id}`,
      DELETE: (id: Id) => `/admin/skillsets/${id}`,
      IMPORT: '/admin/skillsets/import',
      EXPORT: '/admin/skillsets/export',
    },

    // Admin — Positions
    POSITIONS: {
      LIST:   '/admin/positions',
      CREATE: '/admin/positions',
      DETAIL: (id: Id) => `/admin/positions/${id}`,
      UPDATE: (id: Id) => `/admin/positions/${id}`,
      DELETE: (id: Id) => `/admin/positions/${id}`,
    },

    // Admin — Config
    CONFIG: {
      ROLES:               '/admin/config/roles',
      PERMISSIONS:         '/admin/config/permissions',
      SMTP:                '/admin/config/smtp',
      SMTP_TEST:           '/admin/config/smtp/test',
      RATING_SCALE:        '/admin/config/rating-scale',
      NOTIFICATION_RULES:  '/admin/config/notification-rules',
    },

    // Admin — Email Templates
    EMAIL_TEMPLATES: {
      LIST:   '/admin/email-templates',
      CREATE: '/admin/email-templates',
      DETAIL: (id: Id) => `/admin/email-templates/${id}`,
      UPDATE: (id: Id) => `/admin/email-templates/${id}`,
    },

    // Admin — Audit Logs
    AUDIT_LOGS: '/admin/audit-logs',
  },

  // ─── AI Features ─────────────────────────────────────────────────────────────
  AI: {
    RESOURCE_MATCH:           '/ai/resource-match',
    RESOURCE_MATCH_ALLOCATE:  '/ai/resource-match/allocate',
    GAP_ANALYSIS_USER:        (userId: Id) => `/ai/gap-analysis/user/${userId}`,
    GAP_ANALYSIS_TEAM:        (teamId: Id) => `/ai/gap-analysis/team/${teamId}`,
    LEARNING_PATH:            '/ai/learning-path',
    LEARNING_PATH_ASSIGN:     '/ai/learning-path/assign',
    EXTRACT_SKILLS:           '/ai/extract-skills',
    ASSESSMENT_ASSISTANT_START:   '/ai/assessment-assistant/start',
    ASSESSMENT_ASSISTANT_MESSAGE: '/ai/assessment-assistant/message',
    GENERATE_TAXONOMY:        '/ai/generate-taxonomy',
    GENERATE_TAXONOMY_IMPORT: '/ai/generate-taxonomy/import',
    TREND:                    (teamId: Id) => `/ai/trend/${teamId}`,
    RISK_SCORE:               (teamId: Id) => `/ai/risk-score/${teamId}`,
    MATRIX_QUERY:             '/ai/matrix-query',
    MATRIX_QUERY_SAVE:        '/ai/matrix-query/save',
    MATRIX_QUERY_SAVED:       '/ai/matrix-query/saved',
    MATRIX_QUERY_RUN:         (id: Id) => `/ai/matrix-query/run/${id}`,
  },

  HEALTH: '/health',
} as const
