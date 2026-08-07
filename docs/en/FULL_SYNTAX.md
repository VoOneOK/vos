# Full syntax for VOS

## Comments

```vos
// This is a comment
x = 5 // This is a comment too
```

After `//` lexer stops parsing until next line.

## Variables and simple data types

```vos
// numbers
a = 5
b = 2.5
c = 0.1231234 // results c being 0.123123. 6 digits is max precision
d = 3i // imaginary unit
e = 1i // e = i won't work
f = 0-5 // -5 won't work, I am really sorry 😭

// string
g = "Hello y'all!"
h = 'single quotes'

// booleans
i = true
j = false
```

Type any identifier, `=` and value, and you good to go.

## Expressions and obtainable data types

```vos
add = 5 + 6
addMore = add + 7
subtract = 5 - 4
curvedGuys = 3 - (5 - 4)
multiplication = 5 * 6i // 30i
division = 5 / 2

ohNo = 15 + 5i // 5(3+1i)
OH_GOD = (5 + 5i) * (5 + 6i)

concat = "yo" + "gurt" // "yogurt"
// if at least one term is string, then they will concat
numings = "number " + 4

huh = print() // Nah (undefined was too boring)
```

Computes fine (i hope)

## Function

```vos
// create one
fun myCoolFunction(param, param2) {
    return param + param2
}

// call it
myCoolFunction(1, 5) // 6

// recursion is possible (has limits)
fun rec(x) {
    return rec(x + 1)
}

fun nothingInteresting() {}

nothingInteresting() // Returns Nah
```

## Native Function

```vos
print("Yeah")

// Math
Math@sigma(5) // "🥭🥭🥭🥭🥭"

Math@backToReality(25) // 25
Math@backToReality(25i) // 25

Math@root(-25) // 5i
Math@root(5i) // Nah

// Results may vary
Math@PI() // 3.141592
Math@E() // 3.718281
```
