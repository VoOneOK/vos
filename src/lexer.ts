/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    Token,
    NumberToken,
    StringToken,
    BooleanToken,
    OperatorToken,
    KeywordToken,
    IdentifierToken,
    EOFToken,
} from "./tokens.ts"
import type { Operator } from "./types.ts"

class Lexer {
    code: string
    position: number
    tokens: Token[]
    operators: Operator[]

    keywords: string[]
    nwords: string[]
    imaginaryNumbers: string[]
    smallImaginaryNumbers: string[]

    identifierRegex: RegExp

    constructor(code: string) {
        this.code = code.trim()
        this.position = 0
        this.tokens = []
        this.operators = [
            // ! Multi-character first
            "=",
            "+",
            "-",
            "*",
            "/",
            "(",
            ")",
            "{",
            "}",
            ",",
        ]

        this.keywords = ["fun", "return"]

        this.nwords = ["singer", "digger", "trigger", "nokia"]

        this.imaginaryNumbers = ["i"]
        this.smallImaginaryNumbers = this.imaginaryNumbers.map((n) => n.toLowerCase())

        this.identifierRegex = /[a-z@_]/i
    }

    tokenize() {
        while (this.position < this.code.length) {
            const char = this.code[this.position]

            // Whitespaces
            if (/\s/.test(char)) {
                this.position++
                continue
            }

            // comments
            if (char === "/" && this.code[this.position + 1] === "/") {
                this.tokenizeComment()
                continue
            }

            // Operators
            const twoChar = this.code.substr(this.position, 2) as Operator
            if (this.operators.includes(twoChar)) {
                this.tokens.push(new OperatorToken((this.position += 2), twoChar))
                continue
            } else if (this.operators.includes(char as Operator)) {
                this.tokens.push(new OperatorToken(this.position++, char as Operator))
                continue
            }

            // Numbers
            if (/\d/.test(char) || char === "-") {
                this.tokenizeNumber()
                continue
            }

            // Strings
            if (char === '"' || char === "'") {
                this.tokenizeString()
                continue
            }

            // Booleans
            if (char === "t" || char === "f") {
                if (this.tryTokenizeBoolean()) continue
            }

            // Keywords
            if (char.match(/[a-z]/i)) {
                if (this.tryTokenizeKeyword()) continue
            }

            // Identifiers
            // ! Always put in the end
            if (char.match(this.identifierRegex)) {
                this.tokenizeIdentifier()
                continue
            }

            // Unrecognized character
            this.error(`IDK what is this: "${char}"`)
        }

        this.tokens.push(new EOFToken(this.position))

        return this.tokens
    }

    tokenizeComment() {
        let endOfLinePosition = this.position + 2
        while (endOfLinePosition < this.code.length && this.code[endOfLinePosition] !== "\n") {
            endOfLinePosition++
        }
        this.position = endOfLinePosition + 1
    }

    tokenizeNumber() {
        let value = ""
        let isFloat = false
        let imaginaryUnit = false

        while (this.position < this.code.length) {
            const char = this.code[this.position]
            const isDigit = /\d/.test(char)
            const isPoint = char === "."

            if ((isDigit || isPoint) && imaginaryUnit) {
                this.error(
                    `You didn't quite get it... "${char}" is a normal digit, but normal digits goes before imaginary unit. Please follow rules or imaginary unit will follow you!`,
                )
            } else if (isDigit) {
                value += char
                this.position++
            } else if (isPoint && isFloat) {
                this.error(
                    `Why it has TWO points (dots or whatever you call it)? Not enough floativeness, huh? Use double then`,
                )
            } else if (isPoint) {
                isFloat = true
                value += char
                this.position++
            } else if (char === "i") {
                if (this.code[this.position - 1] === ".") {
                    this.error(`Reminder: i isn't a good fractional part`)
                } else if (!imaginaryUnit) {
                    imaginaryUnit = true
                    this.position++
                } else if (imaginaryUnit) {
                    this.error(`WHY WOULD YOU NEED TWO i's? It is -1 if you didn't know. Don't be sad tho`)
                }
            } else if (char === "I") {
                this.error(`WHAT EVEN IS I? Are you crazy?! It is i - such a good imaginary unit`)
            } else if (/[a-z]/i.test(char)) {
                this.error(`IT WAS SUPPOSED TO BE A NUMBER. "${char}" is a letter!`)
            } else {
                break
            }
        }

        const normalPart = isFloat ? parseFloat(value) : parseInt(value, 10)
        this.tokens.push(new NumberToken(this.position, normalPart, imaginaryUnit))
    }

    tokenizeString() {
        const quote = this.code[this.position]
        let value = ""
        this.position++ // skip opening quote

        while (this.position < this.code.length && this.code[this.position] !== quote) {
            value += this.code[this.position]
            this.position++
        }

        if (this.position >= this.code.length) {
            this.error("You didn't finish the string! This is BAD!")
        }

        this.position++ // skip closing quote

        this.tokens.push(new StringToken(this.position, value))
    }

    tryTokenizeBoolean() {
        if (this.code.slice(this.position, this.position + 4) === "true") {
            this.tokens.push(new BooleanToken((this.position += 4), true))
            return true
        } else if (this.code.slice(this.position, this.position + 5) === "false") {
            this.tokens.push(new BooleanToken((this.position += 5), false))
            return true
        }
        return false
    }

    tryTokenizeKeyword() {
        for (const keyword of this.keywords) {
            const length = keyword.length

            if (
                this.code.slice(this.position, this.position + length) === keyword &&
                !/[a-z\d]/i.test(this.code[this.position + length])
            ) {
                this.tokens.push(new KeywordToken((this.position += length), keyword))
                return true
            }
        }
        return false
    }

    tokenizeIdentifier() {
        let identifier = this.code[this.position]
        this.position++

        while (this.position < this.code.length && this.code[this.position].match(this.identifierRegex)) {
            identifier += this.code[this.position]
            this.position++
        }

        this.tokens.push(new IdentifierToken(this.position, identifier))
    }

    error(message: string) {
        let lineStart = this.position
        let lineEnd = this.position
        while (this.code[lineStart] !== "\n" && lineStart > 0) {
            lineStart--
        }
        while (this.code[lineEnd] !== "\n" && lineEnd < this.code.length) {
            lineEnd++
        }

        console.log("❌ Lexer error")
        console.log("❌ " + this.code.substring(lineStart, lineEnd).trim())
        console.log("❌ " + " ".repeat(this.position - lineStart - 1) + "^")
        console.log("❌ " + message)

        process.exit(1)
    }
}

export default Lexer
