import { append, concat2, flip, id } from './fns.js';
import { Input } from './Input.js';
import { best, Done, Fail, More, Step } from './Steps.js';

class H {
  #run;

  constructor(run) {
    this.#run = run;
  }

  static defer(thunk) {
    return new H((input, cb) => thunk().#run(input, cb));
  }

  alt(that) {
    return new H((input, cb) => best(this.#run(input, cb), that.#run(input, cb)));
  }

  ap(arg) {
    return new H((input, cb) => this.#run(input, (fn, rest) => arg.#run(rest, (a, rest2) => cb(fn(a), rest2))));
  }

  pa(hfn) {
    return this.map(a => fn => fn(a)).ap(hfn);
  }

  map(fn) {
    return pure(fn).ap(this);
  }

  orElse(fb) {
    return this.alt(pure(fb));
  }

  parse(str) {
    const input = new Input(str);
    const steps = this.#run(input, (parsed, rest) => rest.isEmpty() ? new Done(parsed) : Fail.extraneous(rest.progress));
    return steps.eval();
  }
}

export function pure(value) {
  return new H((input, cb) => cb(value, input));
}

export function sat(pred, makeFail) {
  return new H(function doSat(input, cb) {
    if (input.isEmpty()) {
      return new More(input.progress, [(input) => doSat(input, cb)], makeFail(input.progress));
    }
    const top = input.top();
    if (pred(top)) {
      const rest = input.tail();
      return new Step(rest.progress, () => cb(top, rest));
    }
    return makeFail(input.progress);
  });
}

export function defer(thunk) {
  return H.defer(thunk);
}

export function parse(h, str) {
  return h.parse(str);
}

export function alt(a, b) {
  return a.alt(b);
}

export function ap(hfn, arg) {
  return hfn.ap(arg);
}

export function map(fn, value) {
  return value.map(fn);
}

export function ap1(ha, hb) {
  return ha.map(a => _ => a).ap(hb);
}

export function ap2(ha, hb) {
  return ha.map(_ => b => b).ap(hb);
}

export function void1(a, hb) {
  return hb.map(() => a);
}

export function void2(ha, b) {
  return ha.map(() => b);
}

export function pa(ha, hfn) {
  return ha.pa(hfn);
}

export function opt(fb, h) {
  return h.orElse(fb);
}

export function char(ch) {
  return sat((it) => it === ch, (at) => new Fail({ at, expected: ch }));
}

export function regex(rgx) {
  return sat(ch => rgx.test(ch), (at) => new Fail({ at, expected: rgx.toString() }));
}

export function string(str) {
  return str === '' ? pure('') : char(str.charAt(0)).map(concat2).ap(defer(_ => string(str.substring(1))));
}

export function many(h) {
  return some(h).orElse([]);
}

export function some(h) {
  return h.map(append).ap(defer(_ => many(h)));
}

export function charset(xs) {
  return sat(x => xs.includes(x), (at) => new Fail({ at, expected: { oneOf: xs } }));
}

export function rtrim(h) {
  return ap1(h, many(space));
}

export function ltrim(h) {
  return ap1(many(space), h);
}

export function chainr(op, h, fallback) {
  return chainr1(op, h).orElse(fallback);
}

function chainr1(op, p) {
  const scan = p.pa(defer(_ => op.map(flip).ap(scan)).orElse(id));
  return scan;
}

export const space = regex(/\s/);
