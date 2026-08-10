# Feel free to contribute to VOS

Big thanks for consideration of it! 🥰

## How

Same flow as in any project:

- Fork
- Create a new branch
- Make changes
- Commit and push
- Open a pull request

## Files

### Code (/src)

- [main.ts](../../src/main.ts) - Main file: read input, pass to lexer, then parser
- [lexer.ts](../../src/lexer.ts) - Lexer: turn .vos file into tokens
- [parser.ts](../../src/parser.ts) - Parser: convert tokens patterns into js instructions
- [tokens.ts](../../src/tokens.ts) - All token classes
- [values.ts](../../src/values.ts) - All values classes
- [builtIns.ts](../../src/builtIns.ts) - built-in variables and functions
- [types.ts](../../src/types.ts) - Types to use around
- [utils](../../src/utils) - Utils
- [tests](../../src/tests) - Tests (would love if someone made more of those)

### Docs (/docs)

Subdirectories here are languages

## Code requirements

I would prefer you using typescript full of "ts-ignore" and "as" rather than javascript (Otherwise IDEs refuse to help me).

Also, make sure language works on Node.js.

I would like to keep project dependencyless.

## What to add?

Whatever you want to see in VOS! If you wish to added chemical elements, add them! If your code at least works, I'll accept it!

Keep project weird and funny. It doesn't have to serious!
