import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateStayQuote, parseLocalDate } from '../src/data/tariffe';
import { bookingOption, changeAccommodation, inquiryText } from '../src/utils/booking';
import type { BookingFormState } from '../src/types';

const form: BookingFormState = { accommodationId: 'quercia', adults: 6, children: 0, extraBeds: 2, cribs: 0, checkIn: '2032-07-18', checkOut: '2032-07-25', guestName: '', guestEmail: '', guestPhone: '', notes: '' };

test('published capacities and estate totals', () => {
  assert.deepEqual(['quercia', 'corbezzolo', 'melograno', 'tenuta'].map(id => bookingOption(id as BookingFormState['accommodationId']).capacityMax), [7, 3, 3, 13]);
  assert.equal(bookingOption('tenuta').capacityStandard, 8);
  assert.equal(bookingOption('tenuta').maxExtraBeds, 5);
});
test('changing accommodation preserves all guests and contact details', () => {
  const next = changeAccommodation({ ...form, guestName: 'Test', children: 1 }, 'corbezzolo');
  assert.equal(next.adults, 6);
  assert.equal(next.children, 1);
  assert.equal(next.guestName, 'Test');
  assert.ok(next.adults + next.children > bookingOption(next.accommodationId).capacityMax);
  assert.equal(changeAccommodation(next, 'tenuta').accommodationId, 'tenuta');
});
test('estate is the sum of all three base rates plus extra beds and crib', () => {
  const q = calculateStayQuote('2032-08-01', '2032-08-08', 'tenuta', 5, 1);
  assert.equal(q.baseAccommodationTotal, (440 + 220 + 220) * 7);
  assert.equal(q.totalEstimated, (880 + 5 * 35 + 15) * 7);
  assert.equal(q.minNightsRequired, 7);
  assert.equal(q.meetsMinNights, true);
});
test('cross-season stays price each night and use the strictest minimum', () => {
  const q = calculateStayQuote('2032-07-18', '2032-07-25', 'corbezzolo');
  assert.equal(q.totalNights, 7);
  assert.equal(q.baseAccommodationTotal, 200 + 6 * 220);
  assert.equal(q.minNightsRequired, 7);
  assert.equal(calculateStayQuote('2032-07-18', '2032-07-20', 'corbezzolo').meetsMinNights, false);
});
test('recurring schedule handles new year, leap day and daylight saving by calendar nights', () => {
  assert.equal(calculateStayQuote('2032-12-30', '2033-01-02', 'quercia').totalEstimated, 1200);
  assert.equal(calculateStayQuote('2032-02-28', '2032-03-02', 'corbezzolo').totalNights, 3);
  assert.equal(calculateStayQuote('2032-10-30', '2032-11-02', 'corbezzolo').totalNights, 3);
});
test('missing, impossible, past or reversed dates never produce a valid quote', () => {
  for (const [start, end] of [['', ''], ['2020-01-01', '2020-01-04'], ['2032-02-30', '2032-03-05'], ['2032-04-10', '2032-04-10'], ['2032-04-10', '2032-04-09']]) {
    assert.equal(calculateStayQuote(start, end, 'quercia').isValid, false);
  }
  assert.ok(Number.isNaN(parseLocalDate('2031-02-29').getTime()));
});
test('inquiries retain the estate selection and use the selected language', () => {
  const state = changeAccommodation(form, 'tenuta');
  const en = inquiryText(state, 6160, 7, 'en');
  assert.match(en, /Entire estate/);
  assert.match(en, /6 adults/);
  assert.doesNotMatch(en, /Richiesta|Ospiti|Adulti|notti/);
  assert.match(inquiryText(state, 6160, 7, 'it'), /Intera tenuta/);
});
