declare global {
    var code: string
}

import type { ComplexNumberValue, InfinityValue, NumberValue, Value } from "./values"

export type Variable = { builtin: boolean; value: Value }

export type UnaryOperator = "!"
export type ExpressionOperator = "+" | "-" | "*" | "/" | "and" | "nand" | "or" | "xor" | "nor"
export type Operator = "=" | "(" | ")" | "{" | "}" | "|" | "," | UnaryOperator | ExpressionOperator

export type ValuableTokenType = "number" | "string" | "boolean"
export type TokenType = ValuableTokenType | "operator" | "keyword" | "identifier" | "eof"
export type ValueType = "number" | "complexNumber" | "infinity" | "string" | "boolean" | "function" | "nativeFunction"

export type Numberish = NumberValue | ComplexNumberValue | InfinityValue

export type UnaryExpression = { type: "unary"; value: Expression; operator: UnaryOperator }
export type BinaryExpression = { type: "binary"; left: Expression; right: Expression; operator: ExpressionOperator }

export type Expression = UnaryExpression | BinaryExpression | { type: ValueType; value: Value }
