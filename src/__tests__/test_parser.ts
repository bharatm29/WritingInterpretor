import { LetStatement, Program, ReturnStatement, Statement } from "../ast/ast";
import { Parser } from "../ast/Parser";
import { Lexer } from "../lexer/lexer";

test("Testing parsing let statements", () => {
    const input = `
        let x = 5;
        let y = 10;
        let foobar = 838383;
    `;

    const parser = new Parser(new Lexer(input));

    const program = parser.parseProgram();
    checkParseErrors(parser);

    expect(program).not.toBeNull();
    expect(program?.statements.length).toEqual(3);

    const expectedIdent = ["x", "y", "foobar"];

    for (let i = 0; i < expectedIdent.length; i++) {
        const statement = program?.statements[i] as Statement;
        testLetStatement(statement, expectedIdent[i]);
    }
});

function testLetStatement(astStatement: Statement, name: string) {
    expect(astStatement.tokenLiteral()).toEqual("let");

    expect(astStatement).toBeInstanceOf(LetStatement);

    const letStatement = astStatement as LetStatement;

    expect(letStatement.name.value).toEqual(name);

    expect(letStatement.name.tokenLiteral()).toEqual(name);
}

function checkParseErrors(p: Parser){
    const errors = p.errors;

    if(errors.length === 0){
        return;
    }

    console.warn(`Parse has ${errors.length} errors!`);

    errors.forEach(console.log);
 
    throw new Error("Parser had errors. The test has been stopped from execution");
}

test("Testing parser's return statements", () => {
    const input = `
        return 5;
        return 10;
        return 993322;
    `;

    const lex = new Lexer(input);

    const parser = new Parser(lex);

    const program = parser.parseProgram();
    checkParseErrors(parser);

    expect(program).not.toBeNull();
    expect(program?.statements.length).toEqual(3);

    program.statements.forEach(p => {
        expect(p).toBeInstanceOf(ReturnStatement);

        const returnStatement = p as ReturnStatement;
        expect(returnStatement.tokenLiteral()).toEqual("return");
    });
});

test("Testing string conversion", () => {
    const input = `let x = 5;`;

    const parser = new Parser(new Lexer(input));

    const program = parser.parseProgram();

    // console.log(program.string());
    expect(program.string()).toContain("let x = ;");
});
