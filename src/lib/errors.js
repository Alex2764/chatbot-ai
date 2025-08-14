/* ROLE: errors.js — централизирана система за съобщения за грешки, кодове и AppError клас за консистентна обработка на грешки. */

/**
 * Centralized error handling system with human-readable messages and structured responses.
 * Maps HTTP status codes to user-friendly error messages without exposing sensitive information.
 */

// HTTP Error Code Mappings
export const HTTP_ERROR_MESSAGES = {
  // Authentication & Authorization
  401: 'Невалиден ключ или липсват права (провери API ключа/организацията).',
  403: 'Невалиден ключ или липсват права (провери API ключа/организацията).',
  
  // Not Found
  404: 'Грешен endpoint/път (вероятно опит към локален /api/... без бекенд).',
  
  // Rate Limiting & Quota
  429: 'Изчерпана квота/билинг (влез в OpenAI billing и зареди средства).',
  
  // Server Errors
  500: 'Проблем при доставчика или мрежата — опитай пак.',
  502: 'Проблем при доставчика или мрежата — опитай пак.',
  503: 'Проблем при доставчика или мрежата — опитай пак.',
  504: 'Проблем при доставчика или мрежата — опитай пак.',
  
  // Network & Timeout
  'NETWORK_ERROR': 'Проблем при доставчика или мрежата — опитай пак.',
  'TIMEOUT_ERROR': 'Проблем при доставчика или мрежата — опитай пак.',
  
  // Generic
  'UNKNOWN_ERROR': 'Неочаквана грешка — опитай отново.'
};

// Error Categories
export const ERROR_CATEGORIES = {
  AUTHENTICATION: [401, 403],
  NOT_FOUND: [404],
  QUOTA_LIMIT: [429],
  SERVER_ERROR: [500, 502, 503, 504],
  NETWORK: ['NETWORK_ERROR', 'TIMEOUT_ERROR']
};

// Custom Error Class
export class AppError extends Error {
  constructor(message, code, category = 'UNKNOWN', details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.category = category;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      category: this.category,
      timestamp: this.timestamp,
      details: this.details
    };
  }
}

// HTTP Error Handler
export function handleHttpError(statusCode, responseText = '') {
  const humanMessage = HTTP_ERROR_MESSAGES[statusCode] || HTTP_ERROR_MESSAGES['UNKNOWN_ERROR'];
  
  let category = 'UNKNOWN';
  if (ERROR_CATEGORIES.AUTHENTICATION.includes(statusCode)) {
    category = 'AUTHENTICATION';
  } else if (ERROR_CATEGORIES.NOT_FOUND.includes(statusCode)) {
    category = 'NOT_FOUND';
  } else if (ERROR_CATEGORIES.QUOTA_LIMIT.includes(statusCode)) {
    category = 'QUOTA_LIMIT';
  } else if (ERROR_CATEGORIES.SERVER_ERROR.includes(statusCode)) {
    category = 'SERVER_ERROR';
  }

  return {
    success: false,
    code: statusCode,
    category,
    message: humanMessage,
    humanMessage,
    timestamp: new Date().toISOString()
  };
}

// Network Error Handler
export function handleNetworkError(error) {
  let category = 'NETWORK';
  let message = HTTP_ERROR_MESSAGES['NETWORK_ERROR'];
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    category = 'NETWORK';
    message = 'Проблем с мрежата — провери интернет връзката.';
  } else if (error.name === 'AbortError') {
    category = 'TIMEOUT';
    message = 'Заявката е прекъсната — опитай отново.';
  }

  return {
    success: false,
    code: 'NETWORK_ERROR',
    category,
    message,
    humanMessage: message,
    timestamp: new Date().toISOString()
  };
}

// OpenAI API Error Handler
export function handleOpenAIError(error) {
  // Extract status code from error message if available
  const statusMatch = error.message.match(/OpenAI API error: (\d+)/);
  if (statusMatch) {
    const statusCode = parseInt(statusMatch[1]);
    return handleHttpError(statusCode, error.message);
  }

  // Handle network errors
  if (error.name === 'TypeError' || error.message.includes('fetch')) {
    return handleNetworkError(error);
  }

  // Generic error
  return {
    success: false,
    code: 'UNKNOWN_ERROR',
    category: 'UNKNOWN',
    message: error.message,
    humanMessage: HTTP_ERROR_MESSAGES['UNKNOWN_ERROR'],
    timestamp: new Date().toISOString()
  };
}

// Error Reporter (for future analytics)
export function reportError(error, context = {}) {
  // Don't log sensitive information like API keys
  const safeError = {
    message: error.message,
    code: error.code || 'UNKNOWN',
    category: error.category || 'UNKNOWN',
    timestamp: error.timestamp || new Date().toISOString(),
    context: {
      ...context,
      // Remove any potentially sensitive data
      apiKey: '[REDACTED]',
      headers: context.headers ? '[REDACTED]' : undefined
    }
  };

  console.error('Error reported:', safeError);
  
  // In production, this could send to error tracking service
  // but never log API keys or sensitive data
}

// Success Response Helper
export function createSuccessResponse(data, message = 'Success') {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

// Validation Error Helper
export function createValidationError(field, message) {
  return {
    success: false,
    code: 'VALIDATION_ERROR',
    category: 'VALIDATION',
    message: `Validation failed for ${field}: ${message}`,
    humanMessage: message,
    field,
    timestamp: new Date().toISOString()
  };
}
