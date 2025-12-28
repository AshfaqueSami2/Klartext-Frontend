/**
 * Grammar System Configuration
 * Central configuration for the grammar learning system
 */

export const GRAMMAR_CONFIG = {
  // ============================================================================
  // API Configuration
  // ============================================================================
  API: {
    // Base endpoints
    ENDPOINTS: {
      topics: '/grammar/topics',
      topicDetails: (id: string) => `/grammar/topics/${id}`,
      lessons: '/grammar/lessons',
      lessonDetails: (id: string) => `/grammar/lessons/${id}`,
      sectionComplete: (sectionId: string) => `/grammar/sections/${sectionId}/complete`,
      exerciseSubmit: '/grammar/exercises/submit',
    },

    // Retry configuration
    RETRY: {
      maxAttempts: 3,
      initialDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
      backoffMultiplier: 2,
    },

    // Request timeout
    TIMEOUT: 30000, // 30 seconds

    // Cache duration
    CACHE: {
      TOPICS_TTL: 5 * 60 * 1000, // 5 minutes
      TOPIC_DETAILS_TTL: 10 * 60 * 1000, // 10 minutes
      LESSONS_TTL: 5 * 60 * 1000, // 5 minutes
      LESSON_DETAILS_TTL: 10 * 60 * 1000, // 10 minutes
    },
  },

  // ============================================================================
  // UI Configuration
  // ============================================================================
  UI: {
    // Animation settings
    ANIMATION: {
      PARTICLE_COUNT: 50,
      PARTICLE_COLORS: ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B'],
      PARTICLE_SPEED: 0.5,
      PARTICLE_SPREAD: 800,
      PARTICLE_BASE_SIZE: 2,
      STAGGER_DELAY: 0.1,
      CARD_HOVER_SCALE: 1.05,
    },

    // Performance settings
    PERFORMANCE: {
      MOUSE_THROTTLE_MS: 100,
      SKELETON_COUNT: 8,
      VIRTUAL_SCROLL_THRESHOLD: 20, // Enable virtual scrolling after 20 items
    },

    // Loading states
    LOADING: {
      SKELETON_TOPICS_COUNT: 8,
      SKELETON_LESSONS_COUNT: 5,
      SKELETON_STATS_COUNT: 4,
      SKELETON_SECTIONS_COUNT: 4,
      SKELETON_EXERCISES_COUNT: 6,
    },
  },

  // ============================================================================
  // Accessibility Configuration
  // ============================================================================
  A11Y: {
    // ARIA labels
    LABELS: {
      TOPICS_GRID: 'Grammar topics grid',
      LESSONS_LIST: 'Topic lessons list',
      LEVEL_FILTER: 'Filter topics by CEFR level',
      PROGRESS_BAR: 'Topic completion progress',
      BACK_BUTTON: 'Navigate back to grammar topics',
    },

    // Keyboard shortcuts
    KEYBOARD: {
      ESCAPE_KEY: 'Escape',
      ENTER_KEY: 'Enter',
      SPACE_KEY: ' ',
    },
  },

  // ============================================================================
  // Analytics Configuration
  // ============================================================================
  ANALYTICS: {
    EVENTS: {
      TOPIC_VIEW: 'grammar_topic_view',
      TOPIC_CLICK: 'grammar_topic_click',
      LESSON_CLICK: 'grammar_lesson_click',
      LEVEL_FILTER: 'grammar_level_filter',
      ERROR_OCCURRED: 'grammar_error',
    },
  },

  // ============================================================================
  // Messages
  // ============================================================================
  MESSAGES: {
    ERROR: {
      FETCH_TOPICS_FAILED: 'Failed to load grammar topics',
      FETCH_TOPIC_FAILED: 'Failed to load topic details',
      FETCH_LESSONS_FAILED: 'Failed to load lessons',
      FETCH_LESSON_FAILED: 'Failed to load lesson details',
      SECTION_COMPLETE_FAILED: 'Failed to mark section as complete',
      NETWORK_ERROR: 'Network error. Please check your connection.',
      TIMEOUT_ERROR: 'Request timeout. Please try again.',
      UNKNOWN_ERROR: 'An unexpected error occurred',
    },
    SUCCESS: {
      TOPICS_LOADED: 'Topics loaded successfully',
      TOPIC_LOADED: 'Topic details loaded',
      LESSONS_LOADED: 'Lessons loaded successfully',
      LESSON_LOADED: 'Lesson details loaded',
      SECTION_COMPLETED: 'Section completed successfully',
    },
  },

  // ============================================================================
  // Validation Rules
  // ============================================================================
  VALIDATION: {
    TOPIC_ID_MIN_LENGTH: 24, // MongoDB ObjectId length
    LEVEL_PATTERN: /^(A1|A2|B1|B2|C1|C2)$/,
  },

  // ============================================================================
  // Feature Flags
  // ============================================================================
  FEATURES: {
    ENABLE_VIRTUAL_SCROLL: false, // Enable when needed
    ENABLE_ANALYTICS: true,
    ENABLE_ERROR_BOUNDARY: true,
    ENABLE_REQUEST_CANCELLATION: true,
    ENABLE_RETRY: true,
    ENABLE_CACHING: true,
    ENABLE_OFFLINE_MODE: false, // Future feature
  },

  // ============================================================================
  // Development Configuration
  // ============================================================================
  DEV: {
    LOG_API_CALLS: process.env.NODE_ENV === 'development',
    LOG_ERRORS: true,
    SHOW_RETRY_TOAST: process.env.NODE_ENV === 'development',
  },
} as const;
