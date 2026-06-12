/**
 * Bookmark System for Miti
 * Save important dates with notes for planning
 */

class BookmarkManager {
  constructor() {
    this.storageKey = 'miti_bookmarks';
    this.bookmarks = this.load();
  }

  /**
   * Load bookmarks — electron-store in the desktop app (survives cache
   * clears), localStorage in the browser. Migrates legacy localStorage
   * data into electron-store once.
   */
  load() {
    try {
      if (window.electronAPI && window.electronAPI.storeGet) {
        const data = window.electronAPI.storeGet(this.storageKey);
        if (data) return data;
        const legacy = localStorage.getItem(this.storageKey);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          window.electronAPI.storeSet(this.storageKey, parsed);
          localStorage.removeItem(this.storageKey);
          return parsed;
        }
        return [];
      }
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  save() {
    if (window.electronAPI && window.electronAPI.storeSet) {
      window.electronAPI.storeSet(this.storageKey, this.bookmarks);
    } else {
      localStorage.setItem(this.storageKey, JSON.stringify(this.bookmarks));
    }
  }

  /**
   * Add a bookmark
   */
  add(bsYear, bsMonth, bsDay, label, color = '#F5A623', notes = '') {
    const id = `bm_${Date.now()}`;
    const bookmark = {
      id,
      bsYear,
      bsMonth,
      bsDay,
      bsKey: `${bsYear}-${bsMonth}-${bsDay}`,
      label,
      color,
      notes,
      createdAt: new Date().toISOString(),
    };
    this.bookmarks.push(bookmark);
    this.save();
    return bookmark;
  }

  /**
   * Remove a bookmark by ID
   */
  remove(id) {
    this.bookmarks = this.bookmarks.filter(b => b.id !== id);
    this.save();
  }

  /**
   * Update a bookmark
   */
  update(id, updates) {
    const bookmark = this.bookmarks.find(b => b.id === id);
    if (bookmark) {
      Object.assign(bookmark, updates);
      if (updates.bsYear || updates.bsMonth || updates.bsDay) {
        bookmark.bsKey = `${bookmark.bsYear}-${bookmark.bsMonth}-${bookmark.bsDay}`;
      }
      this.save();
    }
    return bookmark;
  }

  /**
   * Get bookmarks for a specific BS date
   */
  getByDate(bsYear, bsMonth, bsDay) {
    const key = `${bsYear}-${bsMonth}-${bsDay}`;
    return this.bookmarks.filter(b => b.bsKey === key);
  }

  /**
   * Get bookmarks for a specific BS month
   */
  getByMonth(bsYear, bsMonth) {
    return this.bookmarks.filter(b => b.bsYear === bsYear && b.bsMonth === bsMonth);
  }

  /**
   * Get all upcoming bookmarks
   */
  getUpcoming(converter, count = 10) {
    const today = converter.getToday();
    const todayAD = new Date();
    
    return this.bookmarks
      .map(b => {
        try {
          const adDate = converter.bsToAD(b.bsYear, b.bsMonth, b.bsDay);
          const daysUntil = Math.ceil((adDate.getTime() - todayAD.getTime()) / (1000 * 60 * 60 * 24));
          return { ...b, adDate, daysUntil };
        } catch {
          return null;
        }
      })
      .filter(b => b && b.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, count);
  }

  /**
   * Check if a date has bookmarks
   */
  hasBookmark(bsYear, bsMonth, bsDay) {
    const key = `${bsYear}-${bsMonth}-${bsDay}`;
    return this.bookmarks.some(b => b.bsKey === key);
  }

  /**
   * Get all bookmarks sorted by date
   */
  getAll() {
    return [...this.bookmarks].sort((a, b) => {
      if (a.bsYear !== b.bsYear) return a.bsYear - b.bsYear;
      if (a.bsMonth !== b.bsMonth) return a.bsMonth - b.bsMonth;
      return a.bsDay - b.bsDay;
    });
  }
}

if (typeof window !== 'undefined') {
  window.BookmarkManager = BookmarkManager;
}
