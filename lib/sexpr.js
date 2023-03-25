import { Pair } from './Pair.js'
import { sat, many, some, char, string as string_, choice, token, optional, whitespace, Do } from './Parser.js'

export function parse(input) {
    const res = sexpr.parse(input.trim())
    if (res.length === 0) {
        throw new Error(`Cannot parse expression ${input}`)
    }
    if (res[0][1] != '') {
        throw new Error(`Extraneous characters: ${res[0][1]}`)
    }
    return res[0][0]
}

const [list, pair] = (function () {

    const openParen = token(choice(char('('), char('['), char('{')))

    const close = {
        '(': token(char(')')),
        '[': token(char(']')),
        '{': token(char('}'))
    }

    const list = Do(function* () {
        const paren = yield openParen
        const res = yield many(token(sexpr))
        yield close[paren]
        return res
    })

    const pair = Do(function* () {
        const paren = yield openParen
        const car = yield sexpr
        yield some(whitespace)
        yield char('.')
        yield some(whitespace)
        const cdr = yield token(sexpr)
        yield close[paren]

        if (Array.isArray(cdr)) {
            return [ car, ...cdr ]
        }
        return Pair.cons(car, cdr)
    })

    return [list, pair]
})()

const number = (function () {

    const digit19 = sat(x => [...'123456789'].includes(x))
    const digit = sat(x => [...'0123456789'].includes(x))

    const zero = Do(function* () {
        yield sat(x => x === '0')
        return 0
    })

    const nonZero = Do(function* () {
        const x = yield digit19
        const xs = yield many(digit)
        return Number.parseInt([x, ...xs].join(''))
    })

    const nat = zero.alt(nonZero)

    const integer = Do(function* () {
        yield char('-')
        const n = yield nat
        return -n
    }).alt(nat)

    const fraction1 = Do(function* () {
        const int = yield optional(integer)
        yield char('.')
        const dec = yield some(digit)
        return Number.parseFloat([...int, '.', ...dec].join(''))
    })

    const fraction2 = Do(function* () {
        const int = yield integer
        yield char('.')
        const dec = yield many(digit)
        return Number.parseFloat([int, '.', ...dec].join(''))
    })

    return choice(fraction1, fraction2, integer)
})()

// For possible TS version, see also: https://stackoverflow.com/q/68464780/1849221
const string = (function () {

    // https://stackoverflow.com/a/32155765/1849221
    const commonChar = sat(x => /[^\\"]/.test(x))

    const string = Do(function* () {
        yield char(`"`)
        const xs = yield many(commonChar)
        yield char(`"`)

        return `"${xs.join('')}"`
    })

    return token(string)
})()

const symbol = (function () {

    const initial = sat(x => /[^#\s()\[\]\{\}\d\"\.]/.test(x))
    const subsequent = sat(x => /[^\s()\[\]\{\}\"]/.test(x))

    const symbol = Do(function* () {
        const x = yield initial
        const xs = yield many(subsequent)

        return [x, ...xs].join('')
    })

    return symbol
})()

const boolean = (function () {

    const T = Do(function* () {
        yield char('#')
        yield char('t')

        return true
    })

    const F = Do(function* () {
        yield char('#')
        yield char('f')

        return false
    })

    return choice(T, F)
})()

const quote = Do(function* () {
    yield char(`'`)
    const exp = yield sexpr

    return ['quote', exp]
})

const sexpr = choice(quote, pair, list, number, string, symbol, boolean)