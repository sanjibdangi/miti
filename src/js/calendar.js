/**
 * Calendar Renderer for Miti
 * Renders BS calendar with AD equivalents
 */

class CalendarRenderer {
  constructor(converter, bookmarkManager) {
    this.converter = converter;
    this.bookmarks = bookmarkManager;
    this.currentBSYear = null;
    this.currentBSMonth = null;
    this.selectedDate = null;
    this.today = converter.getToday();
  }

  /**
   * Initialize with current BS month
   */
  init() {
    this.currentBSYear = this.today.bs.year;
    this.currentBSMonth = this.today.bs.month;
  }

  /**
   * Navigate to previous month
   */
  prevMonth() {
    this.currentBSMonth--;
    if (this.currentBSMonth < 1) {
      this.currentBSMonth = 12;
      this.currentBSYear--;
    }
    if (!this.converter.isValidBSYear(this.currentBSYear)) {
      this.currentBSMonth = 1;
      this.currentBSYear++;
    }
  }

  /**
   * Navigate to next month
   */
  nextMonth() {
    this.currentBSMonth++;
    if (this.currentBSMonth > 12) {
      this.currentBSMonth = 1;
      this.currentBSYear++;
    }
    if (!this.converter.isValidBSYear(this.currentBSYear)) {
      this.currentBSMonth = 12;
      this.currentBSYear--;
    }
  }

  /**
   * Go to today
   */
  goToToday() {
    this.today = this.converter.getToday();
    this.currentBSYear = this.today.bs.year;
    this.currentBSMonth = this.today.bs.month;
  }

  /**
   * Render the calendar grid HTML
   */
  render() {
    const monthDays = this.converter.getBSMonthDays(this.currentBSYear, this.currentBSMonth);
    const firstDayOfWeek = this.converter.getBSMonthFirstDay(this.currentBSYear, this.currentBSMonth);
    const monthData = this.converter.getBSMonthWithAD(this.currentBSYear, this.currentBSMonth);

    // Header
    const bsMonthName = BS_MONTHS.en[this.currentBSMonth - 1];
    const bsMonthNameNp = BS_MONTHS.np[this.currentBSMonth - 1];
    
    // Get AD month range for this BS month
    const firstAD = monthData[0].adDate;
    const lastAD = monthData[monthData.length - 1].adDate;
    let adRange = '';
    if (firstAD.getMonth() === lastAD.getMonth()) {
      adRange = `${AD_MONTHS[firstAD.getMonth()]} ${firstAD.getFullYear()}`;
    } else if (firstAD.getFullYear() === lastAD.getFullYear()) {
      adRange = `${AD_MONTHS_SHORT[firstAD.getMonth()]} – ${AD_MONTHS_SHORT[lastAD.getMonth()]} ${firstAD.getFullYear()}`;
    } else {
      adRange = `${AD_MONTHS_SHORT[firstAD.getMonth()]} ${firstAD.getFullYear()} – ${AD_MONTHS_SHORT[lastAD.getMonth()]} ${lastAD.getFullYear()}`;
    }

    // Build grid
    let gridHTML = '';
    
    // Day headers
    for (let i = 0; i < 7; i++) {
      const isWeekend = i === 6; // Saturday
      gridHTML += `<div class="cal-day-header ${isWeekend ? 'weekend' : ''}">${BS_DAYS.short_en[i]}<span class="np-day-header">${BS_DAYS.short_np[i]}</span></div>`;
    }

    // Empty cells before first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      gridHTML += '<div class="cal-cell empty"></div>';
    }

    // Day cells
    for (const dayInfo of monthData) {
      const isToday = dayInfo.bsDay === this.today.bs.day && 
                      this.currentBSMonth === this.today.bs.month && 
                      this.currentBSYear === this.today.bs.year;
      const isSaturday = dayInfo.dayOfWeek === 6;
      const holiday = HolidayManager.getHoliday(this.currentBSYear, this.currentBSMonth, dayInfo.bsDay);
      const hasBookmark = this.bookmarks.hasBookmark(this.currentBSYear, this.currentBSMonth, dayInfo.bsDay);
      const isSelected = this.selectedDate && 
                        this.selectedDate.year === this.currentBSYear &&
                        this.selectedDate.month === this.currentBSMonth &&
                        this.selectedDate.day === dayInfo.bsDay;

      let classes = ['cal-cell'];
      if (isToday) classes.push('today');
      if (isSaturday) classes.push('saturday');
      if (holiday) classes.push('holiday');
      if (hasBookmark) classes.push('bookmarked');
      if (isSelected) classes.push('selected');

      const tooltipParts = [];
      if (holiday) tooltipParts.push(`${holiday.emoji} ${holiday.nameEn}`);
      
      gridHTML += `
        <div class="${classes.join(' ')}" 
             data-bs-day="${dayInfo.bsDay}" 
             data-bs-month="${this.currentBSMonth}" 
             data-bs-year="${this.currentBSYear}"
             ${tooltipParts.length ? `title="${tooltipParts.join(', ')}"` : ''}>
          <span class="bs-day">${dayInfo.bsDay}</span>
          <span class="bs-day-np">${MitiUtils.toNepaliNumeral(dayInfo.bsDay)}</span>
          <span class="ad-day">${dayInfo.adDay} ${dayInfo.adMonthName}</span>
          ${holiday ? `<span class="holiday-dot" style="background: var(--accent-gold)"></span>` : ''}
          ${hasBookmark ? '<span class="bookmark-dot"></span>' : ''}
        </div>
      `;
    }

    return {
      gridHTML,
      bsMonthName,
      bsMonthNameNp,
      bsYear: this.currentBSYear,
      bsYearNp: MitiUtils.toNepaliNumeral(this.currentBSYear),
      adRange,
      monthDays,
    };
  }

  /**
   * Select a date
   */
  selectDate(bsYear, bsMonth, bsDay) {
    this.selectedDate = { year: bsYear, month: bsMonth, day: bsDay };
  }

  /**
   * Get details for selected date
   */
  getSelectedDateInfo() {
    if (!this.selectedDate) return null;
    const { year, month, day } = this.selectedDate;
    
    try {
      const adDate = this.converter.bsToAD(year, month, day);
      const holiday = HolidayManager.getHoliday(year, month, day);
      const bookmarks = this.bookmarks.getByDate(year, month, day);
      const dayOfWeek = adDate.getDay();
      
      // Calculate days from today
      const todayAD = new Date();
      const diffDays = Math.ceil((adDate.getTime() - todayAD.getTime()) / (1000 * 60 * 60 * 24));

      return {
        bs: { year, month, day },
        bsFormatted: MitiUtils.formatBSDate(year, month, day),
        bsFormattedNp: MitiUtils.formatBSDate(year, month, day, 'np'),
        ad: adDate,
        adFormatted: MitiUtils.formatADDate(adDate),
        dayNameEn: BS_DAYS.en[dayOfWeek],
        dayNameNp: BS_DAYS.np[dayOfWeek],
        holiday,
        bookmarks,
        daysFromToday: diffDays,
        relativeText: MitiUtils.getRelativeTime(diffDays),
      };
    } catch (e) {
      return null;
    }
  }
}

if (typeof window !== 'undefined') {
  window.CalendarRenderer = CalendarRenderer;
}
