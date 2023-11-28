import {
    BooleanExpression,
    CallExpression,
    Expression,
    ExpressionStatement,
    FunctionLiteral,
    Identifier,
    IfExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    ReturnStatement,
    Statement,
    StringLiteral
} from "../ast/ast";
import { Parser } from "../ast/Parser";
import { Lexer } from "../lexer/lexer";

import { test, expect } from "vitest"

test("Testing parsing let statements without expression parsing", () => {
    const input = `
        let x = 5;
        let y = 12;
        let foobar = 12;
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

test("Testing parser's return statements without expression parsing", () => {
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
    expect(program.string()).toContain("let x = 5;");
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

test("Testing parsing If expressions", () => {
    const input = `if (x < y) { x }`;

    const lex = new Lexer(input);
    const parser = new Parser(lex);

    const program = parser.parseProgram();
    checkParseErrors(parser);

    expect(program.statements.length).toBe(1);
    expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);

    const stmt = program.statements[0] as ExpressionStatement;

    expect(stmt.expression).toBeInstanceOf(IfExpression);

    const ifExp = stmt.expression as IfExpression;

    testInfixExpressions(ifExp.condition as Expression, "x", "<", "y");
    expect(ifExp.consequence).toBeDefined();

    expect(ifExp.consequence?.statements.length).toBe(1);
    expect(ifExp.consequence?.statements[0]).toBeInstanceOf(ExpressionStatement);

    const consequenceExp = ifExp.consequence?.statements[0] as ExpressionStatement;

    testIdentifier(consequenceExp.expression as Expression, "x");
});

test("Testing parsing If-Else expressions", () => {
    const input = `if (x < y) { x } else { y }`;

    const lex = new Lexer(input);
    const parser = new Parser(lex);

    const program = parser.parseProgram();
    checkParseErrors(parser);

    expect(program.statements.length).toBe(1);
    expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);

    const stmt = program.statements[0] as ExpressionStatement;

    expect(stmt.expression).toBeInstanceOf(IfExpression);

    const ifElseExp = stmt.expression as IfExpression;

    testInfixExpressions(ifElseExp.condition as Expression, "x", "<", "y");
    expect(ifElseExp.consequence).toBeDefined();
    expect(ifElseExp.consequence).not.toBeNull();

    expect(ifElseExp.consequence?.statements.length).toBe(1);
    expect(ifElseExp.consequence?.statements[0]).toBeInstanceOf(ExpressionStatement);

    const consequenceExp = ifElseExp.consequence?.statements[0] as ExpressionStatement;

    testIdentifier(consequenceExp.expression as Expression, "x");

    expect(ifElseExp.alternative).not.toBeNull();
    expect(ifElseExp.alternative).toBeDefined();

    expect(ifElseExp.alternative?.statements.length).toBe(1);
    expect(ifElseExp.alternative?.statements[0]).toBeInstanceOf(ExpressionStatement);

    const alternativeExp = ifElseExp.alternative?.statements[0] as ExpressionStatement;

    testIdentifier(alternativeExp.expression as Expression, "y");
});

test("Testing parsing function literal", () => {
    const input = `fn(x, y) { x + y; }`;

    const lex = new Lexer(input);
    const parser = new Parser(lex);

    const program = parser.parseProgram();
    checkParseErrors(parser);

    expect(program.statements.length).toBe(1);
    expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);

    const stmt = program.statements[0] as ExpressionStatement;

    expect(stmt.expression).toBeInstanceOf(FunctionLiteral);

    const funcLiteral = stmt.expression as FunctionLiteral;

    expect(funcLiteral.parameters?.length).toBe(2);

    testLiteralExpressions(funcLiteral.parameters?.at(0) as Identifier, "x");
    testLiteralExpressions(funcLiteral.parameters?.at(1) as Identifier, "y");

    expect(funcLiteral.body?.statements.length).toBe(1);

    expect(funcLiteral.body?.statements[0]).toBeInstanceOf(ExpressionStatement);

    const bodyStmt = funcLiteral.body?.statements[0] as ExpressionStatement;

    testInfixExpressions(bodyStmt.expression as Expression, "x", "+", "y");
});

test("Testing parsing function parameters", () => {
    type ParameterTest = {
        input: string,
        expectedParams: string[],
    };

    const tests = [
        { input: "fn() {};", expectedParams: []},
        { input: "fn(x) {};", expectedParams: ["x"] },
        { input: "fn(x, y, z) {};", expectedParams: ["x", "y", "z"] },
    ];

    tests.forEach(t => {
        const lex = new Lexer(t.input);
        const parser = new Parser(lex);

        const program = parser.parseProgram();
        checkParseErrors(parser);

        const stmt = program.statements[0] as ExpressionStatement;
        const funLiteral = stmt.expression as FunctionLiteral;

        expect(funLiteral.parameters?.length).toEqual(t.expectedParams.length);

        for(let i = 0; i < t.expectedParams.length; i++){
            testLiteralExpressions(funLiteral.parameters?.at(i) as Expression, t.expectedParams[i]);
        }
    });
});

test("Testing parsing call expressions", () => {
    const input = "add(1, 2 * 3, 4 + 5);";

    const lex = new Lexer(input);
    const parser = new Parser(lex);

    const program = parser.parseProgram();
    checkParseErrors(parser);

    expect(program.statements.length).toBe(1);

    expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);

    const stmt = program.statements[0] as ExpressionStatement;

    expect(stmt.expression).toBeInstanceOf(CallExpression);

    const exp = stmt.expression as CallExpression;

    testIdentifier(exp.func as Expression, "add");

    expect(exp.arguments.length).toBe(3);

    testLiteralExpressions(exp.arguments[0], 1);
    testInfixExpressions(exp.arguments[1], 2, "*", 3);
    testInfixExpressions(exp.arguments[2], 4, "+", 5);
});

test("Testing parsing let statements with expression parsing", () => {
    type LetTest = {
        input: string
        expectedIdent: string
        expectedValue: any;
    };

    const tests: LetTest[] = [
        { input: "let x = 5;", expectedIdent: "x", expectedValue: 5, },
        { input: "let y = true;", expectedIdent: "y", expectedValue: true, },
        { input: "let foobar = y;", expectedIdent: "foobar", expectedValue: "y", }
    ];

    tests.forEach(t => {
        const parser = new Parser(new Lexer(t.input));

        const program = parser.parseProgram();
        checkParseErrors(parser);

        expect(program).not.toBeNull();
        expect(program?.statements.length).toEqual(1);

        const stmt = program.statements[0];

        testLetStatement(stmt, t.expectedIdent);
        testLiteralExpressions((stmt as LetStatement).value as Expression, t.expectedValue);
    });
});

test("Testing parsing return statements with expression parsing", () => {
    type LetTest = {
        input: string
        expectedValue: any;
    };

    const tests: LetTest[] = [
        { input: "return 5;", expectedValue: 5, },
        { input: "return true;", expectedValue: true, },
        { input: "return y;", expectedValue: "y", }
    ];

    tests.forEach(t => {
        const parser = new Parser(new Lexer(t.input));

        const program = parser.parseProgram();
        checkParseErrors(parser);

        expect(program).not.toBeNull();
        expect(program?.statements.length).toEqual(1);

        expect(program.statements[0]).toBeInstanceOf(ReturnStatement);

        const stmt = program.statements[0] as ReturnStatement;

        testLiteralExpressions(stmt.returnValue as Expression, t.expectedValue);
    });
});

test("Testing parsing String Literals", () => {
    const input: string = '"hello, world"';

    const parser = new Parser(new Lexer(input));

    const program = parser.parseProgram();
    checkParseErrors(parser);

    expect(program.statements.length).toBe(1);
    expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);

    const stmt = program.statements[0] as ExpressionStatement;

    expect(stmt.expression).toBeInstanceOf(StringLiteral);

    const literal = stmt.expression as StringLiteral;

    expect(literal.value).toBe("hello, world");
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

