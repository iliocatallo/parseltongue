import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { concat2 } from './fns.js';
import { chainr, char, many, pure, regex, some, string, void1 } from './H.js';

test('pure', () => {
  const res = pure(1).parse('');
  assert.equal(res, 1);
});

test('char', () => {
  const res = char('a').parse('a');
  assert.equal(res, 'a');
});

test('string', () => {
  const res = string('abc').parse('abc');
  assert.equal(res, 'abc');
});

test('alt', () => {
  const res = char('a').alt(char('b')).parse('b');
  assert.equal(res, 'b');
});

test('map', () => {
  const res = pure(2).map(x => x + 2).parse('');
  assert.equal(res, 4);
});

test('ap', () => {
  const res = pure(concat2).ap(char('a')).ap(char('b')).parse('ab');
  assert.equal(res, 'ab');
});

test('pa', () => {
  const add2 = a => b => a + b;
  const plus = void1(add2, char('+'));
  const one = void1(1, char('1'));
  const two = void1(2, char('2'));

  const res = one.pa(plus.ap(two)).parse('1+2');
  assert.equal(res, 3);
});

test('many', () => {
  const res1 = _ => many(string('abc')).parse('123456');
  const res2 = many(string('abc')).parse('abcabc');

  assert.throws(res1);
  assert.equal(res2, ['abc', 'abc']);
});

test('some', () => {
  const res1 = () => some(string('abc')).parse('123456');
  const res2 = some(string('abc')).parse('abcabc');

  assert.throws(res1);
  assert.equal(res2, ['abc', 'abc']);
});

test('chainr', () => {
  const add2 = a => b => a + b;
  const plus = void1(add2, char('+'));
  const digit = regex(/\d/).map(parseFloat);

  const res1 = chainr(plus, digit, 0).parse('1+2+3+4');
  const res2 = chainr(plus, digit, 0).parse('');

  assert.equal(res1, 10);
  assert.equal(res2, 0);
});

test('complete', () => {
  const res1 = string('abc').parse('ab');
  assert.equal(res1.complete('c'), 'abc');
});

test.run();
