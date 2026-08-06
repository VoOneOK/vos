/*
 * This file (main.js) may be freely modified without creating
 * a derivative work or fork under this project's license.
 * All other files remain subject to the standard license terms.
 */

import path from "path"
import fs from "fs"

import Lexer from "./lexer.ts"
import Parser from "./parser.ts"
import builtIns from "./builtIns.ts"

function runScript() {
    let processLogs = false
    if (process.argv[3] === "true") {
        processLogs = true
    }

    try {
        const vosFile = process.argv[2]
        let vosFilePath = vosFile
        if (!path.isAbsolute(vosFilePath)) {
            path.join(import.meta.dirname, vosFile)
        }

        const code = fs.readFileSync(vosFilePath, "utf-8")

        const lexer = new Lexer(code)
        const tokens = lexer.tokenize()

        processPrint("-------------------------------------\n")
        processPrint(tokens)
        processPrint("\n-------------------------------------\n")

        const builtInVariables = new Map()
        for (const [key, value] of builtIns) {
            builtInVariables.set(key, {
                builtin: true,
                value,
            })
        }

        const parser = new Parser(tokens, true, builtInVariables)

        const exitValue = parser.parse()

        process.stdout.write("Program exited with ")
        exitValue.print()

        function processPrint(log: any) {
            if (!processLogs) return
            console.log(log)
        }
    } catch (error) {
        if (error instanceof RangeError && error.message === "Maximum call stack size exceeded") {
            console.error("❌ ", "You are limited by technology of your time, use recursions later")
        } else {
            console.error("❌ ", error)
        }

        exit()
    }
}

function exit() {
    // Exist to not start infinite loop accidentally 👍
    console.log("Exit to save your pc")
    process.exit()
}

runScript()
