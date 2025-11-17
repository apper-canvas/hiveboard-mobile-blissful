import { formatDistanceToNow, isValid } from 'date-fns';

/**
 * Safely formats a date to distance from now with error handling
 * @param {string|Date|number} date - The date to format
 * @param {Object} options - Options for formatDistanceToNow
 * @returns {string} - Formatted distance string or fallback message
 */
export const safeFormatDistanceToNow = (date, options = {}) => {
  if (!date) {
    return 'Date unavailable';
  }
  
  try {
    const dateObj = new Date(date);
    
    if (!isValid(dateObj)) {
      return 'Date unavailable';
    }
    
    return formatDistanceToNow(dateObj, options);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Date unavailable';
  }
};

/**
 * Safely formats a date to distance from now with "ago" suffix
 * @param {string|Date|number} date - The date to format
 * @returns {string} - Formatted distance string with "ago" or fallback
 */
export const safeFormatDistanceAgo = (date) => {
  const formatted = safeFormatDistanceToNow(date, { addSuffix: true });
  return formatted === 'Date unavailable' ? formatted : formatted;
};

export default safeFormatDistanceToNow;