import { test, expect } from "vitest";
import {
    Boolean,
    Error,
    FunctionObj,
    Integer,
    InterpretObject,
    newEnvironment,
    StringObj
} from "../eval/interpretObject";
import { Lexer } from "../lexer/lexer";
import { Parser } from "../ast/Parser";
import { GlobalConstants, evalAST } from "../eval/eval";

//the heart function that calls the evalAST method :)
function testEval(input: string): InterpretObject {
    const lex = new Lexer(input);
    const parser = new Parser(lex);
    const program = parser.parseProgram();
    const env = newEnvironment();

    const evalRes = evalAST(program, env);

    return evalRes as InterpretObject;
}

test("Evaluating Integer Literal Expressions and also Prefix Expressions [ Minus (-) ]", () => {
    type IntTests = {
        input: string,
        expected: number
    };

    const tests: IntTests[] = [
        {
            input: "5;", expected: 5
        },
        {
            input: "10;", expected: 10
        },
        {
            input: "-5", expected: -5
        },
        {
            input: "-10", expected: -10
        },
        {
            input: "5 + 5 + 5 + 5 - 10", expected: 10
        },
        {
            input: "2 * 2 * 2 * 2 * 2", expected: 32
        },
        {
            input: "-50 + 100 + -50", expected: 0
        },
        {
            input: "5 * 2 + 10", expected: 20
        },
        {
            input: "5 + 2 * 10", expected: 25
        },
        {
            input: "20 + 2 * -10", expected: 0
        },
        {
            input: "50 / 2 * 2 + 10", expected: 60
        },
        {
            input: "2 * (5 + 10)", expected: 30
        },
        {
            input: "3 * 3 * 3 + 10", expected: 37
        },
        {
            input: "3 * (3 * 3) + 10", expected: 37
        },
        {
            input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: 50
        },
    ];

    tests.forEach(t => {
        const evaluated = testEval(t.input);
        testIntegerObject(evaluated, t.expected);
    });
});

test("Evaluating Boolean Literal Expressions", () => {
    type BoolTests = {
        input: string,
        expected: boolean
    };

    const tests: BoolTests[] = [
        {
            input: "true", expected: true
        },
        {
            input: "false", expected: false
        },
        {
            input: "1 < 2", expected: true
        },
        {
            input: "1 > 2", expected: false
        },
        {
            input: "1 < 1", expected: false
        },
        {
            input: "1 > 1", expected: false
        },
        {
            input: "1 == 1", expected: true
        },
        {
            input: "1 != 1", expected: false
        },
        {
            input: "1 == 2", expected: false
        },
        {
            input: "1 != 2", expected: true
        },
        {
            input: "true == true", expected: true
        },
        {
            input: "false == false", expected: true
        },
        {
            input: "true == false", expected: false
        },
        {
            input: "true != false", expected: true
        },
        {
            input: "false != true", expected: true
        },
        {
            input: "(1 < 2) == true", expected: true
        },
        {
            input: "(1 < 2) == false", expected: false
        },
        {
            input: "(1 > 2) == true", expected: false
        },
        {
            input: "(1 > 2) == false", expected: true
        },
    ];

    tests.forEach(t => {
        const evaluated = testEval(t.input);
        testBooleanObject(evaluated, t.expected);
    });
});

test("Evaluating Prefix Expressions - Bang(!)", () => {
    type BangTests = {
        input: string,
        expected: boolean
    };

    const tests: BangTests[] = [
        {
            input: "!true", expected: false
        },
        {
            input: "!false", expected: true
        },
        {
            input: "!5", expected: false
        },
        {
            input: "!!true", expected: true
        },
        {
            input: "!!false", expected: false
        },
        {
            input: "!!5", expected: true
        },
    ];

    tests.forEach(t => {
        const evaluated = testEval(t.input);
        testBooleanObject(evaluated, t.expected);
    });
});

test("Evaluating If-Else Expressions", () => {
    type IfElseTests = {
        input: string,
        expected: any
    };

    const tests: IfElseTests[] = [
        {
            input: "if (true) { 10 }", expected: 10
        },
        {
            input: "if (false) { 10 }", expected: null //if the condition for 'if' is false and there is no else then NULL should be returned
        },
        {
            input: "if (1) { 10 }", expected: 10
        },
        {
            input: "if (1 < 2) { 10 }", expected: 10
        },
        {
            input: "if (1 > 2) { 10 }", expected: null
        },
        {
            input: "if (1 > 2) { 10 } else { 20 }", expected: 20
        },
        {
            input: "if (1 < 2) { 10 } else { 20 }", expected: 10
        },
    ];

    tests.forEach(t => {
        const evaluated = testEval(t.input);

        if (typeof t.expected === "number") {
            testIntegerObject(evaluated, t.expected);
        }

        else {
            testNullObject(evaluated);
        }
    });
});

test("Evaluating Result Statements", () => {
    type ResultTests = {
        input: string,
        expected: number
    };

    const tests: ResultTests[] = [
        { input: "return 10;", expected: 10 },
        { input: "return 10; 9;", expected: 10 },
        { input: "return 2 * 5; 9;", expected: 10 },
        { input: "9; return 2 * 5; 9;", expected: 10 },
        {
            input: `
            if (10 > 1) {
                if (10 > 1) {
                return 10;
                }
                return 1;
            }
            `, expected: 10
        },
    ];

    tests.forEach(t => {
        const evaluated = testEval(t.input);
        testIntegerObject(evaluated, t.expected);
    });
});

test("Testing Error handling", () => {
    type ErrorTest = {
        input: string,
        expectedMessage: string,
    };

    const tests: ErrorTest[] = [
        {
            input: "5 + true;",
            expectedMessage: "type mismatch: INTEGER + BOOLEAN",
        },
        {
            input: "5 + true; 5;",
            expectedMessage: "type mismatch: INTEGER + BOOLEAN",
        },
        {
            input: "-true",
            expectedMessage: "unknown operator: -BOOLEAN",
        },
        {
            input: "true + false;",
            expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: "5; true + false; 5",
            expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: "if (10 > 1) { true + false; }",
            expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: `
                if (10 > 1) {
                    if (10 > 1) {
                        return true + false;
                    }
                    return 1;
                }
            `,
            expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: "foobar",
            expectedMessage: "identifier not found: foobar",
        },
    ];

    tests.forEach(t => {
        const evaluated = testEval(t.input);

        expect(evaluated).toBeInstanceOf(Error);

        const errorObj = (evaluated as Error);

        expect(errorObj.message).toBe(t.expectedMessage);
    });
});

test("Evaluating Let Statements", () => {
    type LetTests = {
        input: string,
        expected: number,
    };

    const tests: LetTests[] = [
        { input: "let a = 5; a;", expected: 5 },
        { input: "let a = 5 * 5; a;", expected: 25 },
        { input: "let a = 5; let b = a; b;", expected: 5 },
        { input: "let a = 5; let b = a; let c = a + b + 5; c;", expected: 15 },
    ];

    tests.forEach(t => {
        testIntegerObject(testEval(t.input), t.expected);;
    });
});

test("Evaluating Functions - Internal Representation", () => {
    const input = "fn(x) { x + 2; };";

    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(FunctionObj);

    const funcObj = evaluated as FunctionObj;

    expect(funcObj.parameters.length).toBe(1);

    expect(funcObj.parameters[0].string()).toBe("x");

    const expectedBody = "(x + 2)";

    expect(funcObj.body.string()).toBe(expectedBody);
});

test("Evaluating Functions - Function calls", () => {
    type FunctionTest = {
        input: string,
        expected: number
    };

    const tests: FunctionTest[] = [
        { input: "let identity = fn(x) { x; }; identity(5);", expected: 5 },
        { input: "let identity = fn(x) { return x; }; identity(5);", expected: 5 },
        { input: "let double = fn(x) { x * 2; }; double(5);", expected: 10 },
        { input: "let add = fn(x, y) { x + y;  }; add(5, 5);", expected: 10 },
        { input: "let add = fn(x, y) { x + y;  }; add(5 + 5, add(5, 5));", expected: 20 },
        { input: "fn(x) { x; }(5)", expected: 5 },
    ];

    tests.forEach(t => {
        testIntegerObject(testEval(t.input), t.expected);
    });
});

test("Evaluating String Literals", () => {
    const input = '"hello, world"';

    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(StringObj);

    expect((evaluated as StringObj).value).toBe("hello, world");
});

function testIntegerObject(obj: InterpretObject, expected: number): void {
    expect(obj).toBeInstanceOf(Integer);

    const intObj = obj as Integer;

    expect(intObj.value).toBe(expected);
}

function testBooleanObject(obj: InterpretObject, expected: boolean): void {
    expect(obj).toBeInstanceOf(Boolean);

    const boolObj = obj as Boolean;

    expect(boolObj.value).toBe(expected);
}

function testNullObject(obj: InterpretObject): void {
    expect(obj).toBe(GlobalConstants.NULL);
}
