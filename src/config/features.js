/**
 * Feature flags and configuration management for enabling/disabling application capabilities.
 * Provides environment-based feature toggles and grouped feature management.
 */
// Feature Flags and Configuration

// Core Features
export const ENABLE_PERSIST_HISTORY_DEFAULT = true;
export const ENABLE_TOOL_CONFIRM = true;
export const ENABLE_STREAMING = true;
export const ENABLE_TOOL_EXECUTION = true;
export const ENABLE_FILE_UPLOAD = false;
export const ENABLE_VOICE_INPUT = false;
export const ENABLE_VOICE_OUTPUT = false;

// UI Features
export const ENABLE_DARK_MODE = true;
export const ENABLE_THEME_SWITCHING = true;
export const ENABLE_CUSTOM_THEMES = false;
export const ENABLE_ANIMATIONS = true;
export const ENABLE_TRANSITIONS = true;
export const ENABLE_LOADING_STATES = true;
export const ENABLE_ERROR_BOUNDARIES = true;

// Chat Features
export const ENABLE_MESSAGE_EDITING = false;
export const ENABLE_MESSAGE_DELETION = false;
export const ENABLE_MESSAGE_REACTIONS = false;
export const ENABLE_CONVERSATION_FOLDERS = false;
export const ENABLE_CONVERSATION_SEARCH = true;
export const ENABLE_CONVERSATION_EXPORT = true;
export const ENABLE_CONVERSATION_IMPORT = true;

// Tool Features
export const ENABLE_TOOL_REGISTRY = true;
export const ENABLE_TOOL_VALIDATION = true;
export const ENABLE_TOOL_LOGGING = true;
export const ENABLE_TOOL_METRICS = false;
export const ENABLE_TOOL_PERMISSIONS = false;
export const ENABLE_TOOL_RATE_LIMITING = true;
export const ENABLE_TOOL_TIMEOUTS = true;

// Security Features
export const ENABLE_API_KEY_ENCRYPTION = false;
export const ENABLE_SESSION_MANAGEMENT = false;
export const ENABLE_RATE_LIMITING = true;
export const ENABLE_INPUT_SANITIZATION = true;
export const ENABLE_XSS_PROTECTION = true;
export const ENABLE_CSRF_PROTECTION = false;

// Performance Features
export const ENABLE_MESSAGE_VIRTUALIZATION = false;
export const ENABLE_LAZY_LOADING = true;
export const ENABLE_IMAGE_OPTIMIZATION = false;
export const ENABLE_CACHE_MANAGEMENT = true;
export const ENABLE_MEMORY_CLEANUP = true;
export const ENABLE_PERFORMANCE_MONITORING = false;

// Accessibility Features
export const ENABLE_SCREEN_READER_SUPPORT = true;
export const ENABLE_KEYBOARD_NAVIGATION = true;
export const ENABLE_HIGH_CONTRAST_MODE = true;
export const ENABLE_REDUCED_MOTION = true;
export const ENABLE_FOCUS_INDICATORS = true;
export const ENABLE_ALT_TEXT_GENERATION = false;

// Analytics and Monitoring
export const ENABLE_USAGE_ANALYTICS = false;
export const ENABLE_ERROR_TRACKING = true;
export const ENABLE_PERFORMANCE_TRACKING = false;
export const ENABLE_USER_BEHAVIOR_TRACKING = false;
export const ENABLE_CRASH_REPORTING = false;

// Development Features
export const ENABLE_DEBUG_MODE = process.env.NODE_ENV === 'development';
export const ENABLE_DEV_TOOLS = process.env.NODE_ENV === 'development';
export const ENABLE_HOT_RELOAD = process.env.NODE_ENV === 'development';
export const ENABLE_LOG_LEVEL_OVERRIDE = process.env.NODE_ENV === 'development';

// Experimental Features
export const ENABLE_EXPERIMENTAL_UI = false;
export const ENABLE_EXPERIMENTAL_TOOLS = false;
export const ENABLE_EXPERIMENTAL_FEATURES = false;

// Feature Groups
export const FEATURE_GROUPS = {
  core: {
    persistHistory: ENABLE_PERSIST_HISTORY_DEFAULT,
    toolConfirm: ENABLE_TOOL_CONFIRM,
    streaming: ENABLE_STREAMING,
    toolExecution: ENABLE_TOOL_EXECUTION,
    fileUpload: ENABLE_FILE_UPLOAD,
    voiceInput: ENABLE_VOICE_INPUT,
    voiceOutput: ENABLE_VOICE_OUTPUT
  },
  ui: {
    darkMode: ENABLE_DARK_MODE,
    themeSwitching: ENABLE_THEME_SWITCHING,
    customThemes: ENABLE_CUSTOM_THEMES,
    animations: ENABLE_ANIMATIONS,
    transitions: ENABLE_TRANSITIONS,
    loadingStates: ENABLE_LOADING_STATES,
    errorBoundaries: ENABLE_ERROR_BOUNDARIES
  },
  chat: {
    messageEditing: ENABLE_MESSAGE_EDITING,
    messageDeletion: ENABLE_MESSAGE_DELETION,
    messageReactions: ENABLE_MESSAGE_REACTIONS,
    conversationFolders: ENABLE_CONVERSATION_FOLDERS,
    conversationSearch: ENABLE_CONVERSATION_SEARCH,
    conversationExport: ENABLE_CONVERSATION_EXPORT,
    conversationImport: ENABLE_CONVERSATION_IMPORT
  },
  tools: {
    registry: ENABLE_TOOL_REGISTRY,
    validation: ENABLE_TOOL_VALIDATION,
    logging: ENABLE_TOOL_LOGGING,
    metrics: ENABLE_TOOL_METRICS,
    permissions: ENABLE_TOOL_PERMISSIONS,
    rateLimiting: ENABLE_TOOL_RATE_LIMITING,
    timeouts: ENABLE_TOOL_TIMEOUTS
  },
  security: {
    apiKeyEncryption: ENABLE_API_KEY_ENCRYPTION,
    sessionManagement: ENABLE_SESSION_MANAGEMENT,
    rateLimiting: ENABLE_RATE_LIMITING,
    inputSanitization: ENABLE_INPUT_SANITIZATION,
    xssProtection: ENABLE_XSS_PROTECTION,
    csrfProtection: ENABLE_CSRF_PROTECTION
  },
  performance: {
    messageVirtualization: ENABLE_MESSAGE_VIRTUALIZATION,
    lazyLoading: ENABLE_LAZY_LOADING,
    imageOptimization: ENABLE_IMAGE_OPTIMIZATION,
    cacheManagement: ENABLE_CACHE_MANAGEMENT,
    memoryCleanup: ENABLE_MEMORY_CLEANUP,
    performanceMonitoring: ENABLE_PERFORMANCE_MONITORING
  },
  accessibility: {
    screenReaderSupport: ENABLE_SCREEN_READER_SUPPORT,
    keyboardNavigation: ENABLE_KEYBOARD_NAVIGATION,
    highContrastMode: ENABLE_HIGH_CONTRAST_MODE,
    reducedMotion: ENABLE_REDUCED_MOTION,
    focusIndicators: ENABLE_FOCUS_INDICATORS,
    altTextGeneration: ENABLE_ALT_TEXT_GENERATION
  },
  analytics: {
    usageAnalytics: ENABLE_USAGE_ANALYTICS,
    errorTracking: ENABLE_ERROR_TRACKING,
    performanceTracking: ENABLE_PERFORMANCE_TRACKING,
    userBehaviorTracking: ENABLE_USER_BEHAVIOR_TRACKING,
    crashReporting: ENABLE_CRASH_REPORTING
  },
  development: {
    debugMode: ENABLE_DEBUG_MODE,
    devTools: ENABLE_DEV_TOOLS,
    hotReload: ENABLE_HOT_RELOAD,
    logLevelOverride: ENABLE_LOG_LEVEL_OVERRIDE
  },
  experimental: {
    experimentalUI: ENABLE_EXPERIMENTAL_UI,
    experimentalTools: ENABLE_EXPERIMENTAL_TOOLS,
    experimentalFeatures: ENABLE_EXPERIMENTAL_FEATURES
  }
};

// Feature Toggle Functions
export const isFeatureEnabled = (featureName) => {
  // Check if feature exists in any group
  for (const group of Object.values(FEATURE_GROUPS)) {
    if (featureName in group) {
      return group[featureName];
    }
  }
  return false;
};

export const getFeatureGroup = (groupName) => {
  return FEATURE_GROUPS[groupName] || {};
};

export const getAllEnabledFeatures = () => {
  const enabledFeatures = [];
  for (const [groupName, group] of Object.entries(FEATURE_GROUPS)) {
    for (const [featureName, isEnabled] of Object.entries(group)) {
      if (isEnabled) {
        enabledFeatures.push(`${groupName}.${featureName}`);
      }
    }
  }
  return enabledFeatures;
};

export const getAllDisabledFeatures = () => {
  const disabledFeatures = [];
  for (const [groupName, group] of Object.entries(FEATURE_GROUPS)) {
    for (const [featureName, isEnabled] of Object.entries(group)) {
      if (!isEnabled) {
        disabledFeatures.push(`${groupName}.${featureName}`);
      }
    }
  }
  return disabledFeatures;
};

// Environment-based feature overrides
export const getEnvironmentFeatures = () => {
  const env = process.env.NODE_ENV;
  const isDev = env === 'development';
  const isProd = env === 'production';
  const isTest = env === 'test';
  
  return {
    isDevelopment: isDev,
    isProduction: isProd,
    isTest,
    enableDebugFeatures: isDev,
    enableProductionFeatures: isProd,
    enableTestFeatures: isTest
  };
};

export default FEATURE_GROUPS;
