/* ROLE: time — помощни за време/формати (ISO, човекочитаемо). Без достъп до мрежа и UI. */

/**
 * Time utility functions for formatting, parsing, and manipulating dates and timestamps.
 * Includes human-readable formatting, duration calculations, and debounce/throttle helpers.
 */
// Time formatting utilities

// Format timestamp to human-readable string
export const formatTime = (timestamp, format = 'human') => {
  const date = new Date(timestamp);
  
  switch (format) {
    case 'iso':
      return date.toISOString();
    case 'timestamp':
      return date.getTime().toString();
    case 'human':
    default:
      return formatHumanTime(date);
  }
};

// Format date to human-readable string
export const formatHumanTime = (date) => {
  const now = new Date();
  const diff = now - date;
  const diffMinutes = Math.floor(diff / (1000 * 60));
  const diffHours = Math.floor(diff / (1000 * 60 * 60));
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Format time for display in chat
export const formatChatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (isYesterday) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
};

// Get current time in different formats
export const getCurrentTime = (format = 'human') => {
  const now = new Date();
  
  switch (format) {
    case 'iso':
      return now.toISOString();
    case 'timestamp':
      return now.getTime();
    case 'human':
    default:
      return now.toLocaleString();
  }
};

// Parse time string to Date object
export const parseTime = (timeString) => {
  // Try different time formats
  const formats = [
    // ISO format
    (str) => new Date(str),
    // Unix timestamp
    (str) => !isNaN(str) ? new Date(parseInt(str)) : null,
    // Common date formats
    (str) => new Date(str),
    // Custom formats can be added here
  ];
  
  for (const format of formats) {
    try {
      const result = format(timeString);
      if (result && !isNaN(result.getTime())) {
        return result;
      }
    } catch (e) {
      // Continue to next format
    }
  }
  
  throw new Error(`Unable to parse time string: ${timeString}`);
};

// Check if time is in the past
export const isPast = (timestamp) => {
  return new Date(timestamp) < new Date();
};

// Check if time is in the future
export const isFuture = (timestamp) => {
  return new Date(timestamp) > new Date();
};

// Get time difference in milliseconds
export const getTimeDifference = (timestamp1, timestamp2) => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return Math.abs(date1 - date2);
};

// Format duration in human-readable format
export const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  }
};

// Debounce function for time-based operations
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for time-based operations
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
