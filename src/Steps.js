import { inspect } from 'node:util';
import { ParseError } from './ParseError.js';
import { Partial } from './Partial.js';

export class Done {
  #value;

  constructor(value) {
    this.#value = value;
  }

  eval() {
    return this.#value;
  }

  best(that) {
    if (that instanceof Fail || that instanceof More) {
      return this;
    }
    throw new Error(`Cannot compare ${inspect(this)} and ${inspect(that)}`);
  }
}

export class Fail {
  #at;
  #expected;

  constructor(details) {
    this.#at = details?.at;
    this.#expected = details?.expected;
  }

  static extraneous(at) {
    return new Fail({ at, expected: 'end-of-input' });
  }

  eval() {
    throw new ParseError(this.#at, this.#expected.oneOf ? { oneOf: [...this.#expected.oneOf] } : this.#expected);
  }

  best(that) {
    if (that instanceof More) {
      return that.concatFail(this);
    }
    if (!(that instanceof Fail)) {
      return that;
    }
    if (this.#at != that.#at) {
      throw new Error(`Fail: progress mismatch, l: ${this.#at}, r: ${that.#at}`);
    }
    return new Fail({
      at: that.#at,
      expected: {
        oneOf: new Set([
          ...(this.#expected.oneOf ? this.#expected.oneOf : [this.#expected]),
          ...(that.#expected.oneOf ? that.#expected.oneOf : [that.#expected]),
        ]),
      },
    });
  }
}

export class More {
  #progress;
  #cbs;
  #fail;

  constructor(progress, cbs, fail) {
    this.#progress = progress;
    this.#cbs = cbs;
    this.#fail = fail;
  }

  eval() {
    return new Partial(this.#progress, this.#cbs, this.#fail);
  }

  best(that) {
    if (that instanceof Done) return that;
    if (that instanceof Fail) {
      return this.concatFail(that);
    }
    if (that instanceof More) {
      if (this.#progress != that.#progress) throw new Error(`More: progress mismatch, l: ${this.#progress}, r: ${that.#progress}`);
      return new More(this.#progress, [...this.#cbs, ...that.#cbs], this.#fail.best(that.#fail));
    }
    throw new Error(`Cannot compare: ${inspect(this)} and ${inspect(that)}`);
  }

  concatFail(fail) {
    return new More(this.#progress, this.#cbs, this.#fail.best(fail));
  }
}

export class Step {
  #progress;
  #next;

  constructor(progress, next) {
    this.#progress = progress;
    this.#next = next;
  }

  eval() {
    let pos = this;
    while (true) {
      if (!(pos instanceof Step)) break;
      pos = pos.#next();
    }
    return pos.eval();
  }

  best(that) {
    if (that instanceof Fail) return this;
    if (that instanceof Step) {
      if (this.#progress != that.#progress) throw new Error(`Step: progress mismatch, l: ${this.#progress}, r: ${that.#progress}`);
      return new Step(this.#progress, () => this.#next().best(that.#next()));
    }
    throw new Error(`Cannot compare: ${inspect(this)} and ${inspect(that)}`);
  }
}

export function best(l, r) {
  return l.best(r);
}
