import { Expression, ExpressionStatement, Identifier, InfixExpression, IntegerLiteral, LetStatement, PrefixExpression, Program, ReturnStatement, Statement } from "../ast/ast";
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

function checkParseErrors(p: Parser) {
    const errors = p.errors;

    if (errors.length === 0) {
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

test("Testing parsing identifier expressions", () => {
    const input = "foobar;";

    const lex: Lexer = new Lexer(input);
    const parser = new Parser(lex);

    const program = parser.parseProgram();
    checkParseErrors(parser);

    expect(program.statements.length).toBe(1);
    expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);

    const stmt = program.statements[0] as ExpressionStatement;

    expect(stmt.expression).toBeInstanceOf(Identifier);

    const identifier = stmt.expression as Identifier;

    expect(identifier.value).toBe("foobar");
    expect(identifier.tokenLiteral()).toBe("foobar");
});

test("Testing parsing integer expressions", () => {
    const input = "5;";

    const lex = new Lexer(input);
    const parser = new Parser(lex);

    const program = parser.parseProgram();
    checkParseErrors(parser);

    expect(program.statements.length).toBe(1);
    expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);

    const stmt = program.statements[0] as ExpressionStatement;

    expect(stmt.expression).toBeInstanceOf(IntegerLiteral);

    const intLiteral = stmt.expression as IntegerLiteral;

    expect(intLiteral.value).toBe(5);
    expect(intLiteral.tokenLiteral()).toBe("5");
});

test("Testing parsing prefix Expressions", () => {
    type PrefixTest = {
        input: string
        operator: string
        integerValue: number
    };

    const prefixTests: PrefixTest[] = [
        { input: "!5", operator: "!", integerValue: 5 },
        { input: "-15", operator: "-", integerValue: 15 },
    ];

    prefixTests.forEach(pt => {
        const lex = new Lexer(pt.input);
        const parser = new Parser(lex);

        const program = parser.parseProgram();
        checkParseErrors(parser);

        expect(program.statements.length).toBe(1);

        expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);

        const stmt = program.statements[0] as ExpressionStatement;

        expect(stmt.expression).toBeInstanceOf(PrefixExpression);

        const exp = stmt.expression as PrefixExpression;

        expect(exp.operator).toBe(pt.operator);
        testIntegerLiteral(exp.right, pt.integerValue);
    });
});

function testIntegerLiteral(exp: Expression | undefined, value: number) {
    expect(exp).toBeDefined();

    expect(exp).toBeInstanceOf(IntegerLiteral);

    const literal = exp as IntegerLiteral;

    expect(literal.value).toBe(value);
    expect(literal.tokenLiteral()).toBe(value.toString());
}

test("Testing parsing prefix Expressions", () => {
    type InfixTest = {
        input: string,
        leftValue: number,
        operator: string,
        rightValue: number,
    };

    const infixTests = [
        { input: "5 + 5;", leftValue: 5, operator: "+", rightValue: 5, },
        { input: "5 - 5;", leftValue: 5, operator: "-", rightValue: 5, },
        { input: "5 * 5;", leftValue: 5, operator: "*", rightValue: 5, },
        { input: "5 / 5;", leftValue: 5, operator: "/", rightValue: 5, },
        { input: "5 > 5;", leftValue: 5, operator: ">", rightValue: 5, },
        { input: "5 < 5;", leftValue: 5, operator: "<", rightValue: 5, },
        { input: "5 == 5;", leftValue: 5, operator: "==", rightValue: 5, },
        { input: "5 != 5;", leftValue: 5, operator: "!=", rightValue: 5, },
    ];

    infixTests.forEach(it => {
        const lex = new Lexer(it.input);
        const parser = new Parser(lex);

        const program = parser.parseProgram();
        checkParseErrors(parser);

        expect(program.statements.length).toBe(1);

        expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);

        const stmt = program.statements[0] as ExpressionStatement;

        expect(stmt.expression).toBeInstanceOf(InfixExpression);

        const exp = stmt.expression as InfixExpression;

        testIntegerLiteral(exp.left, it.leftValue);

        expect(exp.operator).toBe(it.operator);

        testIntegerLiteral(exp.right, it.rightValue);
    });
});

test("Testing parsing operator precedence", () => {
    type TestType = {
        input: string,
        expected: string
    };

    const tests: TestType[] = [
        {
            input: "-a * b",
            expected: "((-a) * b)",
        },
        {
            input: "!-a",
            expected: "(!(-a))",
        },
        {
            input: "a + b + c",
            expected: "((a + b) + c)",
        },
        {
            input: "a + b - c",
            expected: "((a + b) - c)",
        },
        {
            input: "a * b * c",
            expected: "((a * b) * c)",
        },
        {
            input: "a * b / c",
            expected: "((a * b) / c)",
        },
        {
            input: "a + b / c",
            expected: "(a + (b / c))",
        },
        {
            input: "a + b * c + d / e - f",
            expected: "(((a + (b * c)) + (d / e)) - f)",
        },
        {
            input: "3 + 4; -5 * 5",
            expected: "(3 + 4) ((-5) * 5)",
        },
        {
            input: "5 > 4 == 3 < 4",
            expected: "((5 > 4) == (3 < 4))",
        },
        {
            input: "5 < 4 != 3 > 4",
            expected: "((5 < 4) != (3 > 4))",
        },
        {
            input: "3 + 4 * 5 == 3 * 1 + 4 * 5",
            expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
        },
        {
            input: "3 + 4 * 5 == 3 * 1 + 4 * 5",
            expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
        },
    ];

    tests.forEach(t => {
        const lex = new Lexer(t.input);
        const parser = new Parser(lex);

        const program = parser.parseProgram();
        checkParseErrors(parser);

        const actual = program.string();

        expect(actual.slice(0, actual.length - 1)).toEqual(t.expected); //slice to remove the trailing space.
    });
});
