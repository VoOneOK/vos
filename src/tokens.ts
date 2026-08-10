/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { Operator, TokenType, ValuableTokenType } from "./types.ts"
import { BooleanValue, NumberValue, StringValue, Value } from "./values.ts"

export abstract class Token {
    type: TokenType
    codePosition: number
    protected constructor(type: TokenType, codePosition: number) {
        this.type = type
        this.codePosition = codePosition
    }

    public abstract getAsString(): string
}

export abstract class ValuableToken extends Token {
    protected constructor(type: ValuableTokenType, codePosition: number) {
        super(type, codePosition)
    }

    public abstract getAsValue(): Value
}

export class NumberToken extends ValuableToken {
    normalPart: number
    imaginaryPart: boolean

    constructor(codePosition: number, normalPart: number, imaginaryPart: boolean = false) {
        super("number", codePosition)
        this.normalPart = normalPart
        this.imaginaryPart = imaginaryPart
    }

    public getAsString() {
        return this.normalPart + (this.imaginaryPart ? "i" : "")
    }

    public getAsValue(): NumberValue {
        return new NumberValue(this.normalPart, this.imaginaryPart)
    }
}

export class StringToken extends ValuableToken {
    value: string

    constructor(codePosition: number, value: string) {
        super("string", codePosition)
        this.value = value
    }

    public getAsString() {
        return this.value
    }

    public getAsValue() {
        return new StringValue(this.value)
    }
}

export class BooleanToken extends ValuableToken {
    value: boolean

    constructor(codePosition: number, value: boolean) {
        super("boolean", codePosition)
        this.value = value
    }

    public getAsString(): "true" | "false" {
        // @ts-ignore
        return this.value + ""
    }

    public getAsValue() {
        return new BooleanValue(this.value)
    }
}

export class OperatorToken extends Token {
    operator: Operator

    constructor(codePosition: number, operator: Operator) {
        super("operator", codePosition)
        this.operator = operator
    }

    public getAsString(): Operator {
        return this.operator
    }
}

export class KeywordToken extends Token {
    keyword: string

    constructor(codePosition: number, keyword: string) {
        super("keyword", codePosition)
        this.keyword = keyword
    }

    public getAsString() {
        return this.keyword
    }
}

export class IdentifierToken extends Token {
    identifier: string

    constructor(codePosition: number, identifier: string) {
        super("identifier", codePosition)
        this.identifier = identifier
    }

    public getAsString() {
        return this.identifier
    }
}

export class EOFToken extends Token {
    constructor(codePosition: number) {
        super("eof", codePosition)
    }

    public getAsString() {
        return "EOF"
    }
}
