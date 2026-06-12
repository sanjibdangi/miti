// Test suite for the BS↔AD conversion engine in shared/.
// Run with: npm test
const { test } = require('node:test');
const assert = require('node:assert/strict');

const bsData = require('../shared/bs-data.js');
Object.assign(global, bsData);
const DateConverter = require('../shared/date-converter.js');

const c = new DateConverter();
const { BS_CALENDAR_DATA } = bsData;
const YEARS = Object.keys(BS_CALENDAR_DATA).map(Number).sort((a, b) => a - b);
const FIRST_YEAR = YEARS[0];
const LAST_YEAR = YEARS[YEARS.length - 1];

test('anchor date: BS 2000/01/01 = AD 1943-04-14', () => {
  const ad = c.bsToAD(2000, 1, 1);
  assert.equal(ad.getFullYear(), 1943);
  assert.equal(ad.getMonth() + 1, 4);
  assert.equal(ad.getDate(), 14);

  const bs = c.adToBS(new Date(1943, 3, 14));
  assert.deepEqual({ y: bs.year, m: bs.month, d: bs.day }, { y: 2000, m: 1, d: 1 });
});

test('known date: BS 2082/01/01 = AD 2025-04-14', () => {
  const ad = c.bsToAD(2082, 1, 1);
  assert.deepEqual(
    { y: ad.getFullYear(), m: ad.getMonth() + 1, d: ad.getDate() },
    { y: 2025, m: 4, d: 14 }
  );
});

test(`table is contiguous from ${FIRST_YEAR} to ${LAST_YEAR} with 12 sane months each`, () => {
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    const months = BS_CALENDAR_DATA[y];
    assert.ok(Array.isArray(months), `year ${y} missing from table`);
    assert.equal(months.length, 12, `year ${y} does not have 12 months`);
    for (const d of months) {
      assert.ok(d >= 28 && d <= 33, `year ${y} has implausible month length ${d}`);
    }
    const total = months.reduce((s, d) => s + d, 0);
    assert.ok(total >= 354 && total <= 378, `year ${y} has implausible length ${total}`);
  }
});

test('round-trip every day in the table (bsToAD → adToBS)', () => {
  let count = 0;
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    for (let m = 1; m <= 12; m++) {
      const days = c.getBSMonthDays(y, m);
      for (let d = 1; d <= days; d++) {
        const ad = c.bsToAD(y, m, d);
        const back = c.adToBS(ad);
        assert.deepEqual(
          { y: back.year, m: back.month, d: back.day },
          { y, m, d },
          `round-trip failed for BS ${y}/${m}/${d} (AD ${ad.toISOString().slice(0, 10)})`
        );
        count++;
      }
    }
  }
  assert.ok(count > 30000, `expected >30k days, got ${count}`);
});

test('consecutive BS days map to consecutive AD days across boundaries', () => {
  // Spot-check year boundaries: last day of each year → +1 day = 1/1 of next year
  const DAY_MS = 24 * 60 * 60 * 1000;
  for (let y = FIRST_YEAR; y < LAST_YEAR; y++) {
    const lastDay = c.getBSMonthDays(y, 12);
    const adEnd = c.bsToAD(y, 12, lastDay);
    const adNext = c.bsToAD(y + 1, 1, 1);
    assert.equal(adNext.getTime() - adEnd.getTime(), DAY_MS, `gap at BS ${y}→${y + 1} boundary`);
  }
});

test('table boundaries', () => {
  const lastDay = c.getBSMonthDays(LAST_YEAR, 12);
  assert.ok(c.bsToAD(LAST_YEAR, 12, lastDay) instanceof Date);
  assert.ok(c.isValidBSYear(FIRST_YEAR));
  assert.ok(c.isValidBSYear(LAST_YEAR));
  assert.ok(!c.isValidBSYear(LAST_YEAR + 1));
  assert.ok(!c.isValidBSYear(FIRST_YEAR - 1));
});

test('invalid input throws', () => {
  assert.throws(() => c.bsToAD(LAST_YEAR + 1, 1, 1), /not in lookup table/);
  assert.throws(() => c.bsToAD(2082, 13, 1), /Invalid BS month/);
  assert.throws(() => c.bsToAD(2082, 1, 99), /Invalid BS day/);
  assert.throws(() => c.adToBS(new Date(1940, 0, 1)), /before supported range/);
  assert.throws(() => c.adToBS('not a date'), /Invalid date/);
});

test('arithmetic helpers', () => {
  const plus30 = c.addDaysToBS(2082, 12, 25, 30);
  assert.deepEqual({ y: plus30.year, m: plus30.month, d: plus30.day }, { y: 2083, m: 1, d: 24 });

  assert.equal(c.bsDateDiff(2082, 1, 1, 2082, 1, 1), 0);
  assert.equal(c.bsDateDiff(2082, 1, 1, 2083, 1, 1), c.getBSYearDays(2082));
  assert.equal(c.bsDateDiff(2083, 1, 1, 2082, 1, 1), -c.getBSYearDays(2082));
});

test('weekday consistency: getBSMonthFirstDay matches adToBS dayOfWeek', () => {
  for (const y of [FIRST_YEAR, 2050, 2082, LAST_YEAR]) {
    for (let m = 1; m <= 12; m++) {
      const fromAD = c.adToBS(c.bsToAD(y, m, 1)).dayOfWeek;
      assert.equal(c.getBSMonthFirstDay(y, m), fromAD, `weekday mismatch at BS ${y}/${m}/1`);
    }
  }
});
