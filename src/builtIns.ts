/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import os from "os"
import { Value, NativeFunctionValue, StringValue, NahValue, NumberValue, ComplexNumberValue } from "./values.ts"

const builtIns = new Map<string, Value>()
const MANGO = "🥭"
const MANGO_LIMIT = 25

builtIns.set(
    "print",
    new NativeFunctionValue((value: Value) => {
        if (value) value.print()
        return new NahValue()
    }),
)
builtIns.set(
    "Math@sigma",
    new NativeFunctionValue((amount: Value) => {
        if (
            amount instanceof NumberValue &&
            !amount.imaginaryUnit &&
            amount.normalPart <= MANGO_LIMIT &&
            amount.normalPart > 0
        )
            return new StringValue(MANGO.repeat(amount.normalPart))
        return new NahValue()
    }),
)

builtIns.set(
    "Math@PI",
    new NativeFunctionValue(() => {
        return new NumberValue(+("3.1" + (Date.now() + "").slice(-5)))
    }),
)

builtIns.set(
    "Math@E",
    new NativeFunctionValue(() => {
        return new NumberValue(+("2.7" + (Math.floor(os.uptime()) + "").slice(-5)))
    }),
)

builtIns.set(
    "Math@backToReality",
    new NativeFunctionValue((value: Value) => {
        if (value instanceof NumberValue) {
            return new NumberValue(value.normalPart, false)
        } else if (value instanceof ComplexNumberValue) {
            return new NumberValue(value.real + value.imag, false)
        }
        return new NahValue()
    }),
)

builtIns.set(
    "Math@root",
    new NativeFunctionValue((value: Value) => {
        if (!(value instanceof NumberValue)) return new NahValue()
        if (value.imaginaryUnit) return new NahValue()

        return new NumberValue(Math.sqrt(Math.abs(value.normalPart)), value.normalPart < 0)
    }),
)

// builtIns.set(
//     "fetch",
//     new NativeFunctionValue(async (url: string) => {
//         const response = await fetch(url)
//     }),
// )

export default builtIns
