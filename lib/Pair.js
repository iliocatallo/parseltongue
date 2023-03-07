export class Pair {

    constructor(car, cdr) {
        this.car = car
        this.cdr = cdr
    } 

    static cons(car, cdr) {
        return new Pair(car, cdr)
    }

    static isPair(value) {
        return value instanceof Pair
    }
}