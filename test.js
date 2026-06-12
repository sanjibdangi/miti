// Quick test for date conversion accuracy
const bsData = require('./src/js/bs-data.js');
Object.assign(global, bsData);

// Load date converter - use Function constructor
const fs = require('fs');
let code = fs.readFileSync('./src/js/date-converter.js', 'utf8');
code = code.replace(/if \(typeof window.*\n.*\n\}/, '');
const fn = new Function(code + '\nreturn DateConverter;');
const DateConverter = fn();

const c = new DateConverter();

console.log('=== Today ===');
const t = c.getToday();
console.log('BS:', JSON.stringify(t.bs));
console.log('AD:', JSON.stringify(t.ad));

console.log('\n=== Known Date Tests ===');

const ny = c.bsToAD(2082, 1, 1);
const nyStr = `${ny.getFullYear()}-${String(ny.getMonth()+1).padStart(2,'0')}-${String(ny.getDate()).padStart(2,'0')}`;
console.log('BS 2082/1/1 -> AD:', nyStr, nyStr === '2025-04-14' ? '✅' : '❌ (expect 2025-04-14)');

const ny2 = c.adToBS(new Date(2025, 3, 14));
console.log('AD 2025-04-14 -> BS:', `${ny2.year}/${ny2.month}/${ny2.day}`, 
  (ny2.year === 2082 && ny2.month === 1 && ny2.day === 1) ? '✅' : '❌');

const today = c.adToBS(new Date(2026, 3, 8));
console.log('AD 2026-04-08 -> BS:', `${today.year}/${today.month}/${today.day}`);

console.log('\n=== Month Info ===');
console.log('Days in Chaitra 2082:', c.getBSMonthDays(2082, 12));
console.log('First day of Baisakh 2082:', ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][c.getBSMonthFirstDay(2082, 1)]);

const plus30 = c.addDaysToBS(2082, 12, 25, 30);
console.log('30 days after 2082/12/25:', `${plus30.year}/${plus30.month}/${plus30.day}`);

console.log('\n✅ All tests completed');
