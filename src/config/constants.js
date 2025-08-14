/**
 * Application-wide constants and configuration values for limits, timeouts, and system settings.
 * Centralizes all configurable parameters for easy maintenance and customization.
 * 
 * Default values are optimized for:
 * - Better user experience (faster timeouts, smaller storage limits)
 * - Resource efficiency (reduced memory usage, faster cleanup)
 * - Security (shorter sessions, fewer retry attempts)
 */
// Application Constants

// Input Limits
export const MAX_INPUT_LENGTH = 4000;
export const MIN_INPUT_LENGTH = 1;
export const MAX_SYSTEM_PROMPT_LENGTH = 2000;
export const MAX_CONVERSATION_TITLE_LENGTH = 100;

// Timeouts and Delays
export const STREAM_TIMEOUT_MS = 10000;
export const REQUEST_TIMEOUT_MS = 30000;
export const TYPING_INDICATOR_DELAY_MS = 500;
export const AUTO_SAVE_INTERVAL_MS = 15000;
export const DEBOUNCE_DELAY_MS = 300;

// History and Storage
export const HISTORY_LIMIT = 100;
export const MAX_HISTORY_ITEMS = 500;
export const MAX_STORAGE_SIZE_MB = 25;
export const STORAGE_CLEANUP_INTERVAL_MS = 300000; // 5 minutes

// API Configuration
export const DEFAULT_API_ENDPOINT = 'https://api.openai.com/v1';
export const DEFAULT_MODEL = 'gpt-3.5-turbo';
export const MAX_TOKENS = 2000;
export const DEFAULT_TEMPERATURE = 0.7;
export const MAX_TEMPERATURE = 2.0;
export const MIN_TEMPERATURE = 0.0;

// Rate Limiting
export const MAX_REQUESTS_PER_MINUTE = 30;
export const MAX_REQUESTS_PER_HOUR = 500;
export const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

// UI Configuration
export const MAX_VISIBLE_MESSAGES = 50;
export const SCROLL_TO_BOTTOM_THRESHOLD = 100;
export const TOOLTIP_DELAY_MS = 500;
export const NOTIFICATION_DURATION_MS = 3000;

// File Upload Limits
export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_FILE_TYPES = ['text/plain', 'text/markdown', 'application/json'];
export const MAX_FILES_PER_UPLOAD = 3;

// Tool Configuration
export const MAX_TOOL_CALLS_PER_MESSAGE = 5;
export const TOOL_EXECUTION_TIMEOUT_MS = 15000;
export const MAX_TOOL_EXECUTION_TIME_MS = 30000;

// Error Handling
export const MAX_RETRY_ATTEMPTS = 2;
export const RETRY_DELAY_MS = 1000;
export const ERROR_DISPLAY_DURATION_MS = 5000;

// Accessibility
export const FOCUS_TRAP_TIMEOUT_MS = 100;
export const KEYBOARD_NAVIGATION_TIMEOUT_MS = 300;

// Performance
export const VIRTUALIZATION_THRESHOLD = 100;
export const LAZY_LOADING_THRESHOLD = 50;
export const MEMORY_CLEANUP_INTERVAL_MS = 300000; // 5 minutes

// Security
export const API_KEY_MIN_LENGTH = 20;
export const SESSION_TIMEOUT_MS = 1800000; // 30 minutes
export const MAX_LOGIN_ATTEMPTS = 3;
export const LOGIN_LOCKOUT_DURATION_MS = 600000; // 10 minutes

// Feature Flags
export const ENABLE_DEBUG_MODE = process.env.NODE_ENV === 'development';
export const ENABLE_ANALYTICS = false;
export const ENABLE_ERROR_REPORTING = true;
export const ENABLE_PERFORMANCE_MONITORING = false;

// Development
export const LOG_LEVEL = process.env.NODE_ENV === 'development' ? 'debug' : 'error';
export const ENABLE_HOT_RELOAD = process.env.NODE_ENV === 'development';
export const ENABLE_DEV_TOOLS = process.env.NODE_ENV === 'development';

// Export all constants as a single object
export const CONSTANTS = {
  // Input Limits
  MAX_INPUT_LENGTH,
  MIN_INPUT_LENGTH,
  MAX_SYSTEM_PROMPT_LENGTH,
  MAX_CONVERSATION_TITLE_LENGTH,
  
  // Timeouts and Delays
  STREAM_TIMEOUT_MS,
  REQUEST_TIMEOUT_MS,
  TYPING_INDICATOR_DELAY_MS,
  AUTO_SAVE_INTERVAL_MS,
  DEBOUNCE_DELAY_MS,
  
  // History and Storage
  HISTORY_LIMIT,
  MAX_HISTORY_ITEMS,
  MAX_STORAGE_SIZE_MB,
  STORAGE_CLEANUP_INTERVAL_MS,
  
  // API Configuration
  DEFAULT_API_ENDPOINT,
  DEFAULT_MODEL,
  MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  MAX_TEMPERATURE,
  MIN_TEMPERATURE,
  
  // Rate Limiting
  MAX_REQUESTS_PER_MINUTE,
  MAX_REQUESTS_PER_HOUR,
  RATE_LIMIT_WINDOW_MS,
  
  // UI Configuration
  MAX_VISIBLE_MESSAGES,
  SCROLL_TO_BOTTOM_THRESHOLD,
  TOOLTIP_DELAY_MS,
  NOTIFICATION_DURATION_MS,
  
  // File Upload Limits
  MAX_FILE_SIZE_MB,
  ALLOWED_FILE_TYPES,
  MAX_FILES_PER_UPLOAD,
  
  // Tool Configuration
  MAX_TOOL_CALLS_PER_MESSAGE,
  TOOL_EXECUTION_TIMEOUT_MS,
  MAX_TOOL_EXECUTION_TIME_MS,
  
  // Error Handling
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY_MS,
  ERROR_DISPLAY_DURATION_MS,
  
  // Accessibility
  FOCUS_TRAP_TIMEOUT_MS,
  KEYBOARD_NAVIGATION_TIMEOUT_MS,
  
  // Performance
  VIRTUALIZATION_THRESHOLD,
  LAZY_LOADING_THRESHOLD,
  MEMORY_CLEANUP_INTERVAL_MS,
  
  // Security
  API_KEY_MIN_LENGTH,
  SESSION_TIMEOUT_MS,
  MAX_LOGIN_ATTEMPTS,
  LOGIN_LOCKOUT_DURATION_MS,
  
  // Feature Flags
  ENABLE_DEBUG_MODE,
  ENABLE_ANALYTICS,
  ENABLE_ERROR_REPORTING,
  ENABLE_PERFORMANCE_MONITORING,
  
  // Development
  LOG_LEVEL,
  ENABLE_HOT_RELOAD,
  ENABLE_DEV_TOOLS
};

export default CONSTANTS;
