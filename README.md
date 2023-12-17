<div align="center">
    <img src="https://www.dropbox.com/s/nfnw09uky91r1v1/parseltongue.png?raw=1" width="180"/>
</div>
<br/>
<div align="center">
  <a href="https://www.npmjs.com/package/parseltongue">
    <img alt="NPM" src="https://badgen.net/npm/v/parseltongue"/>
  </a>
  <a href="https://github.com/iliocatallo/parseltongue/actions/workflows/ci.yml">
    <img alt="Build status" src="https://github.com/iliocatallo/mire/actions/workflows/ci.yml/badge.svg"/>
  </a>
  <a href="https://coveralls.io/github/iliocatallo/parseltongue">
    <img alt="Coverage" src="https://coveralls.io/repos/github/iliocatallo/parseltongue/badge.svg?branch=main"/>
  </a>
</div>

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Reference](#reference)
  - [Symbols](#symbols)
  - [Numbers](#numbers)
  - [Strings](#strings)
  - [Booleans](#booleans)
  - [Dotted pairs](#dotted-pairs)
  - [Lists](#lists)
  - [Quotations](#quotations)
- [Partial Parsing](#partial-parsing)
- [Error Handling](#error-handling)


## Introduction

_Parseltongue_ is an S-expression parser. It provides a single `parse` function capable of parsing symbols, numbers, booleans and strings — as well as lists and dotted pairs. Expressions may be quoted.

```javascript
import { parse } from 'parseltongue';

parse(`(address (street "644 Glen Summit")
                (city "St. Charles")
                (state "Missouri")
                (zip 63304))`);
/*
[
  'address',
  [ 'street', '"644 Glen Summit"' ],
  [ 'city', '"St. Charles"' ],
  [ 'state', '"Missouri"' ],
  [ 'zip', 63304 ]
]
*/
```

## Installation

Parseltongue can be installed via npm with the following command:

```
npm install parseltongue
```

## Reference

### Symbols

Atomic symbols are parsed into native JavaScript `string`s. As usual, symbols cannot start with a number.

```javascript
import { parse } from 'parseltongue';

parse(`driver-loop`);
// 'driver-loop'

parse(`+`);
// '+'
```

### Numbers

Atomic numbers are parsed into native JavaScript `number`s. As such, they are subject to the same rules and limitations. There is no support for fractions (i.e., exact numbers).

```javascript
import { parse } from 'parseltongue';

parse(`42`);
// 42

parse(`12.8`);
// 12.8
```

### Strings

Atomic strings are parsed into native JavaScript `string`s. The content is put in quotation marks (`"`).

```javascript
import { parse } from 'parseltongue';

parse(`"this is a string"`);
// '"this is a string"'
```

### Booleans

Atomic booleans are parsed into native JavaScript `boolean`s.

```javascript
import { parse } from 'parseltongue';

parse(`#t`);
// true

parse(`#f`);
// false
```

### Dotted pairs

JavaScript does not provide a [native tuple data type](https://github.com/tc39/proposal-record-tuple). For this reason, dotted pairs are parsed to a custom `Pair` class.

```javascript
import { parse, Pair } from 'parseltongue';

parse(`(abelson . sussman)`);
// Pair { car: 'abelson', cdr: 'sussman' }
```

### Lists

Symbolic lists are parsed into native JavaScript arrays. Dotted pairs forming a proper list are also parsed to arrays.

```javascript
import { parse } from 'parseltongue';

parse(`(roger dave nick rick)`);
// [ 'roger', 'dave', 'nick', 'rick' ]

parse(`(roger . (dave . (nick . (rick . ()))))`);
// [ 'roger', 'dave', 'nick', 'rick' ]
```

Square and curly brackets are also supported:

```javascript
import { parse } from 'parseltongue';

parse(`{[roger bass] [dave guitar] [nick drums] [rick keyboard]}`);
/*
[
  [ 'roger', 'bass' ],
  [ 'dave', 'guitar' ],
  [ 'nick', 'drums' ],
  [ 'rick', 'keyboard' ]
]
*/
```

### Quotations

S-expressions may be quoted.

```javascript
import { parse } from 'parseltongue';

parse(`'42`);
// [ 'quote', 42 ]

parse(`'(1 2 3)`);
// [ 'quote', [ 1, 2, 3 ] ]
```

## Partial Parsing

Parseltoungue has built-in support for partial parsing. That is, the `parse` function asks for more characters if the input string has to potential to result in a well-defined S-expresssion.

```javascript
import { Partial, parse } from 'parseltongue';

parse(`(1 2 `);
// Partial {}

parse(`(1 2 `).complete(`3)`);
// [ 1, 2, 3 ]
```

A partial parsing can be turned into a failure using the `.fail()` method. When invoked, `.fail()` will throw a `ParseError` error.

```javascript
import { Partial, ParseError, parse } from 'parseltongue';

parse(`(1 2`).fail();
/* throws
   ParseError {
     at: 4,
     expected: {
       oneOf: [
         '0', '1',     '2',
         '3', '4',     '5',
         '6', '7',     '8',
         '9', '/\\s/', ')',
         '.'
       ]
     }
   }
*/

```




## Error Handling

When fed with a malformed input, `parse` throws a `ParseError` error detailing what valid characters were instead expected in the input string.

```javascript
import { ParseError, parse } from 'parseltongue';

parse(`0.12q`);
/* throws
   ParseError {
     at: 4,
     expected: {
       oneOf: [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'end-of-input'
      ]
    }
  }
*/

parse(`0.121`);
// 0.121
```

<hr/>

<a href="https://www.flaticon.com/free-icons/snake" title="snake icons">Snake icons</a> created by Freepik - Flaticon</a>
