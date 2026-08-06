/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { Operator, TokenType, ValuableTokenType } from "./types.ts"
import { BooleanValue, NumberValue, StringValue, Value } from "./values.ts"

export abstract class Token {
    type: TokenType
    protected constructor(type: TokenType) {
        this.type = type
    }

    public abstract getAsString(): string
}

export abstract class ValuableToken extends Token {
    protected constructor(type: ValuableTokenType) {
        super(type)
    }

    public abstract getAsValue(): Value
}

export class NumberToken extends ValuableToken {
    normalPart: number
    imaginaryPart: boolean

    constructor(normalPart: number, imaginaryPart: boolean = false) {
        super("number")
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

    constructor(value: string) {
        super("string")
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

    constructor(value: boolean) {
        super("boolean")
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

    constructor(operator: Operator) {
        super("operator")
        this.operator = operator
    }

    public getAsString(): Operator {
        return this.operator
    }
}

export class KeywordToken extends Token {
    keyword: string

    constructor(keyword: string) {
        super("keyword")
        this.keyword = keyword
    }

    public getAsString() {
        return this.keyword
    }
}

export class IdentifierToken extends Token {
    identifier: string

    constructor(identifier: string) {
        super("identifier")
        this.identifier = identifier
    }

    public getAsString() {
        return this.identifier
    }
}

export class EOFToken extends Token {
    constructor() {
        super("eof")
    }

    public getAsString() {
        return "EOF"
    }
}
