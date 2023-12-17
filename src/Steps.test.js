import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Done, Fail, More, Step } from './Steps.js';

test('Step -> Done(a) evaluates to a', () => {
  const trace = new Step(0, () => new Done('a'));
  assert.is(trace.eval(), 'a');
});

test('best between Fail and Done is Done', () => {
  const trace1 = new Done('a');
  const trace2 = new Fail({});

  const best = trace1.best(trace2);

  assert.is(best.eval(), 'a');
});

test(`best between two Fails in the same position`, () => {
  const trace1 = new Fail({ at: 5, expected: 'a' });
  const trace2 = new Fail({ at: 5, expected: 'b' });

  const best = trace1.best(trace2);

  try {
    best.eval();
  } catch (err) {
    assert.equal(err.at, 5);
    assert.equal(err.expected, { oneOf: ['a', 'b'] });
  }
});

test(`best between two Fails in the same position (2)`, () => {
  const trace1 = new Fail({ at: 5, expected: 'a' });
  const trace2 = new Fail({ at: 5, expected: { oneOf: ['b', 'c'] } });

  const best = trace1.best(trace2);

  try {
    best.eval();
  } catch (err) {
    assert.equal(err.at, 5);
    assert.equal(err.expected, { oneOf: ['a', 'b', 'c'] });
  }
});

test(`best between two Fails in the same position (3)`, () => {
  const trace1 = new Fail({ at: 5, expected: { oneOf: ['a', 'b'] } });
  const trace2 = new Fail({ at: 5, expected: 'c' });

  const best = trace1.best(trace2);

  try {
    best.eval();
  } catch (err) {
    assert.equal(err.at, 5);
    assert.equal(err.expected, { oneOf: ['a', 'b', 'c'] });
  }
});

test('best is symmetric', () => {
  const trace1 = new Done('a');
  const trace2 = new Fail();

  assert.is(trace1.best(trace2).eval(), trace2.best(trace1).eval());
});

test('Steps do not concurr in determing the best', () => {
  const best1 = (new Step(0, () => new Done('a'))).best(new Step(0, () => new Fail()));
  const best2 = (new Done('a')).best(new Fail());

  assert.is(best1.eval(), best2.eval());
});

test('Fail.extraneous', () => {
  const trace = Fail.extraneous(5);

  try {
    trace.eval();
  } catch (err) {
    assert.is(err.at, 5);
    assert.is(err.expected, 'end-of-input');
  }
});

test(`best between a More and a Fail`, () => {
  const trace1 = new More(5, null, new Fail({ at: 5, expected: { oneOf: ['a', 'b'] } }));
  const trace2 = new Fail({ at: 5, expected: 'c' });

  const best = trace1.best(trace2);
  const beval = best.eval();

  try {
    beval.fail();
  } catch (err) {
    assert.equal(err.at, 5);
    assert.equal(err.expected, { oneOf: ['a', 'b', 'c'] });
  }
});

test.run();
