import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { parse } from '../lib/sexpr.js'
import { Pair } from '../lib/pair.js'

test('A s-expr is an empty list', function () {
    assert.equal(parse('()'), [])
    assert.equal(parse('(       )'), [])
    assert.equal(parse(`(

    )`), [])
})

test('A s-expr is a list of empty lists', function () {
    assert.equal(parse('(())'), [[]])
    assert.equal(parse('(   ())'), [[]])
    assert.equal(parse('(()   )'), [[]])
    assert.equal(parse('(()    ())'), [[], []])
    assert.equal(parse('(()    (() ()))'), [[], [[], []]])
})

test('A s-expr is a list of mixing parenthesis', function () {
    assert.equal(parse('[]'), [])
    assert.equal(parse('{}'), [])
    assert.equal(parse('([{}])'), [[[]]])
})

test('A s-expr is a pair of car and cdr', function () {
    assert.equal(parse('(1 . 2)'), Pair.cons(1, 2))
    assert.equal(parse('(1 .      2)'), Pair.cons(1, 2))
    assert.equal(parse(`(1     . 2)`), Pair.cons(1, 2))
    assert.equal(parse(`(   1 . 2)`), Pair.cons(1, 2))
    assert.equal(parse(`(1 . 2   )`), Pair.cons(1, 2))
})

test('A s-expr is a list if built from a pair whose cdr is a list', function () {
    assert.equal(parse(`(a . (1 2 3))`), [`a`, 1, 2, 3])
})

test('A s-expr is the number 0', function () {
    assert.equal(parse('0'), 0)
})

test('A s-expr is a positive integer number', function () {
    assert.equal(parse('8'), 8)
    assert.equal(parse('12034'), 12034)
})

test('A s-expr is a negative integer number', function () {
    assert.equal(parse('-0'), -0)
    assert.equal(parse('-1234'), -1234)
})

test('A s-expr is a list of integer numbers', function () {
    assert.equal(parse('( 0    12343 12)'), [0, 12343, 12])
    assert.equal(parse('( 0    12343 -12)'), [0, 12343, -12])
})

test('A s-expr is a fractional number', function () {
    assert.equal(parse('12.8'), 12.8)
})

test('A s-expr is an empty string', function () {
    assert.equal(parse(`""`), `""`)
})

test('A s-expr is a non empty string', function () {
    assert.equal(parse(`"hello world"`), `"hello world"`)
})

test('A s-expr is a symbol', function () {
    assert.equal(parse('hello'), 'hello')
})

test('A s-expr is a boolean', function () {
    assert.equal(parse('#f'), false)
    assert.equal(parse('#t'), true)
})

test('A s-expr is a list of strings', function () {
    assert.equal(parse(`("hello world" ""     "lisp")`), [`"hello world"`, `""`, `"lisp"`])
})

test('A s-expr is a list of s-exprs', function () {
    assert.equal(parse('("hello" 12 "world" ())'), [`"hello"`, 12, `"world"`, []])
    assert.equal(parse(`(string? "hello world")`), [`string?`, `"hello world"`])
    assert.equal(parse(`(+ 3.6 7.2)`), [`+`, 3.6, 7.2])
    assert.equal(parse(`(define a 5)`), [`define`, `a`, 5])
    assert.equal(parse(`(+ (* 3 3) (* 5 5))`), [`+`, [`*`, 3, 3], [`*`, 5, 5]])
    assert.equal(parse(`(if (> x 3) #f #t)`), ['if', ['>', 'x', 3], false, true])
})

test('A s-expr is a quotation of other s-exprs', function () {
    assert.equal(parse(`'(1 2 3)`), ['quote', [1, 2, 3]])
    assert.equal(parse(`'5.3`), ['quote', 5.3])
})

test.run()