/**
 * Utility functions for Miti
 */

class MitiUtils {
  /**
   * Convert number to Nepali numerals
   */
  static toNepaliNumeral(num) {
    return String(num).replace(/[0-9]/g, (d) => NEPALI_DIGITS[parseInt(d)]);
  }

  /**
   * Format BS date as string
   */
  static formatBSDate(year, month, day, lang = 'both') {
    const monthName = lang === 'np' ? BS_MONTHS.np[month - 1] : BS_MONTHS.en[month - 1];
    if (lang === 'np') {
      return `${MitiUtils.toNepaliNumeral(day)} ${monthName} ${MitiUtils.toNepaliNumeral(year)}`;
    }
    return `${day} ${monthName} ${year}`;
  }

  /**
   * Format AD date as string
   */
  static formatADDate(date) {
    const months = AD_MONTHS;
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  /**
   * Format AD date short
   */
  static formatADDateShort(date) {
    return `${date.getDate()} ${AD_MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
  }

  /**
   * Get Nepali day name
   */
  static getNepaliDayName(dayOfWeek) {
    return BS_DAYS.np[dayOfWeek];
  }

  /**
   * Get English day name
   */
  static getEnglishDayName(dayOfWeek) {
    return BS_DAYS.en[dayOfWeek];
  }

  /**
   * Copy text to clipboard with visual feedback
   */
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  }

  /**
   * Show a toast notification
   */
  static showToast(message, duration = 2000) {
    const existing = document.querySelector('.miti-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'miti-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /**
   * Pad number with leading zero
   */
  static pad(num, size = 2) {
    let s = String(num);
    while (s.length < size) s = '0' + s;
    return s;
  }

  /**
   * Get relative time string
   */
  static getRelativeTime(days) {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days > 0) return `${days} days from now`;
    return `${Math.abs(days)} days ago`;
  }

  /**
   * Debounce function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

if (typeof window !== 'undefined') {
  window.MitiUtils = MitiUtils;
}
