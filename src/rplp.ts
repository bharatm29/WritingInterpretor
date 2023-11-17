const PROMPT = "\nEnter something :)";
console.log(PROMPT);

import readline from "readline";
import { Lexer } from "./lexer/lexer";
import { Parser } from "./ast/Parser";

const rs = readline.createInterface({
    input: process.stdin,
});
rs.on("line", (input) => {
    const lex = new Lexer(input);

    const parser = new Parser(lex);
    const program = parser.parseProgram();

    if(parser.errors.length !== 0){
        parser.errors.forEach(e => {
            console.log(e);
        });
    }

    console.log(program.string());

    console.log(PROMPT);
});

rs.on("close", () => {
    console.log("Thanks lol :)");
});
