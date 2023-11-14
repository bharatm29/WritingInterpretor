import { LetStatement, Parser, Program, Statement } from "../ast/ast";
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
