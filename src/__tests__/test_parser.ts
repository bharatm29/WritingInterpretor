import { BooleanExpression, Expression, ExpressionStatement, Identifier, InfixExpression, IntegerLiteral, LetStatement, PrefixExpression, Program, ReturnStatement, Statement } from "../ast/ast";
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
        value: number | boolean
    };

    const prefixTests: PrefixTest[] = [
        { input: "!5", operator: "!", value: 5 },
        { input: "-15", operator: "-", value: 15 },
        { input: "!true", operator: "!", value: true },
        { input: "!false", operator: "!", value: false },
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

        testLiteralExpressions(exp.right as Expression, pt.value);
    });
});

test("Testing parsing infix Expressions", () => {
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
        { input: "true == true;", leftValue: true, operator: "==", rightValue: true, },
        { input: "true != false;", leftValue: true, operator: "!=", rightValue: false, },
        { input: "false == false;", leftValue: false, operator: "==", rightValue: false, },
    ];

    infixTests.forEach(it => {
        const lex = new Lexer(it.input);
        const parser = new Parser(lex);

        const program = parser.parseProgram();
        checkParseErrors(parser);

        expect(program.statements.length).toBe(1);

        expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);

        const stmt = program.statements[0] as ExpressionStatement;
        testInfixExpressions(stmt.expression as Expression, it.leftValue, it.operator, it.rightValue);
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

        //testing booleans
        {
            input: "false",
            expected: "false",
        },
        {
            input: "true",
            expected: "true",
        },

        //testing paranthesis
        {
            input: "1 + (2 + 3) + 4",
            expected: "((1 + (2 + 3)) + 4)",
        },
        {
            input: "(5 + 5) * 2",
            expected: "((5 + 5) * 2)",
        },
        {
            input: "2 / (5 + 5)",
            expected: "(2 / (5 + 5))",
        },
        {
            input: "-(5 + 5)",
            expected: "(-(5 + 5))",
        },
        {
            input: "!(true == true)",
            expected: "(!(true == true))",
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

test("Testing parsing boolean expressions", () => {
    const input = "true;";

    const lex = new Lexer(input);
    const parser = new Parser(lex);

    const program = parser.parseProgram();
    checkParseErrors(parser);

    expect(program.statements.length).toBe(1);
    expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);

    const stmt = program.statements[0] as ExpressionStatement;

    testBooleanExpressions(stmt.expression as Expression, true);
});

function testLiteralExpressions(exp: Expression, expected: any){
    expect(exp).toBeDefined();
    expect(exp).not.toBeNull();

    switch(typeof expected){
        case "string":
            return testIdentifier(exp, expected);
        case "number":
            return testIntegerLiteral(exp, expected);
        case "boolean":
            return testBooleanExpressions(exp, expected);
        default:
            throw new Error("type of expression not handled: " + exp); //lol
    }
}

function testIdentifier(exp: Expression, value: string) {
    expect(exp).toBeInstanceOf(Identifier);

    const ident = exp as Identifier;

    expect(ident.value).toBe(value);
    expect(ident.tokenLiteral()).toBe(value);
}

function testIntegerLiteral(exp: Expression | undefined, value: number) {
    expect(exp).toBeDefined();

    expect(exp).toBeInstanceOf(IntegerLiteral);

    const literal = exp as IntegerLiteral;

    expect(literal.value).toBe(value);
    expect(literal.tokenLiteral()).toBe(value.toString());
}

function testInfixExpressions(exp: Expression, left: any, operator: string, right: any){
    expect(exp).toBeInstanceOf(InfixExpression);

    const opExp = exp as InfixExpression;

    testLiteralExpressions(opExp.left as Expression, left);

    expect(opExp.operator).toBe(operator);

    testLiteralExpressions(opExp.right as Expression, right);
}

function testBooleanExpressions(exp: Expression, value: boolean) {
    expect(exp).toBeInstanceOf(BooleanExpression);

    const boolExp = exp as BooleanExpression;

    expect(boolExp.value).toBe(value);
    expect(boolExp.tokenLiteral()).toBe(value ? "true" : "false");
}
