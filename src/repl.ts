import readline from "readline";
import { Lexer } from "./lexer/lexer";
import { Parser } from "./ast/Parser";
import { evalAST } from "./eval/eval";
import { newEnvironment } from "./eval/interpretObject";

console.clear();
console.log("\nlang v" + (0.1 + 0.2) + "\n\n");

const PROMPT = ">> ";
process.stdout.write(PROMPT);

const env = newEnvironment(); //we need a singleton env for one repl session

const rs = readline.createInterface({
    input: process.stdin,
});

rs.on("line", (input) => {
    if (input === "clear") {
        console.clear();
        process.stdout.write(PROMPT);
        return;
    }

    const lex = new Lexer(input);

    const parser = new Parser(lex);
    const program = parser.parseProgram();

    if (parser.errors.length !== 0) {
        parser.errors.forEach(e => {
            process.stdout.write("[ERROR]: " + e + "\n");
        });

        process.stdout.write(PROMPT);
        return;
    }

    const evaluated = evalAST(program, env);

    process.stdout.write(evaluated.inspect() + "\n");

    process.stdout.write(PROMPT);
});

rs.on("close", () => {
    process.stdout.write("Thanks lol :)");
});
