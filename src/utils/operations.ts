// As much as you want to reuse code here, you maybe should avoid that.
// Otherwise it will get really confusing soon

import type { ExpressionOperator, ValueType } from "../types.ts"
import { ComplexNumberValue, InfinityValue, NumberValue, StringValue } from "../values.ts"

type Operation = Record<ExpressionOperator, Partial<Record<ValueType, Partial<Record<ValueType, Function>>>>>
export const operations: Operation = {
    "+": {
        number: {
            number: addNumbers,
            complexNumber: addNumberAndComplex,
            infinity: addNumberAndInfinity,
        },
        complexNumber: {
            number: (a: ComplexNumberValue, b: NumberValue) => addNumberAndComplex(b, a),
            complexNumber: addComplexes,
            infinity: addComplexAndInfinity,
        },
        infinity: {
            number: (a: InfinityValue, b: NumberValue) => addNumberAndInfinity(b, a),
            complexNumber: (a: InfinityValue, b: ComplexNumberValue) => addComplexAndInfinity(b, a),
            infinity: addInfinities,
        },
    },
    "-": {
        number: {
            number: subNumbers,
            complexNumber: subNumberAndComplex,
            infinity: subNumberAndInfinity,
        },
        complexNumber: {
            number: subComplexAndNumber,
            complexNumber: subComplexes,
            infinity: subNumberAndInfinity, // intended
        },
        infinity: {
            number: subInfinityAndNumber,
            complexNumber: subInfinityAndComplex,
            infinity: subInfinities,
        },
    },
    "*": {
        number: {
            number: mulNumbers,
            complexNumber: mulNumberAndComplex,
            infinity: mulNumberAndInfinity,
        },
        complexNumber: {
            number: (a: ComplexNumberValue, b: NumberValue) => mulNumberAndComplex(b, a),
            complexNumber: mulComplexes,
            infinity: mulComplexAndInfinity,
        },
        infinity: {
            number: (a: InfinityValue, b: NumberValue) => mulNumberAndInfinity(b, a),
            complexNumber: (a: InfinityValue, b: ComplexNumberValue) => mulComplexAndInfinity(b, a),
            infinity: mulInfinities,
        },
    },
    "/": {
        number: {
            number: divNumbers,
            complexNumber: divNumberAndComplex,
            infinity: divNumberAndInfinity,
        },
        complexNumber: {
            number: divComplexAndNumber,
            complexNumber: divComplexes,
            infinity: divComplexAndInfinity,
        },
        infinity: {
            number: divInfinityAndNumber,
            complexNumber: divInfinityAndComplex,
            infinity: divInfinities,
        },
    },
}

function returnComplex(newReal: number, newImag: number) {
    if (newImag === 0) return new NumberValue(newReal, false)
    if (newReal === 0) return new NumberValue(newImag, true)
    return new ComplexNumberValue(newReal, newImag)
}

function addNumbers(a: NumberValue, b: NumberValue) {
    if (a.imaginaryUnit !== b.imaginaryUnit) {
        return new ComplexNumberValue(
            a.imaginaryUnit ? b.normalPart : a.normalPart,
            a.imaginaryUnit ? a.normalPart : b.normalPart,
        )
    }

    return new NumberValue(a.normalPart + b.normalPart, a.imaginaryUnit)
}

function addNumberAndComplex(a: NumberValue, b: ComplexNumberValue) {
    const newReal = a.imaginaryUnit ? b.real : b.real + a.normalPart
    const newImag = a.imaginaryUnit ? b.imag + a.normalPart : b.imag

    return returnComplex(newReal, newImag)
}

function addComplexes(a: ComplexNumberValue, b: ComplexNumberValue) {
    const newReal = a.real + b.real
    const newImag = a.imag + b.imag

    return returnComplex(newReal, newImag)
}

function addNumberAndInfinity(a: NumberValue, b: InfinityValue) {
    let increase = a.normalPart >= 0
    if (!b.positive) increase = !increase

    return increase
        ? //@ts-expect-error
          new InfinityValue(Math.min(3, b.grade + 1), b.positive)
        : //@ts-expect-error
          new InfinityValue(Math.max(1, b.grade - 1), b.positive)
}

function addComplexAndInfinity(a: ComplexNumberValue, b: InfinityValue) {
    let increase = true

    if (a.real + a.imag < 0) increase = false
    if (!b.positive) increase = !increase

    return increase
        ? //@ts-expect-error
          new InfinityValue(Math.min(3, b.grade + 1), b.positive)
        : //@ts-expect-error
          new InfinityValue(Math.max(1, b.grade - 1), b.positive)
}

function addInfinities(a: InfinityValue, b: InfinityValue) {
    const aMathGrade = a.grade * (a.positive ? 1 : -1)
    const bMathGrade = b.grade * (b.positive ? 1 : -1)

    const result = aMathGrade + bMathGrade

    if (result === 0) {
        return new NumberValue(0)
    } else if (result > 0) {
        //@ts-expect-error
        return new InfinityValue(Math.min(3, result), true)
    }

    //@ts-expect-error
    return new InfinityValue(Math.min(3, result), true)
}

function subNumbers(a: NumberValue, b: NumberValue) {
    if (a.imaginaryUnit !== b.imaginaryUnit) {
        return new ComplexNumberValue(
            a.imaginaryUnit ? b.normalPart : a.normalPart,
            a.imaginaryUnit ? a.normalPart : b.normalPart,
        )
    }

    return new NumberValue(a.normalPart - b.normalPart, a.imaginaryUnit)
}

function subNumberAndComplex(a: NumberValue, b: ComplexNumberValue) {
    const newReal = a.imaginaryUnit ? b.real : b.real - a.normalPart
    const newImag = a.imaginaryUnit ? b.imag - a.normalPart : b.imag

    return returnComplex(newReal, newImag)
}

function subNumberAndInfinity(a: NumberValue, b: InfinityValue) {
    new InfinityValue(b.grade, !b.positive)
}

function subComplexAndNumber(a: ComplexNumberValue, b: NumberValue) {
    const newReal = b.imaginaryUnit ? a.real : a.real - b.normalPart
    const newImag = b.imaginaryUnit ? a.imag - b.normalPart : a.imag

    return returnComplex(newReal, newImag)
}

function subComplexes(a: ComplexNumberValue, b: ComplexNumberValue) {
    const newReal = a.real - b.real
    const newImag = a.imag - b.imag

    return returnComplex(newReal, newImag)
}

function subInfinityAndNumber(a: InfinityValue, b: NumberValue) {
    let increase = b.normalPart < 0 === a.positive

    return increase
        ? //@ts-expect-error
          new InfinityValue(Math.min(3, a.grade + 1), a.positive)
        : //@ts-expect-error
          new InfinityValue(Math.max(1, a.grade - 1), a.positive)
}

function subInfinityAndComplex(a: InfinityValue, b: ComplexNumberValue) {
    let increase = b.real + b.imag < 0 === a.positive

    return increase
        ? //@ts-expect-error
          new InfinityValue(Math.min(3, a.grade + 1), a.positive)
        : //@ts-expect-error
          new InfinityValue(Math.max(1, a.grade - 1), a.positive)
}

function subInfinities(a: InfinityValue, b: InfinityValue) {
    const aMathGrade = a.grade * (a.positive ? 1 : -1)
    const bMathGrade = b.grade * (b.positive ? 1 : -1)

    const result = aMathGrade - bMathGrade

    if (result === 0) {
        return new NumberValue(0)
    } else if (result > 0) {
        //@ts-expect-error
        return new InfinityValue(Math.min(3, result), true)
    }

    //@ts-expect-error
    return new InfinityValue(Math.min(3, result), true)
}

function mulNumbers(a: NumberValue, b: NumberValue) {
    return new NumberValue(a.normalPart * b.normalPart * (a.imaginaryUnit && b.imaginaryUnit ? -1 : 1), a !== b)
}

function mulNumberAndComplex(x: NumberValue, y: ComplexNumberValue) {
    // Math break
    // (a + bi) * (c + di) = ac + adi + bci - bd
    // real = ac - bd; imag = adi + bci

    const a = x.imaginaryUnit ? 0 : x.normalPart
    const b = x.imaginaryUnit ? x.normalPart : 0

    const newReal = a * y.real - b * y.imag
    const newImag = a * y.imag + b * y.real

    return returnComplex(newReal, newImag)
}

function mulPlainNumberAndInfinity(a: number, b: InfinityValue) {
    if (a === 1) {
        return new InfinityValue(b.grade, b.positive)
    } else if (a === -1) {
        return new InfinityValue(b.grade, !b.positive)
    } else if (a === 0) {
        return new NumberValue(0)
    } else if (a > 0 && a < 1) {
        // @ts-expect-error
        return new InfinityValue(Math.max(1, b.grade - 1), b.positive)
    } else if (a < 0 && a > -1) {
        // @ts-expect-error
        return new InfinityValue(Math.max(1, b.grade - 1), !b.positive)
    } else if (a > 1) {
        // @ts-expect-error
        return new InfinityValue(Math.max(1, b.grade + 1), b.positive)
    }
    // @ts-expect-error
    return new InfinityValue(Math.max(1, b.grade + 1), !b.positive)
}

function mulNumberAndInfinity(a: NumberValue, b: InfinityValue) {
    return mulPlainNumberAndInfinity(a.normalPart, b)
}

function mulComplexAndInfinity(a: ComplexNumberValue, b: InfinityValue) {
    return mulPlainNumberAndInfinity(a.real + a.imag, b)
}

function mulComplexes(a: ComplexNumberValue, b: ComplexNumberValue) {
    const newReal = a.real * b.real - a.imag * b.imag
    const newImag = a.real * b.imag + a.imag * b.real

    return returnComplex(newReal, newImag)
}

function mulInfinities(a: InfinityValue, b: InfinityValue) {
    const newGrade = Math.min(3, Math.max(a.grade, b.grade) + 1)

    // @ts-expect-error
    return new InfinityValue(newGrade, a.positive === b.positive)
}

function divNumbers(a: NumberValue, b: NumberValue) {
    if (b.normalPart === 0) {
        return new InfinityValue(1, a.normalPart > 0)
    } else if (a.imaginaryUnit === b.imaginaryUnit) {
        return new NumberValue(a.normalPart / b.normalPart, false)
    } else if (a.imaginaryUnit) {
        return new NumberValue(a.normalPart / b.normalPart, true)
    }
    return new NumberValue(-1 * (a.normalPart / b.normalPart), true)
}

function divNumberAndComplex(a: NumberValue, b: ComplexNumberValue) {
    const x = a.imaginaryUnit ? 0 : a.normalPart
    const y = a.imaginaryUnit ? a.normalPart : 0

    const newReal = (x * b.real + y * b.imag) / (b.real * b.real + b.imag * b.imag)
    const newImag = (y * b.real - x * b.imag) / (b.real * b.real + b.imag * b.imag)

    return returnComplex(newReal, newImag)
}

function divPlainNumberAndInfinity(a: number, b: InfinityValue) {
    if (a === 0) return new NumberValue(0)
    return new InfinityValue(b.grade, a > 0 === b.positive)
}

function divNumberAndInfinity(a: NumberValue, b: InfinityValue) {
    return divPlainNumberAndInfinity(a.normalPart, b)
}

function divComplexAndNumber(a: ComplexNumberValue, b: NumberValue) {
    const bReal = b.imaginaryUnit ? 0 : b.normalPart
    const bImag = b.imaginaryUnit ? b.normalPart : 0

    if (bReal === 0 && bImag === 0) return new InfinityValue(1, bReal + bImag > 0)

    const newReal = (a.real * bReal + a.imag * bImag) / (bReal * bReal + bImag * bImag)
    const newImag = (a.imag * bReal - a.real * bImag) / (bReal * bReal + bImag * bImag)

    return returnComplex(newReal, newImag)
}

function divComplexes(a: ComplexNumberValue, b: ComplexNumberValue) {
    const newReal = (a.real * b.real + a.imag * b.imag) / (b.real * b.real + b.imag * b.imag)
    const newImag = (a.imag * b.real - a.real * b.imag) / (b.real * b.real + b.imag * b.imag)

    return returnComplex(newReal, newImag)
}

function divComplexAndInfinity(a: ComplexNumberValue, b: InfinityValue) {
    return divPlainNumberAndInfinity(a.real + a.imag, b)
}

function divInfinityAndPlainNumber(a: InfinityValue, b: number) {
    if (b > 0 && b < 1) {
        // @ts-expect-error
        return new InfinityValue(Math.min(3, a.grade + 1), a.positive)
    } else if (b < 0 && b > -1) {
        // @ts-expect-error
        return new InfinityValue(Math.min(3, a.grade + 1), !a.positive)
    } else if (b > 1) {
        // @ts-expect-error
        return new InfinityValue(Math.max(1, a.grade - 1), a.positive)
    } else if (b < -1) {
        // @ts-expect-error
        return new InfinityValue(Math.max(1, a.grade - 1), !a.positive)
    }
    // inf / 0 = kaboom
    return new StringValue("💥")
}

function divInfinityAndNumber(a: InfinityValue, b: NumberValue) {
    return divInfinityAndPlainNumber(a, b.normalPart)
}

function divInfinityAndComplex(a: InfinityValue, b: ComplexNumberValue) {
    return divInfinityAndPlainNumber(a, b.real + b.imag)
}

function divInfinities(a: InfinityValue, b: InfinityValue) {
    const gradeDifference = a.grade - b.grade
    const m = a.positive !== b.positive ? -1 : 1

    if (gradeDifference === 0) {
        return new NumberValue(m)
    } else if (gradeDifference === -1) {
        return new NumberValue(0.5 * m)
    } else if (gradeDifference === -2) {
        return new NumberValue(0.25 * m)
    }

    return new NumberValue(Math.pow(gradeDifference, 2) * m)
}
