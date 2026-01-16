/**
 * Logging Utility
 * Sanitizes error messages before logging to prevent sensitive data exposure
 */

// Maximum document size in bytes (Firestore limit is 1MB, we'll use 500KB as safe limit)
const MAX_DOCUMENT_SIZE = 500 * 1024; // 500KB

/**
 * Calculate approximate document size
 * @param {Object} data - Document data
 * @returns {number} - Approximate size in bytes
 */
export const calculateDocumentSize = (data) => {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch (error) {
    // Fallback to rough estimation
    return JSON.stringify(data).length * 2; // UTF-16 uses 2 bytes per char
  }
};

/**
 * Validate document size
 * @param {Object} data - Document data
 * @param {number} maxSize - Maximum size in bytes (default 500KB)
 * @returns {Object} - {valid: boolean, size: number, maxSize: number}
 */
export const validateDocumentSize = (data, maxSize = MAX_DOCUMENT_SIZE) => {
  const size = calculateDocumentSize(data);
  return {
    valid: size <= maxSize,
    size,
    maxSize,
    sizeKB: Math.round(size / 1024),
    maxSizeKB: Math.round(maxSize / 1024)
  };
};

/**
 * Sanitize error object for logging
 * Removes sensitive information like tokens, passwords, email addresses
 * @param {Error|string} error - Error object or message
 * @returns {string} - Sanitized error message
 */
export const sanitizeError = (error) => {
  let message = '';
  
  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message || 'Unknown error';
  } else if (error && error.message) {
    message = error.message;
  } else {
    message = 'An error occurred';
  }

  // Remove potential sensitive data patterns
  message = message
    // Remove email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    // Remove potential tokens/keys (long alphanumeric strings)
    .replace(/[a-zA-Z0-9]{32,}/g, '[TOKEN]')
    // Remove potential passwords (password= or pwd= patterns)
    .replace(/(password|pwd|token|key|secret)=\S+/gi, '$1=[REDACTED]')
    // Remove Firebase UIDs (if accidentally logged)
    .replace(/uid:\s*['"]?[a-zA-Z0-9]{20,}['"]?/gi, 'uid: [UID]')
    // Remove potential API keys
    .replace(/AIza[a-zA-Z0-9_-]{35}/g, '[API_KEY]');

  return message;
};

/**
 * Safe console.error that sanitizes messages
 * @param {string} context - Context of the error (e.g., 'Error creating template')
 * @param {Error|string} error - Error object or message
 */
export const logError = (context, error) => {
  const sanitizedMessage = sanitizeError(error);
  
  // In production, you might want to send this to a logging service
  // For now, we'll just log to console with sanitized message
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, sanitizedMessage);
  } else {
    // In production, only log generic messages
    console.error(`[${context}]`, 'An error occurred');
  }
};

/**
 * Safe console.warn that sanitizes messages
 * @param {string} context - Context of the warning
 * @param {string} message - Warning message
 */
export const logWarning = (context, message) => {
  const sanitizedMessage = sanitizeError(message);
  
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[${context}]`, sanitizedMessage);
  }
};

/**
 * Safe console.log for debugging (only in development)
 * @param {string} context - Context of the log
 * @param {any} data - Data to log
 */
export const logDebug = (context, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG: ${context}]`, data);
  }
};

export default {
  calculateDocumentSize,
  validateDocumentSize,
  sanitizeError,
  logError,
  logWarning,
  logDebug
};
