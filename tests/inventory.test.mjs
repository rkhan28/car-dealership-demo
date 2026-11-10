import assert from 'node:assert/strict';
import test from 'node:test';
import { demoVehicles, filterVehicles } from '../lib/inventory.ts';

const ids = (query) => filterVehicles(demoVehicles, query).map((vehicle) => vehicle.id);

test('search ignores surrounding and repeated whitespace', () => {
  assert.deepEqual(ids({ search: '  ATELIER   A01  ' }), ['a01-strada']);
  assert.equal(ids({ search: '   ' }).length, demoVehicles.length);
});

test('search matches vehicle equipment', () => {
  assert.deepEqual(ids({ search: 'carbon-ceramic brakes' }), ['a01-strada']);
  assert.deepEqual(ids({ search: 'heated seats' }), ['a03-spider']);
});

test('malformed numeric parameters do not hide vehicles', () => {
  for (const value of ['NaN', 'Infinity', '-1', 'abc', '']) {
    for (const field of ['min', 'max', 'year', 'mileage']) {
      assert.equal(ids({ [field]: value }).length, demoVehicles.length, `${field}=${value}`);
    }
  }
});

test('valid numeric boundaries remain inclusive', () => {
  assert.deepEqual(ids({ min: '289000' }), ['a01-strada']);
  assert.deepEqual(ids({ max: '174000' }), ['a03-spider']);
  assert.deepEqual(ids({ year: '2025' }), ['a01-strada', 'a02-grand-tourer']);
  assert.deepEqual(ids({ mileage: '1200' }), ['a01-strada']);
});

test('categorical filters combine with numeric filters', () => {
  assert.deepEqual(ids({ drive: 'RWD', status: 'Available', max: '300000' }), ['a01-strada']);
});

test('sorting by price and mileage is deterministic', () => {
  assert.deepEqual(ids({ sort: 'price-asc' }), ['a03-spider', 'a02-grand-tourer', 'a01-strada']);
  assert.deepEqual(ids({ sort: 'price-desc' }), ['a01-strada', 'a02-grand-tourer', 'a03-spider']);
  assert.deepEqual(ids({ sort: 'mileage' }), ['a01-strada', 'a02-grand-tourer', 'a03-spider']);
});

test('default ordering is newest first and preserves the input array', () => {
  const input = [...demoVehicles].reverse();
  const snapshot = [...input];
  const result = filterVehicles(input, {});
  assert.deepEqual(result.map((vehicle) => vehicle.id), ['a01-strada', 'a02-grand-tourer', 'a03-spider']);
  assert.deepEqual(input, snapshot);
  assert.notStrictEqual(result, input);
});

test('categorical filters select exact matching vehicles', () => {
  assert.deepEqual(ids({ body: 'Convertible' }), ['a03-spider']);
  assert.deepEqual(ids({ fuel: 'Petrol', drive: 'AWD' }), ['a02-grand-tourer']);
  assert.deepEqual(ids({ status: 'Reserved' }), ['a03-spider']);
  assert.deepEqual(ids({ brand: 'Nonexistent' }), []);
});

test('empty inventory and unmatched searches return empty results', () => {
  assert.deepEqual(filterVehicles([], { search: 'atelier' }), []);
  assert.deepEqual(ids({ search: 'no matching vehicle' }), []);
});
