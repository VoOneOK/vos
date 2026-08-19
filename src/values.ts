/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { colors } from "./utils/colors.ts"
import { getGcd, roundTo } from "./utils/numbers.ts"
import Parser from "./parser.ts"
import { EOFToken, type Token } from "./tokens.ts"
import type { Numberish, ValueType, Variable } from "./types.ts"

const PRECISION_LIMIT = 6

export abstract class Value {
    type: ValueType
    protected constructor(type: ValueType) {
        this.type = type
    }

    public abstract getAsString(): string
    public abstract getAsBoolean(): boolean
    public abstract getAsNative(): number | string | boolean | Function
    public abstract print(): void
}

export class NumberValue extends Value {
    normalPart: number
    imaginaryUnit: boolean

    constructor(normalPart: number, imaginaryUnit: boolean = false) {
        super("number")
        this.normalPart = roundTo(normalPart, PRECISION_LIMIT)
        this.imaginaryUnit = normalPart === 0 ? false : imaginaryUnit
    }

    public getAsString() {
        return this.normalPart + (this.imaginaryUnit ? "i" : "")
    }

    public getAsBoolean() {
        return !this.imaginaryUnit
    }

    public getAsNative(): number | string {
        if (this.imaginaryUnit) return this.getAsString()
        return this.normalPart
    }

    public print() {
        console.log(colors.yellow(this.getAsString()))
    }
}

export class ComplexNumberValue extends Value {
    real: number
    imag: number

    constructor(real: number, imag: number) {
        super("complexNumber")
        this.real = roundTo(real, PRECISION_LIMIT)
        this.imag = roundTo(imag, PRECISION_LIMIT)
    }

    public getAsString(): string {
        const hasFloat = this.real !== Math.floor(this.real) || this.imag !== Math.floor(this.imag)
        const commonFactor = hasFloat ? 1 : getGcd(this.real, this.imag)
        const secondTerm = this.imag / commonFactor
        const coreExpression = `(${this.real / commonFactor}${secondTerm < 0 ? "" : "+"}${secondTerm}i)`
        if (commonFactor === 1) return coreExpression
        else if (commonFactor === -1) return "-" + coreExpression
        return `${commonFactor}${coreExpression}`
    }

    public getAsBoolean() {
        return false // complexity is never the right way
    }

    public getAsNative() {
        return this.getAsString()
    }

    public print() {
        console.log(colors.yellow(this.getAsString()))
    }
}

export class InfinityValue extends Value {
    grade: 1 | 2 | 3
    positive: boolean

    constructor(grade: 1 | 2 | 3, positive: boolean = true) {
        super("infinity")

        this.grade = grade
        this.positive = positive
    }

    getAsString() {
        switch (this.grade) {
            case 1:
                return this.positive ? "Infinity" : "Debt"
            case 2:
                return this.positive ? "Bigger infinity" : "Bigger Debt"
            case 3:
                return this.positive ? "Biggest infinity" : "Biggest Debt"
        }
    }

    getAsBoolean() {
        return this.positive
    }

    getAsNative() {
        return this.positive ? Infinity : -Infinity
    }

    print() {
        console.log(colors.yellow(this.getAsString()))
    }
}

export class StringValue extends Value {
    value: string

    constructor(value: string) {
        super("string")
        this.value = value
    }

    public getAsString() {
        return this.value
    }

    public getAsBoolean() {
        return this.value.length > 0
    }

    public getAsNative(): string {
        return this.value
    }

    public print() {
        console.log(this.getAsString())
    }
}

export class BooleanValue extends Value {
    value: boolean

    constructor(value: boolean) {
        super("boolean")
        this.value = value
    }

    public getAsString() {
        return this.value ? "true" : "false"
    }

    public getAsBoolean() {
        return this.value
    }

    public getAsNative(): boolean {
        return this.value
    }

    public print() {
        console.log(this.value ? colors.green(this.getAsString()) : colors.red(this.getAsString()))
    }
}

export class NahValue extends Value {
    constructor() {
        super("boolean")
    }

    public getAsString() {
        return "Nah"
    }

    public getAsBoolean() {
        return false
    }

    public getAsNative() {
        return "Nah"
    }

    public print() {
        console.log(colors.bold(this.getAsString()))
    }
}

export class FunctionValue extends Value {
    private body: Token[]
    private params: string[]

    constructor(body: Token[], params: string[], ending: number) {
        super("function")

        this.body = body
        this.body.push(new EOFToken(ending))
        this.params = params
    }

    public getAsString() {
        return "Function"
    }

    public getAsBoolean() {
        return true
    }

    public getAsNative() {
        // i have no idea how to do ot right now. Language has a design hole here
        return () => {}
        // return (...args: any[]) => this.call()
    }

    public print() {
        console.log(colors.cyan(this.getAsString()))
    }

    public getParams(): string[] {
        return this.params
    }

    public call(variables: Map<string, Variable>): Value {
        const parser = new Parser(this.body, false, variables)
        return parser.parse()
    }
}

export class NativeFunctionValue extends Value {
    private nativeCallback: (...args: Value[]) => Value

    constructor(nativeCallback: (...args: Value[]) => Value) {
        super("nativeFunction")

        this.nativeCallback = nativeCallback
    }

    public getAsString() {
        return "Native function"
    }

    public getAsBoolean() {
        return true
    }

    public getAsNative() {
        return () => {}
    }

    public print() {
        console.log(colors.cyan(this.getAsString()))
    }

    public call(...args: any[]): Value {
        return this.nativeCallback(...args)
    }
}
