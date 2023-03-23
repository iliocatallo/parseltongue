import { test } from 'uvu'
import * as assert from 'uvu/assert'
import {
    item,
    of,
    empty,
    char,
    Do,
    string,
    digit,
    many,
    some,
    nat,
    int,
    choice,
    space
} from '../lib/Parser.js'

test('item', function () {
    assert.equal(item.parse(''), Array.of());
    assert.equal(item.parse('abc'), Array.of(['a', 'bc']));
});

test('Parser.map', function () {
    const parser = item.map(x => x.toUpperCase())
    assert.equal(parser.parse(''), Array.of())
    assert.equal(parser.parse('abc'), Array.of(['A', 'bc']))
})

test('of', function () {
    const parser = of(1)
    assert.equal(parser.parse('abc'), Array.of([1, 'abc']))
})

test('empty', function () {
    assert.equal(empty.parse('1234'), Array.of())
})

test('Parser.ap', function () {
    const float = item.map(x => Number.parseFloat(x))
    const sum = x => y => x + y

    assert.equal(float.map(sum).ap(float).parse('35'), Array.of([8, '']))
    assert.equal(of(sum).ap(float).ap(float).parse('35'), Array.of([8, '']))
})

test('Parser.chain', function () {
    const float = item.map(x => Number.parseFloat(x));
    const parser = float.chain(x => x > 2 ? of(x) : empty)

    assert.equal(parser.parse('4'), Array.of([4, '']))
    assert.equal(parser.parse('2'), Array.of())
})

test('Parser.alt', function () {
    assert.equal(empty.alt(empty).parse('1234'), Array.of())
    assert.equal(empty.alt(item).parse('123'), Array.of(['1', '23']))
    assert.equal(item.alt(empty).parse('123'), Array.of(['1', '23']))
})

test('Parser.comma', function () {
    assert.equal(item.comma(item).parse('1234'), Array.of(['2', '34']))
})

test('Parser.rcomma', function () {
    assert.equal(item.rcomma(item).parse('1234'), Array.of(['1', '34']))
})

test('Do', function () {
    const parser = Do(function* () { const x = yield item; return x + x })
    assert.equal(parser.parse('abc'), Array.of(['aa', 'bc']))
})

test('char', function () {
    assert.equal(char('a').parse('abc'), Array.of(['a', 'bc']))
    assert.equal(char('a').parse('efgh'), Array.of())
})

test('digit', function () {
    assert.equal(digit.parse('1abc'), Array.of(['1', 'abc']))
    assert.equal(digit.parse('abc'), Array.of())
})

test('string', function () {
    assert.equal(string('abc').parse('abcdef'), Array.of(['abc', 'def']))
    assert.equal(string('abc').parse('ab123'), Array.of())
    assert.equal(string('').parse('abc123'), Array.of(['', 'abc123']))
})

test('many & some', function () {
    assert.equal(many(string('abc')).parse('123456'), Array.of([[], '123456']))
    assert.equal(many(string('abc')).parse('abcabc'), Array.of([['abc', 'abc'], '']))
    assert.equal(some(string('abc')).parse('abcabc'), Array.of([['abc', 'abc'], '']))
    assert.equal(some(digit).parse('abc'), Array.of())
})

test('choice', function () {
    assert.equal(choice(char('a'), char('b'), char('c')).parse('abc'), Array.of(['a', 'bc']))
    assert.equal(choice(char('a'), char('b'), char('c')).parse('bca'), Array.of(['b', 'ca']))
})

test('nat', function () {
    assert.equal(nat.parse('1234'), Array.of([1234, '']))
    assert.equal(nat.parse('1234abc'), Array.of([1234, 'abc']))
})

test('int', function () {
    assert.equal(int.parse('1234'), Array.of([1234, '']))
    assert.equal(int.parse('-1234'), Array.of([-1234, '']))
    assert.equal(int.parse('1234abc'), Array.of([1234, 'abc']))
    assert.equal(int.parse('-1234abc'), Array.of([-1234, 'abc']))
    assert.equal(int.parse('-12-34abc'), Array.of([-12, '-34abc']))
})

test('space', function () {
    assert.equal(space.parse('     abc'), Array.of([undefined, 'abc']))
    assert.equal(space.parse('abc'), Array.of([undefined, 'abc']))
})

test.run()