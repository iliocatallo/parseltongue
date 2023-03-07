import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { parse } from '../lib/sexpr.js'
import { Pair } from '../lib/pair.js'

test('An empty s-list is parsed into an empty JS array', function () {
    assert.equal(parse('()'), [])
    assert.equal(parse('(       )'), [])
    assert.equal(parse(`(

    )`), [])
})

test('A s-list of empty s-lists is parsed into a JS array of empty JS arrays', function () {
    assert.equal(parse('(())'), [[]])
    assert.equal(parse('(   ())'), [[]])
    assert.equal(parse('(()   )'), [[]])
    assert.equal(parse('(()    ())'), [[], []])
    assert.equal(parse('(()    (() ()))'), [[], [[], []]])
})

test('S-lists with mixing parentheses are parsed into native JS arrays', function () {
    assert.equal(parse('[]'), [])
    assert.equal(parse('{}'), [])
    assert.equal(parse('([{}])'), [[[]]])
})

test('S-expressions of the form (α . β) are parsed into a custom Pair object', function () {
    assert.equal(parse('(1 . 2)'), Pair.cons(1, 2))
    assert.equal(parse('(1 .      2)'), Pair.cons(1, 2))
    assert.equal(parse(`(1     . 2)`), Pair.cons(1, 2))
    assert.equal(parse(`(   1 . 2)`), Pair.cons(1, 2))
    assert.equal(parse(`(1 . 2   )`), Pair.cons(1, 2))
})

test('S-expressions whose cdr is a s-list are parsed into a native JS array', function () {
    assert.equal(parse(`(a . (1 2 3))`), [`a`, 1, 2, 3])
})

test('The symbol 0 is parsed into the native JavaScript number 0', function () {
    assert.equal(parse('0'), 0)
})

test('Positive atomic numbers are parsed into the corresponding native JS numbers', function () {
    assert.equal(parse('8'), 8)
    assert.equal(parse('12034'), 12034)
})

test('Negative atomic numbers are parsed into the corresponding native JS numbers', function () {
    assert.equal(parse('-0'), -0)
    assert.equal(parse('-1234'), -1234)
})

test('A s-list of numbers is parsed into an array of the corresponding native JS numbers', function () {
    assert.equal(parse('( 0    12343 12)'), [0, 12343, 12])
    assert.equal(parse('( 0    12343 -12)'), [0, 12343, -12])
})

test('Fractional atomic numbers are parsed into the corresponding native JS numbers', function () {
    assert.equal(parse('12.8'), 12.8)
})

test('The empty atomic string is parsed into the native JS empty string', function () {
    assert.equal(parse(`""`), `""`)
})

test('Non-empty atomic strings are parsed into native JS strings, with their content in quotation marks', function () {
    assert.equal(parse(`"hello world"`), `"hello world"`)
})

test('Symbols are parsed into native JS strings', function () {
    assert.equal(parse('hello'), 'hello')
})

test('Atomic booleans are parsed into native JS booleans', function () {
    assert.equal(parse('#f'), false)
    assert.equal(parse('#t'), true)
})

test('S-lists of atomic strings are parsed into a JS array of strings, each one in quotation marks', function () {
    assert.equal(parse(`("hello world" ""     "lisp")`), [`"hello world"`, `""`, `"lisp"`])
})

test('S-lists consisting of atoms and nested s-lists are parsed accordingly', function () {
    assert.equal(parse('("hello" 12 "world" ())'), [`"hello"`, 12, `"world"`, []])
    assert.equal(parse(`(string? "hello world")`), [`string?`, `"hello world"`])
    assert.equal(parse(`(+ 3.6 7.2)`), [`+`, 3.6, 7.2])
    assert.equal(parse(`(define a 5)`), [`define`, `a`, 5])
    assert.equal(parse(`(+ (* 3 3) (* 5 5))`), [`+`, [`*`, 3, 3], [`*`, 5, 5]])
    assert.equal(parse(`(if (> x 3) #f #t)`), ['if', ['>', 'x', 3], false, true])
})

test('Quoted S-expressions are parsed into their desugared form', function () {
    assert.equal(parse(`'(1 2 3)`), ['quote', [1, 2, 3]])
    assert.equal(parse(`'5.3`), ['quote', 5.3])
})

test.run()