declare global {
    var code: string
}

import type { BooleanValue, ComplexNumberValue, InfinityValue, NumberValue, StringValue, Value } from "./values"

export type Variable = { builtin: boolean; value: Value }

export type ExpressionOperator = "+" | "-" | "*" | "/"
export type Operator = "=" | "(" | ")" | "{" | "}" | "|" | "," | ExpressionOperator

export type ValuableTokenType = "number" | "string" | "boolean"
export type TokenType = ValuableTokenType | "operator" | "keyword" | "identifier" | "eof"
export type ValueType = "number" | "complexNumber" | "infinity" | "string" | "boolean" | "function" | "nativeFunction"

export type Numberish = NumberValue | ComplexNumberValue | InfinityValue

export type BinaryExpression = { type: "binary"; left: Expression; right: Expression; operator: ExpressionOperator }

export type Expression = BinaryExpression | { type: ValueType; value: Value }
