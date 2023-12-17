import { Input } from './Input.js';

export class Partial {
  #progress;
  #cbs;
  #fail;

  constructor(progress, cbs, fail) {
    this.#progress = progress;
    this.#cbs = cbs;
    this.#fail = fail;
  }

  complete(str) {
    const input = new Input(str, this.#progress);
    return this.#cbs
      .map(cb => cb(input))
      .reduce((accu, step) => accu.best(step))
      .eval();
  }

  fail() {
    return this.#fail.eval();
  }
}
