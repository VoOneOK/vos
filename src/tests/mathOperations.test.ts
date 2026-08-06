import { ComplexNumberValue, NumberValue } from "../values"

type Num = NumberValue | ComplexNumberValue

type MathOperationTest = {
    input: {
        f: Num
        s: NumberValue
    }
    output: string
}

type MathOperationResult = {
    "Expected output": string
    Output: string
    Result: string
}

const addTests: MathOperationTest[] = [
    {
        input: {
            f: new NumberValue(5, false),
            s: new NumberValue(5, false),
        },
        output: "10",
    },
    {
        input: {
            f: new NumberValue(3, false),
            s: new NumberValue(5, false),
        },
        output: "8",
    },
    {
        input: {
            f: new NumberValue(3, true),
            s: new NumberValue(5, true),
        },
        output: "8i",
    },
    {
        input: {
            f: new NumberValue(3, true),
            s: new NumberValue(5, false),
        },
        output: "(5+3i)",
    },
    {
        input: {
            f: new NumberValue(3, false),
            s: new NumberValue(2, true),
        },
        output: "(3+2i)",
    },
    {
        input: {
            f: new NumberValue(6, false),
            s: new NumberValue(18, true),
        },
        output: "6(1+3i)",
    },
    {
        input: {
            f: new NumberValue(-50, false),
            s: new NumberValue(-60, true),
        },
        output: "-10(5+6i)",
    },
]

const subtractTests: MathOperationTest[] = [
    {
        input: {
            f: new NumberValue(10, false),
            s: new NumberValue(3, false),
        },
        output: "7",
    },
    {
        input: {
            f: new NumberValue(8, true),
            s: new NumberValue(3, true),
        },
        output: "5i",
    },
    {
        input: {
            f: new NumberValue(5, true),
            s: new NumberValue(2, false),
        },
        output: "(-2+5i)",
    },
    {
        input: {
            f: new NumberValue(3, false),
            s: new NumberValue(2, true),
        },
        output: "(3-2i)",
    },
    {
        input: {
            f: new NumberValue(6, false),
            s: new NumberValue(18, true),
        },
        output: "6(1-3i)",
    },
]

const multiplyTests: MathOperationTest[] = [
    {
        input: {
            f: new NumberValue(5, false),
            s: new NumberValue(5, false),
        },
        output: "25",
    },
    {
        input: {
            f: new NumberValue(3, false),
            s: new NumberValue(7, false),
        },
        output: "21",
    },
    {
        input: {
            f: new NumberValue(-4, false),
            s: new NumberValue(6, false),
        },
        output: "-24",
    },
    {
        input: {
            f: new NumberValue(5, false),
            s: new NumberValue(3, true),
        },
        output: "15i",
    },
    {
        input: {
            f: new NumberValue(4, false),
            s: new NumberValue(2, true),
        },
        output: "8i",
    },
    {
        input: {
            f: new NumberValue(-2, false),
            s: new NumberValue(5, true),
        },
        output: "-10i",
    },
    {
        input: {
            f: new NumberValue(3, true),
            s: new NumberValue(5, true),
        },
        output: "-15",
    },
    {
        input: {
            f: new NumberValue(4, true),
            s: new NumberValue(2, true),
        },
        output: "-8",
    },
    {
        input: {
            f: new NumberValue(-3, true),
            s: new NumberValue(4, true),
        },
        output: "12",
    },
]

const divideTests: MathOperationTest[] = [
    // ==========================================
    // 1. x / y (реальное / реальное)
    // ==========================================
    {
        input: {
            f: new NumberValue(10, false),
            s: new NumberValue(5, false),
        },
        output: "2",
    },
    {
        input: {
            f: new NumberValue(25, false),
            s: new NumberValue(5, false),
        },
        output: "5",
    },
    {
        input: {
            f: new NumberValue(7, false),
            s: new NumberValue(2, false),
        },
        output: "3.5",
    },
    {
        input: {
            f: new NumberValue(-15, false),
            s: new NumberValue(3, false),
        },
        output: "-5",
    },

    // ==========================================
    // 2. xi / yi (мнимое / мнимое) → сокращается i
    // ==========================================
    {
        input: {
            f: new NumberValue(10, true),
            s: new NumberValue(5, true),
        },
        output: "2",
    },
    {
        input: {
            f: new NumberValue(25, true),
            s: new NumberValue(5, true),
        },
        output: "5",
    },
    {
        input: {
            f: new NumberValue(7, true),
            s: new NumberValue(2, true),
        },
        output: "3.5",
    },
    {
        input: {
            f: new NumberValue(-15, true),
            s: new NumberValue(3, true),
        },
        output: "-5",
    },

    // ==========================================
    // 3. xi / y (мнимое / реальное) → (x/y)i
    // ==========================================
    {
        input: {
            f: new NumberValue(10, true),
            s: new NumberValue(5, false),
        },
        output: "2i",
    },
    {
        input: {
            f: new NumberValue(25, true),
            s: new NumberValue(5, false),
        },
        output: "5i",
    },
    {
        input: {
            f: new NumberValue(7, true),
            s: new NumberValue(2, false),
        },
        output: "3.5i",
    },
    {
        input: {
            f: new NumberValue(-15, true),
            s: new NumberValue(3, false),
        },
        output: "-5i",
    },

    // ==========================================
    // 4. x / yi (реальное / мнимое) → -(x/y)i
    // ==========================================
    {
        input: {
            f: new NumberValue(10, false),
            s: new NumberValue(5, true),
        },
        output: "-2i",
    },
    {
        input: {
            f: new NumberValue(25, false),
            s: new NumberValue(5, true),
        },
        output: "-5i",
    },
    {
        input: {
            f: new NumberValue(7, false),
            s: new NumberValue(2, true),
        },
        output: "-3.5i",
    },
    {
        input: {
            f: new NumberValue(-15, false),
            s: new NumberValue(3, true),
        },
        output: "5i", // -(-15/3) = 5i
    },

    // ==========================================
    // 5. Деление на ноль (если есть защита)
    // ==========================================
    // {
    //     input: {
    //         f: new NumberValue(5, false),
    //         s: new NumberValue(0, false),
    //     },
    //     output: "Error: Division by zero",
    // },
    // {
    //     input: {
    //         f: new NumberValue(5, true),
    //         s: new NumberValue(0, false),
    //     },
    //     output: "Error: Division by zero",
    // },
]

function runTests(tests: MathOperationTest[], getResult: (f: Num, s: NumberValue) => string) {
    const results: MathOperationResult[] = []

    for (const test of tests) {
        const value = getResult(test.input.f, test.input.s)
        results.push({
            "Expected output": test.output,
            Output: value,
            Result: JSON.stringify(value) === JSON.stringify(test.output) ? "✅" : "❌",
        })
    }

    console.table(results)
}

console.log("ADD")
runTests(addTests, (f: Num, s: NumberValue): string => {
    return f.addNumber(s).getAsString()
})

console.log("SUBTRACT")
runTests(subtractTests, (f: Num, s: NumberValue): string => {
    return f.subtractNumber(s).getAsString()
})

console.log("MULTIPLY")
runTests(multiplyTests, (f: Num, s: NumberValue): string => {
    return f.multiplyNumber(s).getAsString()
})

console.log("DIVIDE")
runTests(divideTests, (f: Num, s: NumberValue): string => {
    return f.divideNumber(s).getAsString()
})
