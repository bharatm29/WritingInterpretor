const PROMPT = "\nEnter something :)";
console.log(PROMPT);

import readline from "readline";
import { Lexer } from "./lexer/lexer";
import { Parser } from "./ast/Parser";
import { evalAST } from "./eval/eval";

const rs = readline.createInterface({
    input: process.stdin,
});

rs.on("line", (input) => {
    if(input === "clear"){
        console.clear();
        console.log(PROMPT);
        return;
    }

    const lex = new Lexer(input);

    const parser = new Parser(lex);
    const program = parser.parseProgram();

    if(parser.errors.length !== 0){
        parser.errors.forEach(e => {
            console.log(e);
        });
    }

    const evaluated = evalAST(program);

    if(!evaluated){
        console.error("[ERROR]: Evaluated returns null")
    }
    else {
        console.log(evaluated.inspect());
    }

    console.log(PROMPT);
});

rs.on("close", () => {
    console.log("Thanks lol :)");
});
