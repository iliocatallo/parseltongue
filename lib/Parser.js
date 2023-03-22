class Parser {
    #parse

    constructor(parse) {
        this.#parse = parse;
    }

    parse(str) {
        return this.#parse(str);
    }

    ap(pval) {
        return new Parser(inp => {
            const parsed = this.parse(inp)
            if (parsed.length == 0) return Array.of()
            const [[fn, rest]] = parsed
            return pval.map(fn).parse(rest)
        });
    }

    map(fn) {
        return new Parser(inp => {
            const parsed = this.parse(inp);
            if (parsed.length == 0) return Array.of();
            const [[v, rest]] = parsed
            return Array.of([fn(v), rest])
        });
    }

    chain(fn) {
        return new Parser(inp => {
            const parsed = this.parse(inp);
            if (parsed.length == 0) return Array.of();
            const [[v, rest]] = parsed
            return fn(v).parse(rest)
        })
    }

    alt(that) {
        return new Parser(inp => {
            const parsed = this.parse(inp);
            return parsed.length == 0 ? that.parse(inp) : parsed
        })
    }

    comma(that) {
        return of(x => y => y).ap(this).ap(that)
    }

    rcomma(that) {
        return of(x => y => x).ap(this).ap(that)
    }

}

export const item = new Parser(inp => {
    if (inp.length == 0) return Array.of();
    const x = inp.charAt(0)
    const xs = inp.substring(1)
    return Array.of([x, xs])
})

export const of = val => new Parser(inp => Array.of([val, inp])); // always succeeds
export const empty = new Parser(inp => Array.of()) // always fails

export function Do(gen) {
    return new Parser((inp) => {
        const it = gen()
        let step = it.next()
        while (!step.done) {
            const parsed = step.value.parse(inp)
            if (parsed.length == 0) return Array.of()
            const [[v, rest]] = parsed
            step = it.next(v)
            inp = rest
        }
        return Array.of([step.value, inp])
    })
}

export const sat = pred => item.chain(x => pred(x) ? of(x) : empty)

export const char = c => sat(i => i === c)
export const digit = sat(x => [...'1234567890'].includes(x))
export const lower = sat(x => x.toLowerCase() === x)
export const upper = sat(x => x.toUperrCase() === x)
export const alphanum = sat(x => /^[\p{L}\p{N}]*$/u.test(x)) // https://stackoverflow.com/a/66808435/1849221
export const letter = sat(x => /^[\p{L}]*$/u.test(x))

export const string = (str) => str.length == 0 ? of('') : Do(function* () {
    yield char(str.charAt(0))
    yield string(str.substring(1))
    return str
})

export const many = x => some(x).alt(of([]))
export const some = x => Do(function* () {
    const y = yield x
    const ys = yield many(x)
    return [y, ...ys]
})

export const nat = Do(function* () {
    const xs = yield some(digit)
    return Number.parseInt(xs.join(''))
})

export const int = Do(function* () {
    yield char('-')
    const n = yield nat
    return -n
}).alt(nat)

const isSpace = str => /\s/.test(str)
export const space = Do(function* () {
    yield many(sat(isSpace))
    return
})

// See also:
// - https://abhinavsarkar.net/posts/json-parsing-from-scratch-in-haskell/
// - https://vaibhavsagar.com/blog/2018/02/04/revisiting-monadic-parsing-haskell/