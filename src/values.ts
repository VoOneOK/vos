/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { colors } from "./colors.ts"
import { getGcd, roundTo } from "./numbers.ts"
import Parser from "./parser.ts"
import { EOFToken, type Token } from "./tokens.ts"
import type { ValueType, Variable } from "./types.ts"

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

    public addNumber(secondValue: NumberValue | ComplexNumberValue | number): NumberValue | ComplexNumberValue {
        if (secondValue instanceof ComplexNumberValue) return secondValue.addNumber(this)

        const secondNumber = secondValue instanceof NumberValue ? secondValue.normalPart : secondValue
        const secondImaginaryUnit = secondValue instanceof NumberValue ? secondValue.imaginaryUnit : false

        if (this.imaginaryUnit !== secondImaginaryUnit) {
            return new ComplexNumberValue(
                this.imaginaryUnit ? secondNumber : this.normalPart,
                this.imaginaryUnit ? this.normalPart : secondNumber,
            )
        }

        return new NumberValue(this.normalPart + secondNumber, this.imaginaryUnit)
    }

    public subtractNumber(secondValue: NumberValue | ComplexNumberValue | number) {
        if (secondValue instanceof ComplexNumberValue) return secondValue.subtractNumber(this)
        return this.addNumber(secondValue instanceof NumberValue ? secondValue.multiplyNumber(-1) : secondValue * -1)
    }

    public multiplyNumber(secondValue: NumberValue | ComplexNumberValue | number): NumberValue | ComplexNumberValue {
        if (secondValue instanceof ComplexNumberValue) return secondValue.multiplyNumber(this)
        if (!(secondValue instanceof NumberValue)) {
            return new NumberValue(this.normalPart * secondValue, this.imaginaryUnit)
        }

        return new NumberValue(
            this.normalPart * secondValue.normalPart * (this.imaginaryUnit && secondValue.imaginaryUnit ? -1 : 1),
            this.imaginaryUnit !== secondValue.imaginaryUnit,
        )
    }

    public divideNumber(secondValue: NumberValue | ComplexNumberValue | number): NumberValue | ComplexNumberValue {
        if (secondValue instanceof ComplexNumberValue) return this.divideByComplexNumber(secondValue)
        const secondNumber = secondValue instanceof NumberValue ? secondValue.normalPart : secondValue
        const secondImaginaryUnit = secondValue instanceof NumberValue ? secondValue.imaginaryUnit : false

        if (this.imaginaryUnit === secondImaginaryUnit) {
            return new NumberValue(this.normalPart / secondNumber, false)
        } else if (this.imaginaryUnit) {
            return new NumberValue(this.normalPart / secondNumber, true)
        }

        return new NumberValue(-1 * (this.normalPart / secondNumber), true)
    }

    public divideByComplexNumber(secondValue: ComplexNumberValue): NumberValue | ComplexNumberValue {
        // Math break
        // (a + bi) / (c + di) = ((ac + bd) / (c^2 + d^2)) + ((bc - ad) / (c^2 + d^2))i
        const a = this.imaginaryUnit ? 0 : this.normalPart
        const b = this.imaginaryUnit ? this.normalPart : 0
        const c = secondValue.real
        const d = secondValue.imag

        const newReal = (a * c + b * d) / (c * c + d * d)
        const newImag = (b * c - a * d) / (c * c + d * d)

        if (newImag === 0) return new NumberValue(newReal, false)
        return new ComplexNumberValue(newReal, newImag)
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

    public addNumber(secondValue: ComplexNumberValue | NumberValue | number): NumberValue | ComplexNumberValue {
        if (secondValue instanceof ComplexNumberValue) {
            const newReal = this.real + secondValue.real
            const newImag = this.imag + secondValue.imag

            if (newImag === 0) return new NumberValue(newReal, false)

            return new ComplexNumberValue(newReal, newImag)
        } else if (secondValue instanceof NumberValue) {
            const newReal = secondValue.imaginaryUnit ? this.real : this.real + secondValue.normalPart
            const newImag = secondValue.imaginaryUnit ? this.imag + secondValue.normalPart : this.imag

            if (newImag === 0) return new NumberValue(newReal, false)

            return new ComplexNumberValue(newReal, newImag)
        } else {
            return new ComplexNumberValue(this.real + secondValue, this.imag)
        }
    }

    public subtractNumber(secondValue: ComplexNumberValue | NumberValue | number) {
        if (secondValue instanceof ComplexNumberValue) {
            const newReal = this.real - secondValue.real
            const newImag = this.imag - secondValue.imag

            if (newImag === 0) return new NumberValue(newReal, false)

            return new ComplexNumberValue(newReal, newImag)
        } else if (secondValue instanceof NumberValue) {
            const newReal = secondValue.imaginaryUnit ? this.real : this.real - secondValue.normalPart
            const newImag = secondValue.imaginaryUnit ? this.imag - secondValue.normalPart : this.imag

            if (newImag === 0) return new NumberValue(newReal, false)

            return new ComplexNumberValue(newReal, newImag)
        } else {
            return new ComplexNumberValue(this.real - secondValue, this.imag)
        }
    }

    public multiplyNumber(secondValue: ComplexNumberValue | NumberValue | number): NumberValue | ComplexNumberValue {
        // Math break
        // (a + bi) * (c + di) = ac + adi + bci - bd
        // real = ac - bd; imag = adi + bci

        const a = this.real
        const b = this.imag
        let c
        let d

        if (secondValue instanceof ComplexNumberValue) {
            c = secondValue.real
            d = secondValue.imag
        } else if (secondValue instanceof NumberValue) {
            c = secondValue.imaginaryUnit ? 0 : secondValue.normalPart
            d = secondValue.imaginaryUnit ? secondValue.normalPart : 0
        } else {
            c = secondValue
            d = 0
        }

        const newReal = a * c - b * d
        const newImag = a * d + b * c

        if (newImag === 0) return new NumberValue(newReal, false)
        if (newReal === 0) return new NumberValue(newImag, true)
        return new ComplexNumberValue(newReal, newImag)
    }

    public divideNumber(secondValue: ComplexNumberValue | NumberValue | number): NumberValue | ComplexNumberValue {
        // Math break
        // (a + bi) / (c + di) = ((ac + bd) / (c^2 + d^2)) + ((bc - ad) / (c^2 + d^2))i
        const a = this.real
        const b = this.imag
        let c
        let d

        if (secondValue instanceof ComplexNumberValue) {
            c = secondValue.real
            d = secondValue.imag
        } else if (secondValue instanceof NumberValue) {
            c = secondValue.imaginaryUnit ? 0 : secondValue.normalPart
            d = secondValue.imaginaryUnit ? secondValue.normalPart : 0
        } else {
            c = secondValue
            d = 0
        }

        const newReal = (a * c + b * d) / (c * c + d * d)
        const newImag = (b * c - a * d) / (c * c + d * d)

        if (newImag === 0) return new NumberValue(newReal, false)
        if (newReal === 0) return new NumberValue(newImag, true)
        return new ComplexNumberValue(newReal, newImag)
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

    constructor(body: Token[], params: string[]) {
        super("function")

        this.body = body
        this.body.push(new EOFToken())
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

    public call(variables: Map<string, Variable>, positionOffset: number): Value {
        const parser = new Parser(this.body, false, variables, positionOffset)
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
