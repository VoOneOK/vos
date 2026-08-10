// gcd - Greatest Common Devisor
export function getGcd(a: number, b: number) {
    const isNegative = a < 0 && b < 0
    while (b !== 0) {
        let temp = b
        b = a % temp
        a = temp
    }
    const absNod = Math.abs(a)
    return isNegative ? absNod * -1 : absNod
}

export function roundTo(numberToRound: number, precision: number = 12): number {
    return Math.round(numberToRound * 10 ** precision) / 10 ** precision
}
