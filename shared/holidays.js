/**
 * Nepali Holidays & Festivals Data
 * Major government holidays and festivals for BS 2082-2083
 */

const HOLIDAYS = {
  2082: {
    '1-1':   { name: 'नयाँ वर्ष', nameEn: 'New Year', type: 'national', emoji: '🎊' },
    '1-11':  { name: 'लोकतन्त्र दिवस', nameEn: 'Democracy Day', type: 'national', emoji: '🏛️' },
    '1-18':  { name: 'श्रम दिवस', nameEn: 'Labour Day', type: 'national', emoji: '⚒️' },
    '1-29':  { name: 'बुद्ध जयन्ती', nameEn: 'Buddha Jayanti', type: 'religious', emoji: '🙏' },
    '2-15':  { name: 'गणतन्त्र दिवस', nameEn: 'Republic Day', type: 'national', emoji: '🇳🇵' },
    '3-15':  { name: 'हरि शयनी एकादशी', nameEn: 'Hari Shayani Ekadashi', type: 'religious', emoji: '🙏' },
    '4-2':   { name: 'श्रावण शुक्ल पूर्णिमा', nameEn: 'Janai Purnima', type: 'religious', emoji: '🧵' },
    '4-3':   { name: 'गाईजात्रा', nameEn: 'Gaijatra', type: 'festival', emoji: '🐄' },
    '4-17':  { name: 'श्री कृष्ण जन्माष्टमी', nameEn: 'Krishna Janmashtami', type: 'religious', emoji: '🙏' },
    '5-3':   { name: 'तीज', nameEn: 'Teej', type: 'festival', emoji: '💃' },
    '5-18':  { name: 'इन्द्रजात्रा', nameEn: 'Indra Jatra', type: 'festival', emoji: '🎭' },
    '5-19':  { name: 'संविधान दिवस', nameEn: 'Constitution Day', type: 'national', emoji: '📜' },
    '6-3':   { name: 'घटस्थापना', nameEn: 'Ghatasthapana', type: 'festival', emoji: '🌱' },
    '6-10':  { name: 'फूलपाती', nameEn: 'Fulpati', type: 'festival', emoji: '🌸' },
    '6-11':  { name: 'महा अष्टमी', nameEn: 'Maha Astami', type: 'festival', emoji: '🙏' },
    '6-12':  { name: 'महा नवमी', nameEn: 'Maha Navami', type: 'festival', emoji: '🙏' },
    '6-13':  { name: 'विजया दशमी', nameEn: 'Dashain', type: 'festival', emoji: '🎊' },
    '6-14':  { name: 'एकादशी', nameEn: 'Ekadashi', type: 'festival', emoji: '🙏' },
    '6-15':  { name: 'द्वादशी', nameEn: 'Dwadashi', type: 'festival', emoji: '🙏' },
    '6-28':  { name: 'कोजाग्रत पूर्णिमा', nameEn: 'Kojagrat Purnima', type: 'festival', emoji: '🌕' },
    '7-13':  { name: 'लक्ष्मी पूजा', nameEn: 'Tihar - Laxmi Puja', type: 'festival', emoji: '🪔' },
    '7-14':  { name: 'गोवर्धन पूजा', nameEn: 'Tihar - Govardhan Puja', type: 'festival', emoji: '🐄' },
    '7-15':  { name: 'भाई टीका', nameEn: 'Tihar - Bhai Tika', type: 'festival', emoji: '👫' },
    '7-17':  { name: 'छठ पर्व', nameEn: 'Chhath Parva', type: 'festival', emoji: '🌅' },
    '9-1':   { name: 'माघी', nameEn: 'Maghi', type: 'festival', emoji: '🌊' },
    '10-7':  { name: 'सरस्वती पूजा', nameEn: 'Saraswati Puja', type: 'religious', emoji: '📚' },
    '10-13': { name: 'प्रजातन्त्र दिवस', nameEn: 'National Democracy Day', type: 'national', emoji: '🏛️' },
    '11-8':  { name: 'महा शिवरात्रि', nameEn: 'Maha Shivaratri', type: 'religious', emoji: '🔱' },
    '11-27': { name: 'फागु पूर्णिमा', nameEn: 'Holi', type: 'festival', emoji: '🎨' },
    '12-11': { name: 'शहीद दिवस', nameEn: 'Martyrs Day', type: 'national', emoji: '🕯️' },
    '12-17': { name: 'राम नवमी', nameEn: 'Ram Navami', type: 'religious', emoji: '🙏' },
  },
  2083: {
    // Verified against the MoHA 2083 holiday list (collegenp/educatenepal/nepinsights, Jun 2026)
    '1-1':   { name: 'नयाँ वर्ष', nameEn: 'New Year', type: 'national', emoji: '🎊' },
    '1-18':  { name: 'बुद्ध जयन्ती / श्रम दिवस', nameEn: 'Buddha Jayanti · Labour Day', type: 'religious', emoji: '🙏' },
    '2-13':  { name: 'ईद-उल-अज्हा', nameEn: 'Eid al-Adha', type: 'religious', emoji: '🕌' },
    '2-15':  { name: 'गणतन्त्र दिवस', nameEn: 'Republic Day', type: 'national', emoji: '🇳🇵' },
    '5-12':  { name: 'जनै पूर्णिमा / रक्षाबन्धन', nameEn: 'Janai Purnima', type: 'religious', emoji: '🧵' },
    '5-13':  { name: 'गाईजात्रा', nameEn: 'Gai Jatra', type: 'festival', emoji: '🐄' },
    '5-19':  { name: 'श्री कृष्ण जन्माष्टमी', nameEn: 'Krishna Janmashtami', type: 'religious', emoji: '🙏' },
    '5-29':  { name: 'हरितालिका तीज', nameEn: 'Teej', type: 'festival', emoji: '💃' },
    '5-31':  { name: 'ऋषि पञ्चमी', nameEn: 'Rishi Panchami', type: 'religious', emoji: '🙏' },
    '6-3':   { name: 'संविधान दिवस', nameEn: 'Constitution Day', type: 'national', emoji: '📜' },
    '6-9':   { name: 'इन्द्रजात्रा', nameEn: 'Indra Jatra', type: 'festival', emoji: '🎭' },
    '6-26':  { name: 'घटस्थापना', nameEn: 'Ghatasthapana', type: 'festival', emoji: '🌱' },
    '7-1':   { name: 'फूलपाती', nameEn: 'Fulpati', type: 'festival', emoji: '🌸' },
    '7-2':   { name: 'महा अष्टमी', nameEn: 'Maha Ashtami', type: 'festival', emoji: '🙏' },
    '7-3':   { name: 'महा नवमी', nameEn: 'Maha Navami', type: 'festival', emoji: '🙏' },
    '7-4':   { name: 'विजया दशमी', nameEn: 'Vijaya Dashami (Dashain)', type: 'festival', emoji: '🎊' },
    '7-22':  { name: 'लक्ष्मी पूजा', nameEn: 'Tihar - Laxmi Puja', type: 'festival', emoji: '🪔' },
    '7-24':  { name: 'गोवर्धन पूजा / म्हः पूजा', nameEn: 'Tihar - Govardhan Puja', type: 'festival', emoji: '🐄' },
    '7-25':  { name: 'भाई टीका', nameEn: 'Tihar - Bhai Tika', type: 'festival', emoji: '👫' },
    '7-29':  { name: 'छठ पर्व', nameEn: 'Chhath Parva', type: 'festival', emoji: '🌅' },
    '9-10':  { name: 'क्रिसमस', nameEn: 'Christmas Day', type: 'religious', emoji: '🎄' },
    '9-15':  { name: 'तमु ल्होसार', nameEn: 'Tamu Lhosar', type: 'festival', emoji: '🏔️' },
    '10-1':  { name: 'माघी / माघे संक्रान्ति', nameEn: 'Maghi', type: 'festival', emoji: '🌊' },
    '10-16': { name: 'शहीद दिवस', nameEn: 'Martyrs Day', type: 'national', emoji: '🕯️' },
    '10-28': { name: 'सरस्वती पूजा', nameEn: 'Saraswati Puja', type: 'religious', emoji: '📚' },
    '11-7':  { name: 'प्रजातन्त्र दिवस', nameEn: 'Democracy Day', type: 'national', emoji: '🏛️' },
    '11-22': { name: 'महा शिवरात्रि', nameEn: 'Maha Shivaratri', type: 'religious', emoji: '🔱' },
    '11-24': { name: 'अन्तर्राष्ट्रिय महिला दिवस', nameEn: "Women's Day", type: 'national', emoji: '👩' },
    '12-7':  { name: 'फागु पूर्णिमा (पहाड)', nameEn: 'Holi (Hills)', type: 'festival', emoji: '🎨' },
    '12-8':  { name: 'फागु पूर्णिमा (तराई)', nameEn: 'Holi (Terai)', type: 'festival', emoji: '🎨' },
  }
};

/**
 * Period observances — multi-day religious/cultural periods (not holidays).
 * Keyed by BS year; from/to are inclusive 'month-day' keys.
 */
const OBSERVANCES = {
  2083: [
    {
      // Jestha 3 – Asar 1, 2083 = May 17 – Jun 15, 2026 (hamropatro/onlinekhabar)
      from: '2-3', to: '3-1',
      name: 'मलमास (अधिक मास)', nameEn: 'Mala Maas (Adhik Maas)',
      type: 'observance', emoji: '🌙',
      note: 'Extra lunar month — auspicious ceremonies traditionally avoided',
    },
  ],
};

class HolidayManager {
  /**
   * Get holiday info for a BS date
   */
  static getHoliday(bsYear, bsMonth, bsDay) {
    const yearData = HOLIDAYS[bsYear];
    if (!yearData) return null;
    const key = `${bsMonth}-${bsDay}`;
    return yearData[key] || null;
  }

  /**
   * Get all holidays for a BS month
   */
  static getMonthHolidays(bsYear, bsMonth) {
    const yearData = HOLIDAYS[bsYear];
    if (!yearData) return [];
    const holidays = [];
    for (const [key, value] of Object.entries(yearData)) {
      const [m, d] = key.split('-').map(Number);
      if (m === bsMonth) {
        holidays.push({ day: d, ...value });
      }
    }
    return holidays.sort((a, b) => a.day - b.day);
  }

  /**
   * Get upcoming holidays from today
   */
  static getUpcomingHolidays(converter, count = 5) {
    const today = converter.getToday();
    const results = [];
    
    let currentYear = today.bs.year;
    let currentMonth = today.bs.month;
    let currentDay = today.bs.day;

    // Check remaining days in current year
    for (const year of [currentYear, currentYear + 1]) {
      const yearData = HOLIDAYS[year];
      if (!yearData) continue;
      
      for (const [key, value] of Object.entries(yearData)) {
        const [m, d] = key.split('-').map(Number);
        
        // Skip past holidays
        if (year === currentYear) {
          if (m < currentMonth || (m === currentMonth && d < currentDay)) continue;
        }

        try {
          const adDate = converter.bsToAD(year, m, d);
          const daysUntil = Math.ceil((adDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil >= 0) {
            results.push({
              bsYear: year,
              bsMonth: m,
              bsDay: d,
              adDate: adDate,
              daysUntil: daysUntil,
              ...value,
            });
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    }

    results.sort((a, b) => a.daysUntil - b.daysUntil);
    return results.slice(0, count);
  }

  /**
   * Check if a specific day is Saturday (holiday in Nepal)
   */
  static isSaturday(dayOfWeek) {
    return dayOfWeek === 6;
  }

  /**
   * Get observance periods active on a BS date (e.g. Mala Maas, Shraddha Paksha)
   */
  static getObservances(bsYear, bsMonth, bsDay) {
    const periods = OBSERVANCES[bsYear];
    if (!periods) return [];
    const key = bsMonth * 100 + bsDay;
    const toKey = (md) => {
      const [m, d] = md.split('-').map(Number);
      return m * 100 + d;
    };
    return periods.filter((p) => key >= toKey(p.from) && key <= toKey(p.to));
  }

  /**
   * Get observances active today
   */
  static getTodayObservances(converter) {
    const today = converter.getToday().bs;
    return HolidayManager.getObservances(today.year, today.month, today.day);
  }
}

/**
 * Merge remote holiday data into HOLIDAYS in place.
 * Returns true if anything changed. Keys starting with '_' are metadata.
 */
HolidayManager.applyRemoteData = function (data) {
  let changed = false;
  for (const y of Object.keys(data || {})) {
    if (y.startsWith('_')) continue;
    if (JSON.stringify(HOLIDAYS[y]) !== JSON.stringify(data[y])) {
      HOLIDAYS[y] = data[y];
      changed = true;
    }
  }
  // Observances ride along under '_observances' so that clients built before
  // this feature (which skip underscore keys) ignore them safely.
  const obs = (data || {})._observances;
  if (obs) {
    for (const y of Object.keys(obs)) {
      if (JSON.stringify(OBSERVANCES[y]) !== JSON.stringify(obs[y])) {
        OBSERVANCES[y] = obs[y];
        changed = true;
      }
    }
  }
  return changed;
};

/**
 * Load live holiday data: apply the last cached copy synchronously, then
 * refresh from the network. Calls onUpdate() whenever the data changed so
 * the caller can re-render. Offline → cached/built-in data stays.
 */
HolidayManager.loadRemote = function (url, onUpdate) {
  const KEY = 'miti_holidays_remote';
  try {
    const cached = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (cached && HolidayManager.applyRemoteData(cached) && onUpdate) onUpdate();
  } catch (e) { /* corrupt cache — ignore */ }
  fetch(url, { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) return;
      localStorage.setItem(KEY, JSON.stringify(data));
      if (HolidayManager.applyRemoteData(data) && onUpdate) onUpdate();
    })
    .catch(() => {});
};

if (typeof window !== 'undefined') {
  window.HolidayManager = HolidayManager;
  window.HOLIDAYS = HOLIDAYS;
  window.OBSERVANCES = OBSERVANCES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HOLIDAYS, HolidayManager, OBSERVANCES };
}
