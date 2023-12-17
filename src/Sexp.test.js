import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Pair } from './Pair.js';
import { parse } from './Sexp.civet';

test('#t', () => {
  const res = parse('#f');
  assert.equal(res, false);
});

test('#f', () => {
  const res = parse('#t');
  assert.equal(res, true);
});

test('x', () => {
  const res = parse('x');
  assert.equal(res, 'x');
});

test('+', () => {
  const res = parse('+');
  assert.equal(res, '+');
});

test('driver-loop', () => {
  const res = parse('driver-loop');
  assert.equal(res, 'driver-loop');
});

test('""', () => {
  const res = parse('""');
  assert.equal(res, '""');
});

test('"this is a string"', () => {
  const res = parse('"this is a string"');
  assert.equal(res, '"this is a string"');
});

test('0', () => {
  const res = parse('0');
  assert.equal(res, 0);
});

test('-0', () => {
  const res = parse('-0');
  assert.equal(res, 0);
});

test('+0', () => {
  const res = parse('+0');
  assert.equal(res, 0);
});

test('000', () => {
  const res = parse('000');
  assert.equal(res, 0);
});

test('-000', () => {
  const res = parse('-000');
  assert.equal(res, 0);
});

test('+000', () => {
  const res = parse('+000');
  assert.equal(res, 0);
});

test('0.12', () => {
  const res = parse('0.12');
  assert.equal(res, 0.12);
});

test('+0.12', () => {
  const res = parse('+0.12');
  assert.equal(res, 0.12);
});

test('-0.12', () => {
  const res = parse('-0.12');
  assert.equal(res, -0.12);
});

test('000.12', () => {
  const res = parse('000.12');
  assert.equal(res, 0.12);
});

test('+000.12', () => {
  const res = parse('+000.12');
  assert.equal(res, 0.12);
});

test('-000.12', () => {
  const res = parse('-000.12');
  assert.equal(res, -0.12);
});

test('.12', () => {
  const res = parse('.12');
  assert.equal(res, .12);
});

test('+.12', () => {
  const res = parse('+.12');
  assert.equal(res, .12);
});

test('-.12', () => {
  const res = parse('-.12');
  assert.equal(res, -.12);
});

test('1', () => {
  const res = parse('1');
  assert.equal(res, 1);
});

test('12', () => {
  const res = parse('12');
  assert.equal(res, 12);
});

test('102', () => {
  const res = parse('102');
  assert.equal(res, 102);
});

test('-102', () => {
  const res = parse('-102');
  assert.equal(res, -102);
});

test('1337.331', () => {
  const res = parse('1337.331');
  assert.equal(res, 1337.331);
});

test('()', () => {
  const res = parse('()');
  assert.equal(res, []);
});

test('[]', () => {
  const res = parse('[]');
  assert.equal(res, []);
});

test('{}', () => {
  const res = parse('{}');
  assert.equal(res, []);
});

test('(   )', () => {
  const res = parse('(   )');
  assert.equal(res, []);
});

test('[   ]', () => {
  const res = parse('[   ]');
  assert.equal(res, []);
});

test('{   }', () => {
  const res = parse('{   }');
  assert.equal(res, []);
});

test('(a b c)', () => {
  const res = parse('(a b c)');
  assert.equal(res, ['a', 'b', 'c']);
});

test('(a (b c))', () => {
  const res = parse('(a (b c))');
  assert.equal(res, ['a', ['b', 'c']]);
});

test('{[a 1] [b 2] [c 3]}', () => {
  const res = parse('{[a 1] [b 2] [c 3]}');
  assert.equal(res, [['a', 1], ['b', 2], ['c', 3]]);
});

test('(1 . (2 . 3))', () => {
  const res = parse('(1 . (2 . 3))');
  assert.equal(res, new Pair(1, new Pair(2, 3)));
});

test("'(1 2 3)", () => {
  const res = parse("'(1 2 3)");
  assert.equal(res, ['quote', [1, 2, 3]]);
});

test("'5.3", () => {
  const res = parse("'5.3");
  assert.equal(res, ['quote', 5.3]);
});

test.run();
