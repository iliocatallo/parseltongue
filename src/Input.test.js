import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Input } from './Input.js';

test('an input based on an empty string is empty', () => {
  const input = new Input('');
  assert.equal(input.isEmpty(), true);
});

test('the top element of an empty input is the empty string', () => {
  const input = new Input('');
  assert.equal(input.top(), '');
});

test('the tail of an empty input is empty', () => {
  const input = new Input('');
  const tail = input.tail();
  assert.equal(tail.isEmpty(), true);
});

test('the top element of an input is the first character in the input', () => {
  const input = new Input('some input');
  assert.equal(input.top(), 's');
});

test('the tail of an input is the rest of the input', () => {
  const input = new Input('some input');
  const tail = input.tail();
  assert.equal(tail.value, 'ome input');
});
