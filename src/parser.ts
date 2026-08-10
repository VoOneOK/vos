/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { EOFToken, IdentifierToken, NumberToken, OperatorToken, StringToken, Token, ValuableToken } from "./tokens.ts"
import {
    type Expression,
    type ExpressionOperator,
    type Operator,
    type TokenType,
    type ValuableTokenType,
    type ValueType,
    type Variable,
} from "./types.ts"
import {
    BooleanValue,
    ComplexNumberValue,
    FunctionValue,
    NahValue,
    NativeFunctionValue,
    NumberValue,
    StringValue,
    type Value,
} from "./values.ts"

const PRECEDENCE: Partial<Record<Operator, number>> = {
    "*": 4,
    "/": 4,
    "+": 3,
    "-": 3,
    "=": 2,
}

class Parser {
    private tokens: Token[]
    private toplevel: boolean
    private position: number
    private variables: Map<string, Variable>
    private positionOffset: number
    private valueToReturn: Value | null
    private VALUE_TYPES: ValueType[]

    constructor(
        tokens: Token[],
        toplevel: boolean,
        builtInVariables: Map<string, Variable> = new Map(),
        positionOffset: number = 0,
    ) {
        this.tokens = tokens
        this.toplevel = toplevel
        this.position = 0
        this.positionOffset = positionOffset

        this.variables = builtInVariables
        this.valueToReturn = null

        this.VALUE_TYPES = ["number", "string", "boolean", "function", "nativeFunction"] as const
    }

    parse(): Value {
        while (!this.isAtEnd() && this.valueToReturn === null) {
            this.parseStatement()
        }
        return this.valueToReturn ? this.valueToReturn : new NahValue()
    }

    parseStatement() {
        console.log(this.peek(), this.check("identifier"))
        if (this.match("identifier")) {
            if (this.check("operator") && this.peek().getAsString() === "(") {
                this.parseFunctionCall()
            } else {
                this.parseAssignment()
            }
        } else if (this.fullMatch("keyword", "fun")) {
            this.parseFunctionInit()
        } else if (this.fullMatch("keyword", "return")) {
            this.parseReturn()
        } else {
            this.error(`You probably did something wrong`)
        }
    }

    parseFunctionCall(): Value {
        const functionName = this.previous().getAsString()
        const functionVar = this.variables.get(functionName)

        if (
            !functionVar ||
            !(functionVar.value instanceof FunctionValue || functionVar.value instanceof NativeFunctionValue)
        ) {
            throw this.error(`${functionName} is not a function`)
        }

        const functionValue = functionVar.value

        this.consume("operator", "(", "Functions cry without a first parenthesis. Add (")

        const paramsValues = []
        while (!this.check("operator") || this.peek().getAsString() !== ")") {
            if (this.isAtEnd()) {
                throw this.error("Close the function call, bro, expected )")
            }

            const paramValue = this.parseExpression()
            paramsValues.push(this.evaluateExpression(paramValue))

            if (this.check("operator") && this.peek().getAsString() === ",") {
                this.advance()
            } else if (!(this.check("operator") && this.peek().getAsString() === ")")) {
                throw this.error("Expected ',' or ')' after parameter")
            }
        }

        this.consume("operator", ")", "Functions cry without a second parenthesis. Add )")

        if (functionValue instanceof NativeFunctionValue) {
            return functionValue.call(...paramsValues)
        } else {
            const functionVariables = new Map(this.variables)
            const params = functionValue.getParams()

            for (let i = 0; i < params.length; i++) {
                const paramName = params[i]
                const paramValue = paramsValues[i]
                functionVariables.set(paramName, {
                    builtin: false,
                    value: paramValue,
                })
            }

            return functionValue.call(functionVariables, this.position)
        }
    }

    parseFunctionInit() {
        if (!this.match("identifier")) {
            throw this.error("You are using fun for fun? It initialize functions (telling you just in case)")
        }
        const functionName = this.previous().getAsString()

        const params = []
        this.consume("operator", "(", "Functions cry without a second parenthesis. Add (")

        if (!(this.check("operator") && this.peek().getAsString() === ")")) {
            while (true) {
                if (this.match("identifier")) {
                    params.push(this.previous().getAsString())

                    if (this.check("operator") && this.peek().getAsString() === ",") {
                        this.advance()
                        continue
                    }
                    if (this.check("operator") && this.peek().getAsString() === ")") {
                        break
                    }
                    throw this.error("Expected ',' or ')' after parameter")
                } else {
                    throw this.error("Expected parameter name")
                }
            }
        }

        this.consume("operator", ")", "Functions cry without a second parenthesis after parameters. Add )")
        this.consume("operator", "{", "Dress function's body with braces. Add {")

        const bodyTokens = []
        let braceCount = 1
        let ending = 0

        while (braceCount > 0 && !this.isAtEnd()) {
            const token = this.advance()
            if (token.type === "operator" && token.getAsString() === "{") {
                braceCount++
            } else if (token.type === "operator" && token.getAsString() === "}") {
                braceCount--
                ending = token.codePosition
            }
            if (braceCount > 0) {
                bodyTokens.push(token)
            }
        }

        if (braceCount !== 0) {
            throw this.error("Unclosed function body")
        }

        this.variables.set(functionName, {
            builtin: false,
            value: new FunctionValue(bodyTokens, params, ending),
        })
    }

    parseReturn() {
        const expr = this.parseExpression()
        const value = this.evaluateExpression(expr)
        this.valueToReturn = value
    }

    parseAssignment() {
        const identifier = this.previous().getAsString()

        if (!this.match("operator") || this.previous().getAsString() !== "=") {
            throw this.error(`Expected = after variable name`)
        }

        const expr = this.parseExpression()
        const value = this.evaluateExpression(expr)

        if (this.variables.get(identifier)?.builtin) {
            throw this.error(
                `You trying to touch something beyond the limits I have set. You will not reassign ${identifier}`,
            )
        }

        this.variables.set(identifier, {
            value: value,
            builtin: false,
        })
    }

    parseExpression() {
        return this.parseBinaryExpression(0)
    }

    parseBinaryExpression(minPrecedence: number): Expression {
        let left = this.parsePrimaryExpression()

        while (true) {
            const operator = this.peek() as OperatorToken
            if (operator.type !== "operator") break

            const operatorValue = operator.getAsString()
            const precedence = PRECEDENCE[operatorValue]

            if (!precedence) break
            if (precedence < minPrecedence) break

            this.advance()

            const right = this.parseBinaryExpression(precedence + 1)

            left = {
                type: "binary",
                operator: operatorValue as ExpressionOperator,
                left,
                right,
            }
        }

        return left
    }

    parsePrimaryExpression(): Expression {
        const currentToken = this.peek()

        if (currentToken instanceof ValuableToken) {
            const foundValue = currentToken.getAsValue()
            this.advance()
            return { type: currentToken.type as ValuableTokenType, value: foundValue }
        } else if (this.match("identifier")) {
            const varName = this.previous().getAsString()

            if (this.fullCheck("operator", "(")) {
                // function call in expression
                const returnedValue = this.parseFunctionCall()
                return { type: returnedValue.type, value: returnedValue }
            }

            if (!this.variables.has(varName)) {
                throw this.error(`Undefined variable: ${varName}`)
            }
            const varValue = this.variables.get(varName)
            if (!varValue || !varValue.value) throw this.error(`${varName} not found. LOCK IN!`)
            return { type: varValue.value.type, value: varValue.value }
        }
        if (this.match("operator") && this.previous().getAsString() === "(") {
            const expression = this.parseExpression()
            this.consume("operator", ")", "Expressions love to be finished ig. Add )")
            return expression
        }
        throw this.error("Expected primary expression. LOCK IN!")
    }

    evaluateExpression(expression: Expression): Value {
        // @ts-expect-error shut up. I am checking, and you don't like it, so i don't like you
        if (this.VALUE_TYPES.includes(expression.type)) return expression.value
        if (expression.type !== "binary") throw this.error("IDK what you tried to do")

        const left = this.evaluateExpression(expression.left)
        const right = this.evaluateExpression(expression.right)

        const concatenation =
            (left instanceof StringValue || right instanceof StringValue) && expression.operator === "+"
        const mathOperator = ["+", "-", "*", "/"].includes(expression.operator)
        const mathOperation =
            (left instanceof NumberValue || left instanceof ComplexNumberValue) &&
            (right instanceof NumberValue || right instanceof ComplexNumberValue) &&
            mathOperator

        if (concatenation) {
            return new StringValue(left.getAsString() + right.getAsString())
        } else if (mathOperation) {
            switch (expression.operator) {
                case "+":
                    return left.addNumber(right)
                case "-":
                    return left.subtractNumber(right)
                case "*":
                    return left.multiplyNumber(right)
                case "/":
                    return left.divideNumber(right)
            }
        } else {
            return new NahValue()
        }
    }

    // Helpers
    error(message: string) {
        const token = this.peek()
        let lineStart = token.codePosition
        let lineEnd = token.codePosition
        while (global.code[lineStart] !== "\n" && lineStart > 0) {
            lineStart--
        }
        while (global.code[lineEnd] !== "\n" && lineEnd < global.code.length) {
            lineEnd++
        }

        console.log("❌ Parser error")
        console.log("❌ " + global.code.substring(lineStart, lineEnd).trim())
        console.log("❌ " + " ".repeat(token.codePosition - lineStart - 1) + "^")
        console.log("❌ " + message)

        process.exit(1)
    }

    consume(type: TokenType, expectedValue: string, message: string) {
        if (!this.isAtEnd() && this.check(type) && this.peek().getAsString() === expectedValue) {
            return this.advance()
        }
        throw this.error(message)
    }

    match(type: TokenType) {
        if (this.check(type)) {
            this.advance()
            return true
        }
        return false
    }

    fullMatch(type: TokenType, value: string) {
        if (this.fullCheck(type, value)) {
            this.advance()
            return true
        }
        return false
    }

    check(type: TokenType) {
        if (this.isAtEnd()) return false
        return this.peek().type === type
    }

    fullCheck(type: TokenType, value: string) {
        if (this.isAtEnd()) return false
        const token = this.peek()
        return token.type === type && token.getAsString() === value
    }

    advance() {
        if (!this.isAtEnd()) this.position++
        return this.previous()
    }

    peek() {
        return this.tokens[this.position]
    }

    previous() {
        return this.tokens[this.position - 1]
    }

    isAtEnd() {
        return this.peek().type === "eof"
    }
}

export default Parser
