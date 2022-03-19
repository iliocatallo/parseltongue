import { Pair } from './pair.js'
import { sat, many, some, char, Do } from './parser.js'

const WS = Symbol()

const whitespace = sat(x => /\s/.test(x)).map(x => WS)

const [list, pair] = (function () {
    
    const openParen = char('(').alt(char('[')).alt(char('{'))

    const closingParen = p => p === '(' ? ')' : p === '[' ? ']' : '}'

    const list_ = Do(function* () {
        const paren = yield openParen
        const res = yield many(sexpr.alt(whitespace))
        yield char(closingParen(paren))
        return res.filter(x => x != WS)
    })

    const pair_ = Do(function* () {
        const paren = yield openParen
        yield many(whitespace)
        const car = yield sexpr
        yield some(whitespace)
        yield char('.')
        yield some(whitespace)
        const cdr = yield sexpr
        yield many(whitespace)
        yield char(closingParen(paren))

        if (Array.isArray(cdr)) {
            return [ car, ...cdr ]
        }
        return Pair.cons(car, cdr)
    })

    return [list_, pair_]
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
    
    const fraction = Do(function* () {
        const int = yield(integer)
        yield char('.')
        const dec = yield many(digit)
        return Number.parseFloat([int, '.', ...dec].join(''))
    })

    return fraction.alt(integer)
})()

// For possible TS version, see also: https://stackoverflow.com/q/68464780/1849221
const string = (function () {

    // https://stackoverflow.com/a/32155765/1849221
    const commonChar = sat(x => /[^\\"]/.test(x))

    const string_ = Do(function* () {
        yield char(`"`)
        const xs = yield many(commonChar)
        yield char(`"`)

        return `"${xs.join('')}"`
    })

    return string_
})()


const symbol = (function () {

    const validStart = sat(x => /[^#\s()\[\]\{\}\d\"]/.test(x))
    const validRest = sat(x => /[^\s()\[\]\{\}\"]/.test(x))

    const symbol_ = Do(function* () {
        const x = yield validStart
        const xs = yield many(validRest)

        return [x, ...xs].join('')
    })

    return symbol_
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

    return T.alt(F)
})()

const quote = Do(function* () {
    yield char(`'`)
    const exp = yield sexpr

    return ['quote', exp]
})

const sexpr = quote.alt(pair).alt(list).alt(number).alt(string).alt(symbol).alt(boolean)

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