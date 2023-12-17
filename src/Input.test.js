import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Input } from './Input.js';

test('an input based on an empty string is empty', () => {
  const input = new Input('');
  assert.is(input.isEmpty(), true);
});

test('the top element of an empty input is the empty string', () => {
  const input = new Input('');
  assert.is(input.top(), '');
});

test('the tail of an empty input is empty', () => {
  const input = new Input('');
  const tail = input.tail();
  assert.is(tail.isEmpty(), true);
});

test('the top element of an input is the first character in the input', () => {
  const input = new Input('some input');
  assert.is(input.top(), 's');
});

test('the tail of an input is the rest of the input', () => {
  const input = new Input('some input');
  const tail = input.tail();
  assert.is(tail.value, 'ome input');
});

test.run();
