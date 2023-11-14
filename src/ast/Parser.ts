import { Lexer } from "../lexer/lexer";
import { Token, TokenType } from "../lexer/token";
import { Program, Statement, LetStatement, Identifier, ReturnStatement } from "./ast";

export class Parser {
    public lex: Lexer;

    public curToken: Token;
    public peekToken: Token;

    public errors: string[];

    constructor(lex: Lexer) {
        this.lex = lex;

        this.curToken = this.peekToken = { tokenType: TokenType.ILLEGAL, literal: "" };

        this.errors = [];
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
            case TokenType.LET:
                return this.parseLetStatement();

            case TokenType.RETURN:
                return this.parseReturnStatement();

            default:
                return null;
        }
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
}
