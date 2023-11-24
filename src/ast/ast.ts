import { Token } from "../lexer/token";

export interface ASTNode {
    tokenLiteral(): string;
    string(): string;
}

export interface Statement extends ASTNode {
    statementNode(): void;
}

export interface Expression extends ASTNode {
    expressionNode(): void;
}

export class Program implements ASTNode {
    public statements: Statement[];

    constructor() {
        this.statements = [];
    }

    tokenLiteral(): string {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        }
        else {
            return "";
        }
    }

    string(): string {
        return this.statements.reduce((str, statement) => {
            return str + statement.string() + " ";
        }, "");
    }
}

export class Identifier implements Expression {
    constructor(
        public value: string,
        public token: Token,
    ) { }

    expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        return this.value;
    }
}

export class LetStatement implements Statement {
    public value?: Expression;
    constructor(
        public token: Token,
        public name: Identifier,
    ) { }

    statementNode(): void {
        throw new Error("Method not implemented.");
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        let str = "";

        str += this.tokenLiteral() + " ";
        str += this.name.string();
        str += " = ";

        if (this.value) {
            str += this.value.string();
        }

        str += ";";

        return str;
    }

}

export class ReturnStatement implements Statement {
    public returnValue?: Expression;

    constructor(
        public token: Token
    ) { }

    statementNode(): void {
        throw new Error("Method not implemented.");
    }
    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        let str = "";

        str += this.tokenLiteral() + " ";

        if (this.returnValue) {
            str += this.returnValue.string();
        }

        str += ";";

        return str;
    }
}

export enum Precedence {
    _,
    LOWEST,
    EQUALS,
    LESSGREATER,
    SUM,
    PRODUCT,
    PREFIX,
    CALL,
}

export class ExpressionStatement implements Statement {
    public expression?: Expression;

    constructor(
        public token: Token
    ) { }

    statementNode(): void {
        throw new Error("Method not implemented.");
    }
    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        return this.expression ? this.expression.string() : "";
    }
}

export class IntegerLiteral implements Expression {
    public value?: number;

    constructor(
        public token: Token
    ) { }

    expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        return this.token.literal;
    }
}

export class PrefixExpression implements Expression {
    public right?: Expression;

    constructor(
        public token: Token,
        public operator: string,
    ) { }

    expressionNode(): void {
        throw new Error("Method not implemented.");
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return `(${this.operator}${this.right?.string()})`;
    }
}

export class InfixExpression implements Expression {
    public right?: Expression;
    public left?: Expression;

    constructor(
        public token: Token,
        public operator: string,
    ) { }

    expressionNode(): void {
        throw new Error("Method not implemented.");
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return `(${this.left?.string()} ${this.operator} ${this.right?.string()})`;
    }
}

export class BooleanExpression implements Expression {
    constructor(
        public token: Token,
        public value: boolean
    ) { }

    expressionNode(): void {
        throw new Error("Method not implemented.");
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return this.token.literal;
    }
}

export class IfExpression implements Expression {
    public condition?: Expression;
    public consequence?: BlockStatement;
    public alternative?: BlockStatement;

    constructor(
        public token: Token,
    ) { }

    expressionNode(): void {
        throw new Error("Method not implemented.");
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        let str = `if (${this.condition?.string()}) ${this.consequence?.string()}`;

        if (this.alternative) {
            str += ` else ${this.alternative.string()}`;
        }
        return str;
    }
}

export class BlockStatement implements Statement {
    public statements: Statement[];

    constructor(public token: Token) {
        this.statements = [];
    }

    statementNode(): void {
        throw new Error("Method not implemented.");
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return this.statements.reduce((str, statement) => {
            return str + statement.string() + " ";
        }, "");
    }
}

export class FunctionLiteral implements Expression {
    public parameters: Identifier[] | undefined;
    public body?: BlockStatement;

    constructor(
        public token: Token,
    ) {
        this.parameters = [];
    }

    expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        let str = `${this.tokenLiteral()}(`;

        this.parameters?.forEach(p => {
            str += p.string() + ", ";
        });

        str += `){${this.body?.string()}}`;

        return str;
    }
}

export class CallExpression implements Expression {
    public func?: Expression
    public arguments: Expression[];

    constructor(public token: Token) {
        this.arguments = [];
    }

    expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        let args = this.arguments.reduce((acc, arg) => acc + arg.string() + ",", "");

        return `${this.func?.string()}(${args.slice(0, args.length - 1)})`;
    }
}
