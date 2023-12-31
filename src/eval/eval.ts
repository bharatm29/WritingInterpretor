import {
    ASTNode,
    BlockStatement,
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
    Program,
    ReturnStatement,
    Statement,
    StringLiteral
} from "../ast/ast";
import * as Obj from "./interpretObject";
import {Builtin} from "./interpretObject";

export class GlobalConstants {
    public static BOOL_TRUE: Obj.Boolean = new Obj.Boolean(true);
    public static BOOL_FALSE: Obj.Boolean = new Obj.Boolean(false);
    public static NULL: Obj.Null = new Obj.Null();
}

export function evalAST(node: ASTNode, env: Obj.Environment): Obj.InterpretObject {
    switch (node.constructor.name) {
        //statements
        case "Program":
            return evalProgram((node as Program).statements, env);

        case "ExpressionStatement":
            return evalAST((node as ExpressionStatement).expression as Expression, env);

        case "IntegerLiteral":
            return new Obj.Integer((node as IntegerLiteral).value as number);

        case "BooleanExpression":
            return nativeBoolToBooleanObject((node as BooleanExpression).value);

        case "StringLiteral":
            return new Obj.StringObj((node as StringLiteral).value);

        case "PrefixExpression":
            const prefixNode = node as PrefixExpression;
            const rightEval = evalAST(prefixNode.right as Expression, env);

            if (isError(rightEval)) {
                return rightEval;
            }

            return evalPrefixExpressions(prefixNode.operator, rightEval);

        case "InfixExpression":
            const infixNode = node as InfixExpression;

            const left = evalAST(infixNode.left as Expression, env);
            const right = evalAST(infixNode.right as Expression, env);

            if (isError(left)) {
                return left;
            }

            if (isError(right)) {
                return right;
            }

            return evalInfixExpression(infixNode.operator, left, right);

        //evaluating if expressions
        case "BlockStatement":
            return evalBlockStatements((node as BlockStatement), env);

        case "IfExpression":
            return evalIfExpression((node as IfExpression), env);

        case "ReturnStatement":
            const returnVal = evalAST((node as ReturnStatement).returnValue as Expression, env);

            if (isError(returnVal)) {
                return returnVal;
            }

            return new Obj.ReturnValue(returnVal);

        case "LetStatement":
            const letStmt = (node as LetStatement);
            const letVal = evalAST(letStmt.value as Expression, env);

            if (isError(letVal)) {
                return letVal;
            }

            env.set(letStmt.name.value, letVal);
            return GlobalConstants.NULL;

        case "Identifier":
            return evalIdentifier(node as Identifier, env);

        case "FunctionLiteral":
            const funcNode = node as FunctionLiteral;

            const env_clone = Obj.newEnvironment();
            env_clone.store = new Map(env.store);

            //This can be dangerous since no null checking
            return new Obj.FunctionObj(funcNode.parameters as Identifier[], funcNode.body as BlockStatement, env_clone); //env should be copied?

        case "CallExpression":
            const callNode = (node as CallExpression);
            const func = evalAST(callNode.func as Expression, env);

            if (isError(func)) {
                return func;
            }

            const args = evalExpressions(callNode.arguments, env);

            if (args.length === 1 && isError(args[0])) {
                return args[0];
            }

            return callFunction(func, args);

        default:
            return GlobalConstants.NULL;
    }
}

function isError(obj: Obj.InterpretObject): boolean {
    return obj.type() === Obj.ObjectType.ERROR_OBJ;
}

function evalProgram(statements: Statement[], env: Obj.Environment): Obj.InterpretObject {
    let result: Obj.InterpretObject = GlobalConstants.NULL;

    for (let st of statements) {
        result = evalAST(st, env);

        if (result instanceof Obj.ReturnValue) {
            return result.value;
        }
        else if (result instanceof Obj.Error) {
            return result;
        }
    }

    return result;
}

function evalBlockStatements(block: BlockStatement, env: Obj.Environment): Obj.InterpretObject {
    let result: Obj.InterpretObject = GlobalConstants.NULL;

    for (let st of block.statements) {
        result = evalAST(st, env);

        if (result.type() === Obj.ObjectType.RETURN_OBJ || result.type() === Obj.ObjectType.ERROR_OBJ) {
            return result;
        }
    }

    return result;
}
function evalExpressions(exprs: Expression[], env: Obj.Environment): Obj.InterpretObject[] {
    const res: Obj.InterpretObject[] = [];

    for (let exp of exprs) {
        const evaluated = evalAST(exp, env);

        if (isError(evaluated)) {
            return [evaluated];
        }

        res.push(evaluated);
    }

    return res;
}
function evalPrefixExpressions(operator: string, right: Obj.InterpretObject): Obj.InterpretObject {
    switch (operator) {
        case "!":
            return evalBangOperatorExpression(right);
        case "-":
            return evalMinusPrefixOperatorExpression(right);
        default:
            return newError("unknown operator: ", operator, right.type());
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
        return newError("unknown operator: -", right.type());
    }

    const value = (right as Obj.Integer).value;

    return new Obj.Integer(value * -1);
}

function evalInfixExpression(operator: string, left: Obj.InterpretObject, right: Obj.InterpretObject): Obj.InterpretObject {
    if (left.type() !== right.type()) {
        return newError("type mismatch: ", left.type(), operator, right.type());
    }
    //if both left and right are integers
    if (left.type() === Obj.ObjectType.INT_OBJ && right.type() === Obj.ObjectType.INT_OBJ) {
        return evalIntegerInfixExpression(operator, left, right);
    }

    else if (left.type() === Obj.ObjectType.STRING_OBJ && right.type() === Obj.ObjectType.STRING_OBJ){
        return evalStringInfixExpression(operator, left, right);
    }

    //for boolean operands
    else if (operator === "==") {
        return nativeBoolToBooleanObject(left === right);
    }
    else if (operator === "!=") {
        return nativeBoolToBooleanObject(left !== right);
    }

    else {
        return newError("unknown operator: ", left.type(), operator, right.type());
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
            return newError("unknown operator: ", left.type(), operator, right.type());
    }
}

function evalStringInfixExpression(operator: string, left: Obj.InterpretObject, right: Obj.InterpretObject): Obj.InterpretObject {
    if(operator !== "+"){
        return newError("unknown operator: ", left.type(), operator, right.type());
    }

    const lVal = (left as Obj.StringObj).value;
    const rVal = (right as Obj.StringObj).value;

    return new Obj.StringObj(lVal + rVal);
}

function nativeBoolToBooleanObject(b: boolean): Obj.InterpretObject {
    return b ? GlobalConstants.BOOL_TRUE : GlobalConstants.BOOL_FALSE;
}

function evalIfExpression(ienode: IfExpression, env: Obj.Environment): Obj.InterpretObject {
    const condition = evalAST(ienode.condition as Expression, env);

    if (isError(condition)) {
        return condition;
    }

    if (isTruthy(condition)) {
        return evalAST(ienode.consequence as BlockStatement, env);
    }
    else {
        return ienode.alternative ? evalAST(ienode.alternative as BlockStatement, env) : GlobalConstants.NULL;
    }
}

function evalIdentifier(node: Identifier, env: Obj.Environment): Obj.InterpretObject {
    const envVal = env.get(node.value);

    if (envVal) {
        return envVal;
    }
    else if (Obj.builtins.has(node.value)){
        return Obj.builtins.get(node.value) as Obj.Builtin;
    }
    else{
        return newError("identifier not found: " + node.value);
    }
}

function callFunction(func: Obj.InterpretObject, args: Obj.InterpretObject[]): Obj.InterpretObject {
    switch (func.constructor.name) {
        case "FunctionObj":
            const functionObj = func as Obj.FunctionObj;

            const extendedEnv = extendFunctionEnv(functionObj, args);
            const evaluated = evalAST(functionObj.body, extendedEnv);

            return unwrapReturnValue(evaluated);
        case "Builtin":
            return (func as Builtin).builtinFunction(...args);
        default:
            return newError("not a function: ", func.type());
    }

}

function extendFunctionEnv(func: Obj.FunctionObj, args: Obj.InterpretObject[]): Obj.Environment {
    const extendedEnv = Obj.newEnclosedEnvironment(func.env);

    func.parameters.forEach((paramIdent, index) => {
        extendedEnv.set(paramIdent.value, args[index]);
    });

    return extendedEnv;
}

function unwrapReturnValue(obj: Obj.InterpretObject): Obj.InterpretObject {
    if (obj instanceof Obj.ReturnValue) {
        return obj.value;
    }

    return obj;
}

function isTruthy(condition: Obj.InterpretObject): boolean {
    return condition === GlobalConstants.NULL || condition === GlobalConstants.BOOL_FALSE ? false : true;
}

function newError(message: string, ...a: any[]) {
    const errorInstances: string = a.reduce((acc, s) => acc + s + " ", "").trim();

    return new Obj.Error(`${message}${errorInstances}`);
}
