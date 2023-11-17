const PROMPT = "\nEnter something :)";
console.log(PROMPT);

import readline from "readline";
import { Lexer } from "./lexer/lexer";
import { TokenType } from "./lexer/token";

const rs = readline.createInterface({
    input: process.stdin,
});

rs.on("line", (input) => {
    const lex = new Lexer(input);

    while (true) {
        const token = lex.nextToken()
        console.log(token);
        if (token.tokenType === TokenType.EOF) {
            break;
        }
    }

    console.log(PROMPT);
});

rs.on("close", () => {
    console.log("Thanks lol :)");
});
