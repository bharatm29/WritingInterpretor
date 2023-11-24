import { Lexer } from "../lexer/lexer";
import { Token, TokenType } from "../lexer/token";

import { test, expect } from "vitest"

test("testing Lexer's nextToken(): 1", () => {
    const input: string = "=+(){},;";

    const expected_results: Token[] = [
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.PLUS, literal: "+" },
        { tokenType: TokenType.LPAREN, literal: "(" },
        { tokenType: TokenType.RPAREN, literal: ")" },
        { tokenType: TokenType.LBRACE, literal: "{" },
        { tokenType: TokenType.RBRACE, literal: "}" },
        { tokenType: TokenType.COMMA, literal: "," },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.EOF, literal: "" },
    ];

    const lexer: Lexer = new Lexer(input);

    expected_results.forEach(res => {
        const actual_res = lexer.nextToken();
        expect(res.tokenType).toEqual(actual_res.tokenType);
        expect(res.literal).toEqual(actual_res.literal);
    });
})

test("testing Lexer's nextToken(): 2", () => {
    const input: string = `
        let five = 5;
        let ten = 10;
        let add = fn(x, y) {
            x + y;
        };
        let result = add(five, ten);
    `;

    const expected_results: Token[] = [
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "five" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.INT, literal: "5" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "ten" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "add" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.FUNCTION, literal: "fn" },
        { tokenType: TokenType.LPAREN, literal: "(" },
        { tokenType: TokenType.IDENT, literal: "x" },
        { tokenType: TokenType.COMMA, literal: "," },
        { tokenType: TokenType.IDENT, literal: "y" },
        { tokenType: TokenType.RPAREN, literal: ")" },
        { tokenType: TokenType.LBRACE, literal: "{" },
        { tokenType: TokenType.IDENT, literal: "x" },
        { tokenType: TokenType.PLUS, literal: "+" },
        { tokenType: TokenType.IDENT, literal: "y" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.RBRACE, literal: "}" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "result" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.IDENT, literal: "add" },
        { tokenType: TokenType.LPAREN, literal: "(" },
        { tokenType: TokenType.IDENT, literal: "five" },
        { tokenType: TokenType.COMMA, literal: "," },
        { tokenType: TokenType.IDENT, literal: "ten" },
        { tokenType: TokenType.RPAREN, literal: ")" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.EOF, literal: "" },
    ];

    const lexer: Lexer = new Lexer(input);

    expected_results.forEach(res => {
        const actual_res = lexer.nextToken();

        expect(res.tokenType).toEqual(actual_res.tokenType);
        expect(res.literal).toEqual(actual_res.literal);
    });
})

test("testing Lexer's nextToken(): 3", () => {
    const input: string = `
        let five = 5;
        let ten = 10;
        let add = fn(x, y) {
            x + y;
        };
        let result = add(five, ten);
        !-/*5;
        5 < 10 > 5;
    `;

    const expected_results: Token[] = [
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "five" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.INT, literal: "5" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "ten" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "add" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.FUNCTION, literal: "fn" },
        { tokenType: TokenType.LPAREN, literal: "(" },
        { tokenType: TokenType.IDENT, literal: "x" },
        { tokenType: TokenType.COMMA, literal: "," },
        { tokenType: TokenType.IDENT, literal: "y" },
        { tokenType: TokenType.RPAREN, literal: ")" },
        { tokenType: TokenType.LBRACE, literal: "{" },
        { tokenType: TokenType.IDENT, literal: "x" },
        { tokenType: TokenType.PLUS, literal: "+" },
        { tokenType: TokenType.IDENT, literal: "y" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.RBRACE, literal: "}" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "result" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.IDENT, literal: "add" },
        { tokenType: TokenType.LPAREN, literal: "(" },
        { tokenType: TokenType.IDENT, literal: "five" },
        { tokenType: TokenType.COMMA, literal: "," },
        { tokenType: TokenType.IDENT, literal: "ten" },
        { tokenType: TokenType.RPAREN, literal: ")" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },

        { tokenType: TokenType.BANG, literal: "!" },
        { tokenType: TokenType.MINUS, literal: "-" },
        { tokenType: TokenType.SLASH, literal: "/" },
        { tokenType: TokenType.ASTERISK, literal: "*" },
        { tokenType: TokenType.INT, literal: "5"  },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.INT, literal: "5"  },
        { tokenType: TokenType.LT, literal: "<" },
        { tokenType: TokenType.INT, literal: "10"  },
        { tokenType: TokenType.GT, literal: ">" },
        { tokenType: TokenType.INT, literal: "5"  },
        { tokenType: TokenType.SEMICOLON, literal: ";" },

        { tokenType: TokenType.EOF, literal: "" },
    ];

    const lexer: Lexer = new Lexer(input);

    expected_results.forEach(res => {
        const actual_res = lexer.nextToken();

        expect(res.tokenType).toEqual(actual_res.tokenType);
        expect(res.literal).toEqual(actual_res.literal);
    });
})

test("testing Lexer's nextToken(): 4", () => {
    const input: string = `
        let five = 5;
        let ten = 10;
        let add = fn(x, y) {
            x + y;
        };
        let result = add(five, ten);
        !-/*5;
        5 < 10 > 5;
        if (5 < 10) {
            return true;
        } else {
            return false;
        }
    `
    const expected_results: Token[] = [
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "five" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.INT, literal: "5" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "ten" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "add" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.FUNCTION, literal: "fn" },
        { tokenType: TokenType.LPAREN, literal: "(" },
        { tokenType: TokenType.IDENT, literal: "x" },
        { tokenType: TokenType.COMMA, literal: "," },
        { tokenType: TokenType.IDENT, literal: "y" },
        { tokenType: TokenType.RPAREN, literal: ")" },
        { tokenType: TokenType.LBRACE, literal: "{" },
        { tokenType: TokenType.IDENT, literal: "x" },
        { tokenType: TokenType.PLUS, literal: "+" },
        { tokenType: TokenType.IDENT, literal: "y" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.RBRACE, literal: "}" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "result" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.IDENT, literal: "add" },
        { tokenType: TokenType.LPAREN, literal: "(" },
        { tokenType: TokenType.IDENT, literal: "five" },
        { tokenType: TokenType.COMMA, literal: "," },
        { tokenType: TokenType.IDENT, literal: "ten" },
        { tokenType: TokenType.RPAREN, literal: ")" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },

        { tokenType: TokenType.BANG, literal: "!" },
        { tokenType: TokenType.MINUS, literal: "-" },
        { tokenType: TokenType.SLASH, literal: "/" },
        { tokenType: TokenType.ASTERISK, literal: "*" },
        { tokenType: TokenType.INT, literal: "5"  },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.INT, literal: "5"  },
        { tokenType: TokenType.LT, literal: "<" },
        { tokenType: TokenType.INT, literal: "10"  },
        { tokenType: TokenType.GT, literal: ">" },
        { tokenType: TokenType.INT, literal: "5"  },
        { tokenType: TokenType.SEMICOLON, literal: ";" },

        { tokenType: TokenType.IF, literal: "if"},
        { tokenType: TokenType.LPAREN, literal: "("},
        { tokenType: TokenType.INT, literal: "5" },
        { tokenType: TokenType.LT, literal: "<"},
        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.RPAREN, literal: ")"},
        { tokenType: TokenType.LBRACE, literal: "{"},
        { tokenType: TokenType.RETURN, literal: "return"},
        { tokenType: TokenType.TRUE, literal: "true"},
        { tokenType: TokenType.SEMICOLON, literal: ";"},
        { tokenType: TokenType.RBRACE, literal: "}"},
        { tokenType: TokenType.ELSE, literal: "else"},
        { tokenType: TokenType.LBRACE, literal: "{"},
        { tokenType: TokenType.RETURN, literal: "return"},
        { tokenType: TokenType.FALSE, literal: "false"},
        { tokenType: TokenType.SEMICOLON, literal: ";"},
        { tokenType: TokenType.RBRACE, literal: "}"},

        { tokenType: TokenType.EOF, literal: "" },
    ];

    const lexer: Lexer = new Lexer(input);

    expected_results.forEach(res => {
        const actual_res = lexer.nextToken();

        expect(res.tokenType).toEqual(actual_res.tokenType);
        expect(res.literal).toEqual(actual_res.literal);
    });
})


test("testing Lexer's nextToken(): 5", () => {
    const input: string = `
        let five = 5;
        let ten = 10;
        let add = fn(x, y) {
            x + y;
        };
        let result = add(five, ten);
        !-/*5;
        5 < 10 > 5;
        if (5 < 10) {
            return true;
        } else {
            return false;
        }
        10 == 10;
        10 != 9;
    `
    const expected_results: Token[] = [
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "five" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.INT, literal: "5" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "ten" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "add" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.FUNCTION, literal: "fn" },
        { tokenType: TokenType.LPAREN, literal: "(" },
        { tokenType: TokenType.IDENT, literal: "x" },
        { tokenType: TokenType.COMMA, literal: "," },
        { tokenType: TokenType.IDENT, literal: "y" },
        { tokenType: TokenType.RPAREN, literal: ")" },
        { tokenType: TokenType.LBRACE, literal: "{" },
        { tokenType: TokenType.IDENT, literal: "x" },
        { tokenType: TokenType.PLUS, literal: "+" },
        { tokenType: TokenType.IDENT, literal: "y" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.RBRACE, literal: "}" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "result" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.IDENT, literal: "add" },
        { tokenType: TokenType.LPAREN, literal: "(" },
        { tokenType: TokenType.IDENT, literal: "five" },
        { tokenType: TokenType.COMMA, literal: "," },
        { tokenType: TokenType.IDENT, literal: "ten" },
        { tokenType: TokenType.RPAREN, literal: ")" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },

        { tokenType: TokenType.BANG, literal: "!" },
        { tokenType: TokenType.MINUS, literal: "-" },
        { tokenType: TokenType.SLASH, literal: "/" },
        { tokenType: TokenType.ASTERISK, literal: "*" },
        { tokenType: TokenType.INT, literal: "5"  },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.INT, literal: "5"  },
        { tokenType: TokenType.LT, literal: "<" },
        { tokenType: TokenType.INT, literal: "10"  },
        { tokenType: TokenType.GT, literal: ">" },
        { tokenType: TokenType.INT, literal: "5"  },
        { tokenType: TokenType.SEMICOLON, literal: ";" },

        { tokenType: TokenType.IF, literal: "if"},
        { tokenType: TokenType.LPAREN, literal: "("},
        { tokenType: TokenType.INT, literal: "5" },
        { tokenType: TokenType.LT, literal: "<"},
        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.RPAREN, literal: ")"},
        { tokenType: TokenType.LBRACE, literal: "{"},
        { tokenType: TokenType.RETURN, literal: "return"},
        { tokenType: TokenType.TRUE, literal: "true"},
        { tokenType: TokenType.SEMICOLON, literal: ";"},
        { tokenType: TokenType.RBRACE, literal: "}"},
        { tokenType: TokenType.ELSE, literal: "else"},
        { tokenType: TokenType.LBRACE, literal: "{"},
        { tokenType: TokenType.RETURN, literal: "return"},
        { tokenType: TokenType.FALSE, literal: "false"},
        { tokenType: TokenType.SEMICOLON, literal: ";"},
        { tokenType: TokenType.RBRACE, literal: "}"},

        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.EQUAL, literal: "==" },
        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.NOTEQUAL, literal: "!=" },
        { tokenType: TokenType.INT, literal: "9" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },

        { tokenType: TokenType.EOF, literal: "" },
    ];

    const lexer: Lexer = new Lexer(input);

    expected_results.forEach(res => {
        const actual_res = lexer.nextToken();

        expect(res.tokenType).toEqual(actual_res.tokenType);
        expect(res.literal).toEqual(actual_res.literal);
    });
})


test("testing Lexer's nextToken(): 6", () => {
    const input: string = `
        let five = 5;
        let ten = 10;
        let add = fn(x, y) {
            x + y;
        };
        let result = add(five, ten);
        !-/*5;
        5 < 10 > 5;
        if (5 < 10) {
            return true;
        } else {
            return false;
        }
        10 == 10;
        10 != 9;
        "foobar"
        "foo bar"
    `
    const expected_results: Token[] = [
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "five" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.INT, literal: "5" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "ten" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "add" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.FUNCTION, literal: "fn" },
        { tokenType: TokenType.LPAREN, literal: "(" },
        { tokenType: TokenType.IDENT, literal: "x" },
        { tokenType: TokenType.COMMA, literal: "," },
        { tokenType: TokenType.IDENT, literal: "y" },
        { tokenType: TokenType.RPAREN, literal: ")" },
        { tokenType: TokenType.LBRACE, literal: "{" },
        { tokenType: TokenType.IDENT, literal: "x" },
        { tokenType: TokenType.PLUS, literal: "+" },
        { tokenType: TokenType.IDENT, literal: "y" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.RBRACE, literal: "}" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.LET, literal: "let" },
        { tokenType: TokenType.IDENT, literal: "result" },
        { tokenType: TokenType.ASSIGN, literal: "=" },
        { tokenType: TokenType.IDENT, literal: "add" },
        { tokenType: TokenType.LPAREN, literal: "(" },
        { tokenType: TokenType.IDENT, literal: "five" },
        { tokenType: TokenType.COMMA, literal: "," },
        { tokenType: TokenType.IDENT, literal: "ten" },
        { tokenType: TokenType.RPAREN, literal: ")" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },

        { tokenType: TokenType.BANG, literal: "!" },
        { tokenType: TokenType.MINUS, literal: "-" },
        { tokenType: TokenType.SLASH, literal: "/" },
        { tokenType: TokenType.ASTERISK, literal: "*" },
        { tokenType: TokenType.INT, literal: "5"  },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.INT, literal: "5"  },
        { tokenType: TokenType.LT, literal: "<" },
        { tokenType: TokenType.INT, literal: "10"  },
        { tokenType: TokenType.GT, literal: ">" },
        { tokenType: TokenType.INT, literal: "5"  },
        { tokenType: TokenType.SEMICOLON, literal: ";" },

        { tokenType: TokenType.IF, literal: "if"},
        { tokenType: TokenType.LPAREN, literal: "("},
        { tokenType: TokenType.INT, literal: "5" },
        { tokenType: TokenType.LT, literal: "<"},
        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.RPAREN, literal: ")"},
        { tokenType: TokenType.LBRACE, literal: "{"},
        { tokenType: TokenType.RETURN, literal: "return"},
        { tokenType: TokenType.TRUE, literal: "true"},
        { tokenType: TokenType.SEMICOLON, literal: ";"},
        { tokenType: TokenType.RBRACE, literal: "}"},
        { tokenType: TokenType.ELSE, literal: "else"},
        { tokenType: TokenType.LBRACE, literal: "{"},
        { tokenType: TokenType.RETURN, literal: "return"},
        { tokenType: TokenType.FALSE, literal: "false"},
        { tokenType: TokenType.SEMICOLON, literal: ";"},
        { tokenType: TokenType.RBRACE, literal: "}"},

        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.EQUAL, literal: "==" },
        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },
        { tokenType: TokenType.INT, literal: "10" },
        { tokenType: TokenType.NOTEQUAL, literal: "!=" },
        { tokenType: TokenType.INT, literal: "9" },
        { tokenType: TokenType.SEMICOLON, literal: ";" },

        { tokenType: TokenType.STRING, literal: "foobar" },
        { tokenType: TokenType.STRING, literal: "foo bar" },

        { tokenType: TokenType.EOF, literal: "" },
    ];

    const lexer: Lexer = new Lexer(input);

    expected_results.forEach(res => {
        const actual_res = lexer.nextToken();

        expect(res.tokenType).toEqual(actual_res.tokenType);
        expect(res.literal).toEqual(actual_res.literal);
    });
})
