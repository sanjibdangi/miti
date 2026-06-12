/**
 * BS ↔ AD Date Conversion Engine
 * Accurate conversion between Bikram Sambat and Gregorian calendars
 */

class DateConverter {
  constructor() {
    // Reference: BS 2000/01/01 = AD 1943/04/14
    this.bsEpochYear = 2000;
    this.adEpoch = new Date(1943, 3, 14); // Month is 0-indexed in JS
  }

  /**
   * Get total days in a BS year
   */
  getBSYearDays(year) {
    const data = BS_CALENDAR_DATA[year];
    if (!data) return 0;
    return data.reduce((sum, days) => sum + days, 0);
  }

  /**
   * Get days in a specific BS month
   */
  getBSMonthDays(year, month) {
    const data = BS_CALENDAR_DATA[year];
    if (!data || month < 1 || month > 12) return 0;
    return data[month - 1];
  }

  /**
   * Convert AD date to BS date
   * @param {Date} adDate - JavaScript Date object
   * @returns {Object} { year, month, day, dayOfWeek }
   */
  adToBS(adDate) {
    if (!(adDate instanceof Date) || isNaN(adDate)) {
      throw new Error('Invalid date');
    }

    // Calculate total days from epoch
    const adDateNorm = new Date(adDate.getFullYear(), adDate.getMonth(), adDate.getDate());
    const epochNorm = new Date(this.adEpoch.getFullYear(), this.adEpoch.getMonth(), this.adEpoch.getDate());
    const diffTime = adDateNorm.getTime() - epochNorm.getTime();
    let totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (totalDays < 0) {
      throw new Error('Date before supported range (before BS 2000)');
    }

    let bsYear = this.bsEpochYear;
    let bsMonth = 1;
    let bsDay = 1;

    // Find year
    while (totalDays > 0) {
      const yearDays = this.getBSYearDays(bsYear);
      if (yearDays === 0) {
        throw new Error(`BS year ${bsYear} not in lookup table`);
      }
      if (totalDays >= yearDays) {
        totalDays -= yearDays;
        bsYear++;
      } else {
        break;
      }
    }

    // Find month
    while (totalDays > 0) {
      const monthDays = this.getBSMonthDays(bsYear, bsMonth);
      if (totalDays >= monthDays) {
        totalDays -= monthDays;
        bsMonth++;
      } else {
        break;
      }
    }

    bsDay += totalDays;

    return {
      year: bsYear,
      month: bsMonth,
      day: bsDay,
      dayOfWeek: adDateNorm.getDay(), // 0=Sunday
    };
  }

  /**
   * Convert BS date to AD date
   * @param {number} bsYear
   * @param {number} bsMonth (1-12)
   * @param {number} bsDay (1-32)
   * @returns {Date} JavaScript Date object
   */
  bsToAD(bsYear, bsMonth, bsDay) {
    if (!BS_CALENDAR_DATA[bsYear]) {
      throw new Error(`BS year ${bsYear} not in lookup table`);
    }

    // Validate month/day
    if (bsMonth < 1 || bsMonth > 12) {
      throw new Error('Invalid BS month');
    }
    const maxDay = this.getBSMonthDays(bsYear, bsMonth);
    if (bsDay < 1 || bsDay > maxDay) {
      throw new Error(`Invalid BS day. Max for ${bsYear}/${bsMonth} is ${maxDay}`);
    }

    // Calculate total days from epoch
    let totalDays = 0;

    // Add complete years
    for (let y = this.bsEpochYear; y < bsYear; y++) {
      totalDays += this.getBSYearDays(y);
    }

    // Add complete months
    for (let m = 1; m < bsMonth; m++) {
      totalDays += this.getBSMonthDays(bsYear, m);
    }

    // Add remaining days
    totalDays += bsDay - 1;

    // Add to epoch
    const result = new Date(this.adEpoch);
    result.setDate(result.getDate() + totalDays);

    return result;
  }

  /**
   * Get today's date in both BS and AD
   */
  getToday() {
    const adDate = new Date();
    const bsDate = this.adToBS(adDate);
    return {
      ad: {
        year: adDate.getFullYear(),
        month: adDate.getMonth() + 1,
        day: adDate.getDate(),
        dayOfWeek: adDate.getDay(),
      },
      bs: bsDate,
    };
  }

  /**
   * Get the first day of BS month (which AD weekday does it start on)
   */
  getBSMonthFirstDay(bsYear, bsMonth) {
    const adDate = this.bsToAD(bsYear, bsMonth, 1);
    return adDate.getDay(); // 0=Sunday
  }

  /**
   * Check if a BS year is in the supported range
   */
  isValidBSYear(year) {
    return BS_CALENDAR_DATA.hasOwnProperty(year);
  }

  /**
   * Get the AD equivalent for each day in a BS month
   */
  getBSMonthWithAD(bsYear, bsMonth) {
    const days = this.getBSMonthDays(bsYear, bsMonth);
    const result = [];
    for (let d = 1; d <= days; d++) {
      const adDate = this.bsToAD(bsYear, bsMonth, d);
      result.push({
        bsDay: d,
        adDate: adDate,
        adDay: adDate.getDate(),
        adMonth: adDate.getMonth() + 1,
        adMonthName: AD_MONTHS_SHORT[adDate.getMonth()],
        dayOfWeek: adDate.getDay(),
      });
    }
    return result;
  }

  /**
   * Add days to a BS date
   */
  addDaysToBS(bsYear, bsMonth, bsDay, daysToAdd) {
    const adDate = this.bsToAD(bsYear, bsMonth, bsDay);
    adDate.setDate(adDate.getDate() + daysToAdd);
    return this.adToBS(adDate);
  }

  /**
   * Get difference in days between two BS dates
   */
  bsDateDiff(y1, m1, d1, y2, m2, d2) {
    const ad1 = this.bsToAD(y1, m1, d1);
    const ad2 = this.bsToAD(y2, m2, d2);
    const diff = ad2.getTime() - ad1.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }
}

// Make globally available
if (typeof window !== 'undefined') {
  window.DateConverter = DateConverter;
}
