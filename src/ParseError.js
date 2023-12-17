export class ParseError extends Error {
  constructor(at, expected) {
    super();
    this.at = at;
    this.expected = expected;
  }
}
