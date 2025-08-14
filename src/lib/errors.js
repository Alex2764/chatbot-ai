/**
 * Error handling utilities with human-readable message mapping and consistent error classes.
 * Provides error codes, user-friendly messages, and error reporting capabilities.
 */
// Error mapping for human-readable messages
export const ERROR_MESSAGES = {
  // API Errors
  'API_KEY_MISSING': 'Please enter your OpenAI API key in settings',
  'API_KEY_INVALID': 'Your API key appears to be invalid. Please check and try again',
  'API_RATE_LIMIT': 'Rate limit exceeded. Please wait a moment before trying again',
  'API_QUOTA_EXCEEDED': 'You have exceeded your API quota. Please check your OpenAI account',
  'API_SERVER_ERROR': 'OpenAI servers are experiencing issues. Please try again later',
  'API_TIMEOUT': 'Request timed out. Please check your internet connection and try again',
  
  // Network Errors
  'NETWORK_ERROR': 'Network connection failed. Please check your internet connection',
  'NETWORK_TIMEOUT': 'Request timed out. Please try again',
  'NETWORK_OFFLINE': 'You appear to be offline. Please check your internet connection',
  
  // Validation Errors
  'INVALID_INPUT': 'Please check your input and try again',
  'MESSAGE_TOO_LONG': 'Message is too long. Please shorten it and try again',
  'EMPTY_MESSAGE': 'Please enter a message before sending',
  
  // Tool Errors
  'TOOL_NOT_FOUND': 'The requested tool is not available',
  'TOOL_VALIDATION_FAILED': 'Tool arguments are invalid. Please check the input',
  'TOOL_EXECUTION_FAILED': 'Tool execution failed. Please try again',
  
  // Storage Errors
  'STORAGE_QUOTA_EXCEEDED': 'Storage quota exceeded. Some data may not be saved',
  'STORAGE_ACCESS_DENIED': 'Cannot access local storage. Please check your browser settings',
  
  // General Errors
  'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again',
  'PERMISSION_DENIED': 'Permission denied. Please check your settings',
  'RESOURCE_NOT_FOUND': 'The requested resource was not found',
  'OPERATION_FAILED': 'Operation failed. Please try again'
};

// Error code mapping
export const ERROR_CODES = {
  'MISSING_API_KEY': 'API_KEY_MISSING',
  'INVALID_API_KEY': 'API_KEY_INVALID',
  'RATE_LIMIT_EXCEEDED': 'API_RATE_LIMIT',
  'QUOTA_EXCEEDED': 'API_QUOTA_EXCEEDED',
  'INTERNAL_SERVER_ERROR': 'API_SERVER_ERROR',
  'REQUEST_TIMEOUT': 'API_TIMEOUT',
  'NETWORK_ERROR': 'NETWORK_ERROR',
  'TIMEOUT': 'NETWORK_TIMEOUT',
  'OFFLINE': 'NETWORK_OFFLINE',
  'VALIDATION_ERROR': 'INVALID_INPUT',
  'MESSAGE_LENGTH_EXCEEDED': 'MESSAGE_TOO_LONG',
  'EMPTY_CONTENT': 'EMPTY_MESSAGE',
  'TOOL_NOT_FOUND': 'TOOL_NOT_FOUND',
  'VALIDATION_FAILED': 'TOOL_VALIDATION_FAILED',
  'EXECUTION_FAILED': 'TOOL_EXECUTION_FAILED',
  'QUOTA_EXCEEDED': 'STORAGE_QUOTA_EXCEEDED',
  'ACCESS_DENIED': 'STORAGE_ACCESS_DENIED',
  'UNKNOWN': 'UNKNOWN_ERROR',
  'PERMISSION_DENIED': 'PERMISSION_DENIED',
  'NOT_FOUND': 'RESOURCE_NOT_FOUND',
  'OPERATION_FAILED': 'OPERATION_FAILED'
};

// Get human-readable error message
export const getErrorMessage = (errorCode, fallbackMessage = 'An error occurred') => {
  const mappedCode = ERROR_CODES[errorCode] || errorCode;
  return ERROR_MESSAGES[mappedCode] || fallbackMessage;
};

// Error class for consistent error handling
export class AppError extends Error {
  constructor(code, message, details = null) {
    super(message || getErrorMessage(code));
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  getHumanMessage() {
    return getErrorMessage(this.code, this.message);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      humanMessage: this.getHumanMessage(),
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

// Error handler utility
export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);
  
  if (error instanceof AppError) {
    return error.getHumanMessage();
  }
  
  // Handle different error types
  if (error.name === 'AbortError') {
    return 'Operation was cancelled';
  }
  
  if (error.name === 'TypeError') {
    return 'Invalid operation. Please try again';
  }
  
  if (error.name === 'ReferenceError') {
    return 'System error. Please refresh the page and try again';
  }
  
  return getErrorMessage('UNKNOWN_ERROR');
};

// Error reporting utility
export const reportError = (error, context = '', userInfo = {}) => {
  const errorReport = {
    error: error instanceof AppError ? error.toJSON() : {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context,
    userInfo,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // In a real app, you'd send this to an error reporting service
  console.error('Error Report:', errorReport);
  
  return errorReport;
};
