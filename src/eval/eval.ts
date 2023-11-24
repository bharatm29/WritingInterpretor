import { ASTNode, BlockStatement, BooleanExpression, Expression, ExpressionStatement, IfExpression, InfixExpression, IntegerLiteral, PrefixExpression, Program, ReturnStatement, Statement } from "../ast/ast";
import * as Obj from "./interpretObject";

export class GlobalConstants {
    public static BOOL_TRUE: Obj.Boolean = new Obj.Boolean(true);
    public static BOOL_FALSE: Obj.Boolean = new Obj.Boolean(false);;
    public static NULL: Obj.Null = new Obj.Null();
}

export function evalAST(node: ASTNode): Obj.InterpretObject {
    switch (node.constructor.name) {
        //statements
        case "Program":
            return evalProgram((node as Program).statements);

        case "ExpressionStatement":
            return evalAST((node as ExpressionStatement).expression as Expression);

        case "IntegerLiteral":
            return new Obj.Integer((node as IntegerLiteral).value as number);

        case "BooleanExpression":
            return nativeBoolToBooleanObject((node as BooleanExpression).value);

        case "PrefixExpression":
            const prefixNode = node as PrefixExpression;
            const rightEval = evalAST(prefixNode.right as Expression);
            return evalPrefixExpressions(prefixNode.operator, rightEval);

        case "InfixExpression":
            const infixNode = node as InfixExpression;

            const left = evalAST(infixNode.left as Expression);
            const right = evalAST(infixNode.right as Expression);

            return evalInfixExpression(infixNode.operator, left, right);

        //evaluating if expressions
        case "BlockStatement":
            return evalBlockStatements((node as BlockStatement));

        case "IfExpression":
            return evalIfExpression((node as IfExpression));

        case "ReturnStatement":
            const val = evalAST((node as ReturnStatement).returnValue as Expression);
            return new Obj.ReturnValue(val);

        default:
            return GlobalConstants.NULL;
    }
}

function evalProgram(statements: Statement[]): Obj.InterpretObject {
    let result: Obj.InterpretObject = GlobalConstants.NULL;

    for (let st of statements) {
        result = evalAST(st);

        if (result instanceof Obj.ReturnValue) {
            return result.value;
        }
    }

    return result;
}

function evalBlockStatements(block: BlockStatement): Obj.InterpretObject {
    let result: Obj.InterpretObject = GlobalConstants.NULL;

    for (let st of block.statements) {
        result = evalAST(st);

        if (result.type() === Obj.ObjectType.RESULT_OBJ) {
            return result;
        }
    }

    return result;
}

function evalPrefixExpressions(operator: string, right: Obj.InterpretObject): Obj.InterpretObject {
    switch (operator) {
        case "!":
            return evalBangOperatorExpression(right);
        case "-":
            return evalMinusPrefixOperatorExpression(right);
        default:
            return GlobalConstants.NULL;
    }
}

function evalBangOperatorExpression(right: Obj.InterpretObject): Obj.InterpretObject {
    switch (right) {
        case GlobalConstants.BOOL_TRUE:
            return GlobalConstants.BOOL_FALSE;

        case GlobalConstants.BOOL_FALSE:
            return GlobalConstants.BOOL_TRUE;

        case GlobalConstants.NULL:
            return GlobalConstants.BOOL_TRUE;

        default:
            return GlobalConstants.BOOL_FALSE;
    }
}

function evalMinusPrefixOperatorExpression(right: Obj.InterpretObject): Obj.InterpretObject {
    if (!(right instanceof Obj.Integer)) {
        return GlobalConstants.NULL;
    }

    const value = (right as Obj.Integer).value;

    return new Obj.Integer(value * -1);
}

function evalInfixExpression(operator: string, left: Obj.InterpretObject, right: Obj.InterpretObject): Obj.InterpretObject {
    //if both left and right are integers
    if (left.type() === Obj.ObjectType.INT_OBJ && right.type() === Obj.ObjectType.INT_OBJ) {
        return evalIntegerInfixExpression(operator, left, right);
    }

    //for boolean operands
    else if (operator === "==") {
        return nativeBoolToBooleanObject(left === right);
    }
    else if (operator === "!=") {
        return nativeBoolToBooleanObject(left !== right);
    }

    else {
        return GlobalConstants.NULL;
    }
}

function evalIntegerInfixExpression(operator: string, left: Obj.InterpretObject, right: Obj.InterpretObject): Obj.InterpretObject {
    const leftVal = (left as Obj.Integer).value;
    const rightVal = (right as Obj.Integer).value;

    switch (operator) {
        case "+":
            return new Obj.Integer(leftVal + rightVal);
        case "-":
            return new Obj.Integer(leftVal - rightVal);
        case "*":
            return new Obj.Integer(leftVal * rightVal);
        case "/":
            return new Obj.Integer(leftVal / rightVal);
        case "<":
            return nativeBoolToBooleanObject(leftVal < rightVal);
        case ">":
            return nativeBoolToBooleanObject(leftVal > rightVal);
        case "==":
            return nativeBoolToBooleanObject(leftVal === rightVal);
        case "!=":
            return nativeBoolToBooleanObject(leftVal !== rightVal);
        default:
            return GlobalConstants.NULL;
    }
}

function nativeBoolToBooleanObject(b: boolean): Obj.InterpretObject {
    return b ? GlobalConstants.BOOL_TRUE : GlobalConstants.BOOL_FALSE;
}

function evalIfExpression(ienode: IfExpression): Obj.InterpretObject {
    const condition = evalAST(ienode.condition as Expression);

    if (isTruthy(condition)) {
        return evalAST(ienode.consequence as BlockStatement);
    }
    else {
        return ienode.alternative ? evalAST(ienode.alternative as BlockStatement) : GlobalConstants.NULL;
    }
}

function isTruthy(condition: Obj.InterpretObject): boolean {
    return condition === GlobalConstants.NULL || condition === GlobalConstants.BOOL_FALSE ? false : true;
}
