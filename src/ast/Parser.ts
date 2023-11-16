import { Lexer } from "../lexer/lexer";
import { Token, TokenType } from "../lexer/token";
import { Program, Statement, LetStatement, Identifier, ReturnStatement, ExpressionStatement, Precedence, Expression } from "./ast";

export class Parser {
    public lex: Lexer;

    public curToken: Token;
    public peekToken: Token;

    public errors: string[];

    public prefixParseFns: Map<TokenType, Function>;
    public infixParseFns: Map<TokenType, Function>;

    constructor(lex: Lexer) {
        this.lex = lex;

        this.curToken = this.peekToken = { tokenType: TokenType.NULL, literal: "" };

        this.errors = [];

        this.prefixParseFns = new Map();
        this.registerPrefix(TokenType.IDENT, this.parseIdentifier);
        this.infixParseFns = new Map();
    }

    peekError(tokenType: TokenType) {
        const message = `Expected next token to be ${tokenType}, but got ${this.peekToken.tokenType} instead`;
        this.errors.push(message);
    }

    nextToken(): void {
        this.curToken = this.peekToken;

        this.peekToken = this.lex.nextToken();
    }

    parseProgram(): Program {
        const program = new Program();

        while (!this.curTokenIs(TokenType.EOF)) {
            const statement = this.parseStatement();

            if (statement !== null) {
                program.statements.push(statement);
            }

            this.nextToken();
        }

        return program;
    }

    private parseStatement(): Statement | null {
        switch (this.curToken.tokenType) {
            case TokenType.NULL:
                return null;
            case TokenType.LET:
                return this.parseLetStatement();
            case TokenType.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    private parseExpressionStatement(): Statement | null {
        const statement = new ExpressionStatement(this.curToken);

        statement.expression = this.parseExpression(Precedence.LOWEST);

        if(this.peekTokenIs(TokenType.SEMICOLON)){
            this.nextToken();
        }

        return statement;
    }
    private parseExpression(precedece: Precedence): Expression | undefined {
        if(!this.prefixParseFns.has(this.curToken.tokenType)){
            return undefined;
        }

        const prefix = this.prefixParseFns.get(this.curToken.tokenType)?.bind(this);

        const leftExpr = prefix();

        return leftExpr;
    }

    private parseIdentifier(): Expression {
        return new Identifier(this.curToken.literal, this.curToken);
    }

    private parseLetStatement(): LetStatement | null {
        const statement = new LetStatement(
            this.curToken,
            new Identifier("lolzz", this.curToken)
        );

        if (!this.expectPeek(TokenType.IDENT)) {
            return null;
        }

        statement.name = new Identifier(this.curToken.literal, this.curToken);

        if (!this.expectPeek(TokenType.ASSIGN)) {
            return null;
        }

        while (!this.curTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    private parseReturnStatement(): ReturnStatement | null {
        const statement = new ReturnStatement(this.curToken);

        this.nextToken();

        while (!this.curTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    private expectPeek(tokenType: TokenType): boolean {
        if (this.peekTokenIs(tokenType)) {
            this.nextToken();
            return true;
        }

        this.peekError(tokenType);
        return false;
    }

    private curTokenIs(tokenType: TokenType): boolean {
        return this.curToken.tokenType === tokenType;
    }

    private peekTokenIs(tokenType: TokenType): boolean {
        return this.peekToken.tokenType === tokenType;
    }

    private registerPrefix(tokenType: TokenType, prefixFn: Function){
        this.prefixParseFns.set(tokenType, prefixFn);
    }
    private registerInfix(tokenType: TokenType, infixFn: Function){
        infixFn.bind(this);
        this.infixParseFns.set(tokenType, infixFn);
    }
}
