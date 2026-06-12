/**
 * Miti — Main Application Controller
 */

class MitiApp {
  constructor() {
    this.converter = new DateConverter();
    this.bookmarks = new BookmarkManager();
    this.calendar = new CalendarRenderer(this.converter, this.bookmarks);
    this.isExpanded = false;
    this.currentTab = 'calendar';
    this.theme = (window.electronAPI && window.electronAPI.storeGet && window.electronAPI.storeGet('miti_theme'))
      || localStorage.getItem('miti_theme') || 'dark';
    this.init();
  }

  init() {
    this.calendar.init();
    this.applyTheme();
    this.renderPill();
    this.bindEvents();
    this.startClock();

    HolidayManager.loadRemote('https://miti-five.vercel.app/data/holidays.json', () => {
      this.renderPill();
      if (this.isExpanded) this.renderExpanded();
    });

    // Listen for expand/collapse from Electron
    if (window.electronAPI) {
      window.electronAPI.onToggleExpand((expanded) => {
        this.isExpanded = expanded;
        this.updateView();
      });
    }
  }

  /**
   * Apply theme
   */
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    if (window.electronAPI && window.electronAPI.storeSet) {
      window.electronAPI.storeSet('miti_theme', this.theme);
    } else {
      localStorage.setItem('miti_theme', this.theme);
    }
    this.applyTheme();
  }

  /**
   * Render the compact pill view
   */
  renderPill() {
    const today = this.converter.getToday();
    const holiday = HolidayManager.getHoliday(today.bs.year, today.bs.month, today.bs.day);

    // BS Date
    const bsDateEl = document.getElementById('pill-bs-date');
    const bsDateNpEl = document.getElementById('pill-bs-date-np');
    const adDateEl = document.getElementById('pill-ad-date');
    const dayNameEl = document.getElementById('pill-day-name');
    const holidayEl = document.getElementById('pill-holiday');

    if (bsDateEl) {
      bsDateEl.textContent = `${today.bs.day} ${BS_MONTHS.en[today.bs.month - 1]} ${today.bs.year}`;
    }
    if (bsDateNpEl) {
      bsDateNpEl.textContent = `${MitiUtils.toNepaliNumeral(today.bs.day)} ${BS_MONTHS.np[today.bs.month - 1]} ${MitiUtils.toNepaliNumeral(today.bs.year)}`;
    }
    if (adDateEl) {
      const ad = new Date();
      adDateEl.textContent = MitiUtils.formatADDateShort(ad);
    }
    if (dayNameEl) {
      dayNameEl.textContent = `${BS_DAYS.en[today.bs.dayOfWeek]} • ${BS_DAYS.np[today.bs.dayOfWeek]}`;
    }
    if (holidayEl) {
      if (holiday) {
        holidayEl.textContent = `${holiday.emoji} ${holiday.nameEn}`;
        holidayEl.style.display = 'block';
      } else {
        holidayEl.style.display = 'none';
      }
    }
  }

  /**
   * Render the expanded view based on current tab
   */
  renderExpanded() {
    // Update today bar
    const today = this.converter.getToday();
    const bsEl = document.getElementById('expanded-bs-date');
    const adEl = document.getElementById('expanded-ad-date');
    if (bsEl) bsEl.textContent = `${today.bs.day} ${BS_MONTHS.en[today.bs.month - 1]} ${today.bs.year}`;
    if (adEl) adEl.textContent = MitiUtils.formatADDateShort(new Date());

    switch (this.currentTab) {
      case 'calendar':
        this.renderCalendar();
        break;
      case 'converter':
        this.renderConverter();
        break;
      case 'bookmarks':
        this.renderBookmarksList();
        break;
      case 'holidays':
        this.renderHolidaysList();
        break;
    }
    this.updateTabStyles();
  }

  /**
   * Render calendar view
   */
  renderCalendar() {
    const data = this.calendar.render();
    const container = document.getElementById('expanded-content');

    container.innerHTML = `
      <div class="calendar-view">
        <div class="cal-header">
          <button class="cal-nav-btn" id="cal-prev" aria-label="Previous month">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="cal-title-group" id="cal-title">
            <div class="cal-title-bs">${data.bsMonthName} ${data.bsYear}</div>
            <div class="cal-title-np">${data.bsMonthNameNp} ${data.bsYearNp}</div>
            <div class="cal-title-ad">${data.adRange}</div>
          </div>
          <button class="cal-nav-btn" id="cal-next" aria-label="Next month">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div class="cal-today-btn-wrap">
          <button class="cal-today-btn" id="cal-goto-today">Today</button>
        </div>
        <div class="cal-grid" id="cal-grid">
          ${data.gridHTML}
        </div>
        <div class="cal-detail" id="cal-detail"></div>
      </div>
    `;

    this.bindCalendarEvents();
  }

  /**
   * Render converter view
   */
  renderConverter() {
    const today = this.converter.getToday();
    const container = document.getElementById('expanded-content');

    container.innerHTML = `
      <div class="converter-view">
        <div class="converter-section">
          <h3 class="converter-title">
            <span class="flag-icon">🇳🇵</span> BS → AD
          </h3>
          <div class="converter-inputs">
            <div class="input-group">
              <label>Year (वर्ष)</label>
              <input type="number" id="bs-year-input" value="${today.bs.year}" min="2000" max="2090" class="converter-input">
            </div>
            <div class="input-group">
              <label>Month (महिना)</label>
              <select id="bs-month-input" class="converter-input">
                ${BS_MONTHS.en.map((m, i) => `<option value="${i + 1}" ${i + 1 === today.bs.month ? 'selected' : ''}>${m} (${BS_MONTHS.np[i]})</option>`).join('')}
              </select>
            </div>
            <div class="input-group">
              <label>Day (दिन)</label>
              <input type="number" id="bs-day-input" value="${today.bs.day}" min="1" max="32" class="converter-input">
            </div>
          </div>
          <button class="convert-btn" id="bs-to-ad-btn">
            Convert to AD
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <div class="convert-result" id="bs-to-ad-result"></div>
        </div>

        <div class="converter-divider">
          <span class="divider-icon">⇅</span>
        </div>

        <div class="converter-section">
          <h3 class="converter-title">
            <span class="flag-icon">🌍</span> AD → BS
          </h3>
          <div class="converter-inputs">
            <div class="input-group">
              <label>Date</label>
              <input type="date" id="ad-date-input" value="${today.ad.year}-${MitiUtils.pad(today.ad.month)}-${MitiUtils.pad(today.ad.day)}" class="converter-input">
            </div>
          </div>
          <button class="convert-btn" id="ad-to-bs-btn">
            Convert to BS
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <div class="convert-result" id="ad-to-bs-result"></div>
        </div>

        <div class="converter-section" style="margin-top: 12px;">
          <h3 class="converter-title">
            <span class="flag-icon">📐</span> Date Calculator
          </h3>
          <div class="converter-inputs">
            <div class="input-group">
              <label>Days to add/subtract</label>
              <input type="number" id="calc-days-input" value="30" class="converter-input" placeholder="e.g. 30 or -7">
            </div>
          </div>
          <button class="convert-btn" id="calc-btn">
            Calculate from Today
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <div class="convert-result" id="calc-result"></div>
        </div>
      </div>
    `;

    this.bindConverterEvents();
  }

  /**
   * Render bookmarks list
   */
  renderBookmarksList() {
    const container = document.getElementById('expanded-content');
    const upcoming = this.bookmarks.getUpcoming(this.converter, 20);
    const all = this.bookmarks.getAll();

    let html = `
      <div class="bookmarks-view">
        <div class="bookmarks-header">
          <h3 class="section-title">📌 Bookmarked Dates</h3>
          <button class="add-bookmark-btn" id="add-bookmark-btn">+ Add</button>
        </div>
    `;

    if (all.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-icon">📌</div>
          <p>No bookmarks yet</p>
          <p class="empty-hint">Click on a date in the calendar to bookmark it,<br>or use the + Add button above.</p>
        </div>
      `;
    } else {
      html += '<div class="bookmark-list">';
      for (const bm of all) {
        let adDateStr = '';
        let daysUntil = '';
        try {
          const adDate = this.converter.bsToAD(bm.bsYear, bm.bsMonth, bm.bsDay);
          adDateStr = MitiUtils.formatADDateShort(adDate);
          const diff = Math.ceil((adDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          daysUntil = MitiUtils.getRelativeTime(diff);
        } catch { }

        html += `
          <div class="bookmark-item" style="border-left-color: ${bm.color}">
            <div class="bookmark-info">
              <div class="bookmark-label">${bm.label}</div>
              <div class="bookmark-date">
                ${MitiUtils.formatBSDate(bm.bsYear, bm.bsMonth, bm.bsDay)} BS
              </div>
              <div class="bookmark-meta">
                ${adDateStr} • ${daysUntil}
              </div>
              ${bm.notes ? `<div class="bookmark-notes">${bm.notes}</div>` : ''}
            </div>
            <button class="bookmark-delete" data-id="${bm.id}" title="Remove">✕</button>
          </div>
        `;
      }
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;

    this.bindBookmarkEvents();
  }

  /**
   * Render holidays list
   */
  renderHolidaysList() {
    const container = document.getElementById('expanded-content');
    const upcoming = HolidayManager.getUpcomingHolidays(this.converter, 15);
    const observances = HolidayManager.getTodayObservances(this.converter);

    let html = `
      <div class="holidays-view">
        <h3 class="section-title">🎊 Upcoming Holidays & Festivals</h3>
        <div class="holiday-list">
    `;

    for (const h of upcoming) {
      const bsDate = MitiUtils.formatBSDate(h.bsYear, h.bsMonth, h.bsDay);
      const adDate = MitiUtils.formatADDateShort(h.adDate);
      const typeClass = `holiday-type-${h.type}`;

      html += `
        <div class="holiday-item ${typeClass}">
          <div class="holiday-emoji">${h.emoji}</div>
          <div class="holiday-info">
            <div class="holiday-name">${h.nameEn}</div>
            <div class="holiday-name-np">${h.name}</div>
            <div class="holiday-dates">${bsDate} BS • ${adDate}</div>
          </div>
          <div class="holiday-countdown">
            ${h.daysUntil === 0 ? '<span class="today-badge">Today!</span>' : `<span class="days-count">${h.daysUntil}</span><span class="days-label">days</span>`}
          </div>
        </div>
      `;
    }

    if (upcoming.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-icon">🎊</div>
          <p>No upcoming holidays data available</p>
        </div>
      `;
    }

    html += '</div>';

    if (observances.length) {
      html += `
        <div class="observance-note">
          ${observances.map(o => `${o.emoji} <b>${o.nameEn}</b> (${o.name})${o.note ? ` — ${o.note}` : ''}`).join('<br>')}
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Update tab active styles
   */
  updateTabStyles() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === this.currentTab);
    });
  }

  /**
   * Update view based on expanded/collapsed state
   */
  updateView() {
    const pill = document.getElementById('pill');
    const expanded = document.getElementById('expanded');

    if (this.isExpanded) {
      pill.classList.add('hidden');
      expanded.classList.add('visible');
      this.renderExpanded();
    } else {
      pill.classList.remove('hidden');
      expanded.classList.remove('visible');
      this.renderPill();
    }
  }

  /**
   * Bind main events
   */
  bindEvents() {
    // Expand button on pill
    document.getElementById('pill-expand')?.addEventListener('click', () => {
      if (window.electronAPI) {
        window.electronAPI.toggleExpand();
      } else {
        this.isExpanded = true;
        this.updateView();
      }
    });

    // Collapse button
    document.addEventListener('click', (e) => {
      if (e.target.closest('#collapse-btn')) {
        if (window.electronAPI) {
          window.electronAPI.toggleExpand();
        } else {
          this.isExpanded = false;
          this.updateView();
        }
      }
    });

    // Tab switching
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.tab-btn');
      if (tabBtn) {
        this.currentTab = tabBtn.dataset.tab;
        this.renderExpanded();
      }
    });

    // Theme toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('#theme-toggle')) {
        this.toggleTheme();
      }
    });

    // Minimize to tray
    document.addEventListener('click', (e) => {
      if (e.target.closest('#minimize-btn')) {
        if (window.electronAPI) {
          window.electronAPI.minimizeToTray();
        }
      }
    });

    // Copy date on pill click
    document.getElementById('pill-dates')?.addEventListener('click', () => {
      const today = this.converter.getToday();
      const bsStr = MitiUtils.formatBSDate(today.bs.year, today.bs.month, today.bs.day);
      const adStr = MitiUtils.formatADDate(new Date());
      MitiUtils.copyToClipboard(`${bsStr} BS | ${adStr}`);
      MitiUtils.showToast('📋 Date copied!');
    });

    // Make pill draggable (for Electron)
    const dragArea = document.getElementById('pill-drag');
    if (dragArea) {
      dragArea.style.webkitAppRegion = 'drag';
    }
  }

  /**
   * Bind calendar-specific events
   */
  bindCalendarEvents() {
    // Previous month
    document.getElementById('cal-prev')?.addEventListener('click', () => {
      const grid = document.getElementById('cal-grid');
      grid.classList.add('slide-out-right');
      setTimeout(() => {
        this.calendar.prevMonth();
        this.renderCalendar();
        const newGrid = document.getElementById('cal-grid');
        newGrid.classList.add('slide-in-left');
        setTimeout(() => newGrid.classList.remove('slide-in-left'), 300);
      }, 150);
    });

    // Next month
    document.getElementById('cal-next')?.addEventListener('click', () => {
      const grid = document.getElementById('cal-grid');
      grid.classList.add('slide-out-left');
      setTimeout(() => {
        this.calendar.nextMonth();
        this.renderCalendar();
        const newGrid = document.getElementById('cal-grid');
        newGrid.classList.add('slide-in-right');
        setTimeout(() => newGrid.classList.remove('slide-in-right'), 300);
      }, 150);
    });

    // Go to today
    document.getElementById('cal-goto-today')?.addEventListener('click', () => {
      this.calendar.goToToday();
      this.renderCalendar();
    });

    // Click on date cell
    document.querySelectorAll('.cal-cell:not(.empty)').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const bsDay = parseInt(cell.dataset.bsDay);
        const bsMonth = parseInt(cell.dataset.bsMonth);
        const bsYear = parseInt(cell.dataset.bsYear);
        
        this.calendar.selectDate(bsYear, bsMonth, bsDay);
        
        // Update selection visuals
        document.querySelectorAll('.cal-cell').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');

        // Show detail
        this.showDateDetail();
      });

      // Right-click to bookmark
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const bsDay = parseInt(cell.dataset.bsDay);
        const bsMonth = parseInt(cell.dataset.bsMonth);
        const bsYear = parseInt(cell.dataset.bsYear);
        this.showAddBookmarkDialog(bsYear, bsMonth, bsDay);
      });
    });
  }

  /**
   * Show date detail panel
   */
  showDateDetail() {
    const info = this.calendar.getSelectedDateInfo();
    if (!info) return;

    const detail = document.getElementById('cal-detail');
    if (!detail) return;

    detail.innerHTML = `
      <div class="detail-card">
        <div class="detail-header">
          <div class="detail-day-name">${info.dayNameEn} • ${info.dayNameNp}</div>
          <div class="detail-relative">${info.relativeText}</div>
        </div>
        <div class="detail-dates">
          <div class="detail-bs">
            <span class="detail-label">BS</span>
            <span class="detail-value">${info.bsFormatted}</span>
            <span class="detail-value-np">${info.bsFormattedNp}</span>
          </div>
          <div class="detail-ad">
            <span class="detail-label">AD</span>
            <span class="detail-value">${info.adFormatted}</span>
          </div>
        </div>
        ${info.holiday ? `<div class="detail-holiday">${info.holiday.emoji} ${info.holiday.nameEn} (${info.holiday.name})</div>` : ''}
        ${HolidayManager.getObservances(info.bs.year, info.bs.month, info.bs.day).map(o =>
          `<div class="detail-observance">${o.emoji} ${o.nameEn} (${o.name})${o.note ? ` — ${o.note}` : ''}</div>`).join('')}
        <div class="detail-actions">
          <button class="detail-btn copy-btn" data-copy="${info.bsFormatted} BS | ${info.adFormatted}">
            📋 Copy
          </button>
          <button class="detail-btn bookmark-btn" data-bs-year="${info.bs.year}" data-bs-month="${info.bs.month}" data-bs-day="${info.bs.day}">
            📌 Bookmark
          </button>
        </div>
      </div>
    `;

    detail.classList.add('visible');

    // Bind detail actions
    detail.querySelector('.copy-btn')?.addEventListener('click', (e) => {
      MitiUtils.copyToClipboard(e.target.dataset.copy);
      MitiUtils.showToast('📋 Date copied!');
    });

    detail.querySelector('.bookmark-btn')?.addEventListener('click', (e) => {
      const y = parseInt(e.target.dataset.bsYear);
      const m = parseInt(e.target.dataset.bsMonth);
      const d = parseInt(e.target.dataset.bsDay);
      this.showAddBookmarkDialog(y, m, d);
    });
  }

  /**
   * Show add bookmark dialog
   */
  showAddBookmarkDialog(bsYear, bsMonth, bsDay) {
    const existing = document.querySelector('.bookmark-dialog');
    if (existing) existing.remove();

    const bsDateStr = MitiUtils.formatBSDate(bsYear, bsMonth, bsDay);
    
    const dialog = document.createElement('div');
    dialog.className = 'bookmark-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay"></div>
      <div class="dialog-content">
        <h3>📌 Bookmark Date</h3>
        <p class="dialog-date">${bsDateStr} BS</p>
        <div class="dialog-field">
          <label>Label</label>
          <input type="text" id="bm-label" placeholder="e.g. Exam, Meeting, Birthday" maxlength="50" autofocus>
        </div>
        <div class="dialog-field">
          <label>Notes (optional)</label>
          <textarea id="bm-notes" placeholder="Add notes..." rows="2" maxlength="200"></textarea>
        </div>
        <div class="dialog-field">
          <label>Color</label>
          <div class="color-picker">
            <button class="color-opt selected" data-color="#F5A623" style="background:#F5A623"></button>
            <button class="color-opt" data-color="#DC143C" style="background:#DC143C"></button>
            <button class="color-opt" data-color="#4A90D9" style="background:#4A90D9"></button>
            <button class="color-opt" data-color="#7ED321" style="background:#7ED321"></button>
            <button class="color-opt" data-color="#BD10E0" style="background:#BD10E0"></button>
            <button class="color-opt" data-color="#50E3C2" style="background:#50E3C2"></button>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="dialog-btn cancel" id="bm-cancel">Cancel</button>
          <button class="dialog-btn save" id="bm-save">Save</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);
    requestAnimationFrame(() => dialog.classList.add('visible'));

    let selectedColor = '#F5A623';

    // Color selection
    dialog.querySelectorAll('.color-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        dialog.querySelectorAll('.color-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedColor = opt.dataset.color;
      });
    });

    // Cancel
    dialog.querySelector('#bm-cancel').addEventListener('click', () => {
      dialog.classList.remove('visible');
      setTimeout(() => dialog.remove(), 300);
    });

    dialog.querySelector('.dialog-overlay').addEventListener('click', () => {
      dialog.classList.remove('visible');
      setTimeout(() => dialog.remove(), 300);
    });

    // Save
    dialog.querySelector('#bm-save').addEventListener('click', () => {
      const label = document.getElementById('bm-label').value.trim();
      if (!label) {
        document.getElementById('bm-label').classList.add('error');
        return;
      }
      const notes = document.getElementById('bm-notes').value.trim();
      this.bookmarks.add(bsYear, bsMonth, bsDay, label, selectedColor, notes);
      dialog.classList.remove('visible');
      setTimeout(() => dialog.remove(), 300);
      MitiUtils.showToast('📌 Bookmark saved!');
      
      // Re-render if on calendar/bookmarks tab
      if (this.currentTab === 'calendar') this.renderCalendar();
      if (this.currentTab === 'bookmarks') this.renderBookmarksList();
    });
  }

  /**
   * Bind converter events
   */
  bindConverterEvents() {
    // BS to AD
    document.getElementById('bs-to-ad-btn')?.addEventListener('click', () => {
      try {
        const y = parseInt(document.getElementById('bs-year-input').value);
        const m = parseInt(document.getElementById('bs-month-input').value);
        const d = parseInt(document.getElementById('bs-day-input').value);
        const adDate = this.converter.bsToAD(y, m, d);
        const resultEl = document.getElementById('bs-to-ad-result');
        resultEl.innerHTML = `
          <div class="result-card">
            <div class="result-date">${MitiUtils.formatADDate(adDate)}</div>
            <div class="result-day">${BS_DAYS.en[adDate.getDay()]} • ${BS_DAYS.np[adDate.getDay()]}</div>
            <button class="copy-result-btn" data-copy="${MitiUtils.formatADDate(adDate)}">📋 Copy</button>
          </div>
        `;
        resultEl.querySelector('.copy-result-btn')?.addEventListener('click', (e) => {
          MitiUtils.copyToClipboard(e.target.dataset.copy);
          MitiUtils.showToast('📋 Copied!');
        });
      } catch (e) {
        document.getElementById('bs-to-ad-result').innerHTML = `<div class="result-error">⚠️ ${e.message}</div>`;
      }
    });

    // AD to BS
    document.getElementById('ad-to-bs-btn')?.addEventListener('click', () => {
      try {
        const dateStr = document.getElementById('ad-date-input').value;
        const adDate = new Date(dateStr + 'T00:00:00');
        const bs = this.converter.adToBS(adDate);
        const bsStr = MitiUtils.formatBSDate(bs.year, bs.month, bs.day);
        const bsStrNp = MitiUtils.formatBSDate(bs.year, bs.month, bs.day, 'np');
        const resultEl = document.getElementById('ad-to-bs-result');
        resultEl.innerHTML = `
          <div class="result-card">
            <div class="result-date">${bsStr}</div>
            <div class="result-date-np">${bsStrNp}</div>
            <div class="result-day">${BS_DAYS.en[bs.dayOfWeek]} • ${BS_DAYS.np[bs.dayOfWeek]}</div>
            <button class="copy-result-btn" data-copy="${bsStr} BS">📋 Copy</button>
          </div>
        `;
        resultEl.querySelector('.copy-result-btn')?.addEventListener('click', (e) => {
          MitiUtils.copyToClipboard(e.target.dataset.copy);
          MitiUtils.showToast('📋 Copied!');
        });
      } catch (e) {
        document.getElementById('ad-to-bs-result').innerHTML = `<div class="result-error">⚠️ ${e.message}</div>`;
      }
    });

    // Date calculator
    document.getElementById('calc-btn')?.addEventListener('click', () => {
      try {
        const days = parseInt(document.getElementById('calc-days-input').value);
        const today = this.converter.getToday();
        const futureBS = this.converter.addDaysToBS(today.bs.year, today.bs.month, today.bs.day, days);
        const futureAD = this.converter.bsToAD(futureBS.year, futureBS.month, futureBS.day);
        const bsStr = MitiUtils.formatBSDate(futureBS.year, futureBS.month, futureBS.day);
        const bsStrNp = MitiUtils.formatBSDate(futureBS.year, futureBS.month, futureBS.day, 'np');
        const adStr = MitiUtils.formatADDate(futureAD);
        const resultEl = document.getElementById('calc-result');
        resultEl.innerHTML = `
          <div class="result-card">
            <div class="result-label">${days >= 0 ? days + ' days from' : Math.abs(days) + ' days before'} today:</div>
            <div class="result-date">${bsStr} BS</div>
            <div class="result-date-np">${bsStrNp}</div>
            <div class="result-date ad">${adStr}</div>
            <div class="result-day">${BS_DAYS.en[futureBS.dayOfWeek]} • ${BS_DAYS.np[futureBS.dayOfWeek]}</div>
          </div>
        `;
      } catch (e) {
        document.getElementById('calc-result').innerHTML = `<div class="result-error">⚠️ ${e.message}</div>`;
      }
    });
  }

  /**
   * Bind bookmark events
   */
  bindBookmarkEvents() {
    // Delete bookmark
    document.querySelectorAll('.bookmark-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        this.bookmarks.remove(btn.dataset.id);
        this.renderBookmarksList();
        MitiUtils.showToast('🗑️ Bookmark removed');
      });
    });

    // Add new bookmark
    document.getElementById('add-bookmark-btn')?.addEventListener('click', () => {
      const today = this.converter.getToday();
      this.showAddBookmarkDialog(today.bs.year, today.bs.month, today.bs.day);
    });
  }

  /**
   * Start clock to update pill every minute
   */
  startClock() {
    setInterval(() => {
      if (!this.isExpanded) {
        this.renderPill();
      }
    }, 60000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.mitiApp = new MitiApp();
});
