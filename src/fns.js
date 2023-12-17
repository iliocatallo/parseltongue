export const join = (cs) => cs.join('');

export const concat2 = (c) => (s) => c + s;

export const concat3 = (a) => (b) => (c) => a + b + c;

export const append = (h) => (t) => [h, ...t];

export const flip = (fn) => (b) => (a) => fn(a)(b);

export const id = (x) => x;
