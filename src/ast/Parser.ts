import { Lexer } from "../lexer/lexer";
import { Token, TokenType } from "../lexer/token";
import {
    Program,
    Statement,
    LetStatement,
    Identifier,
    ReturnStatement,
    ExpressionStatement,
    Precedence,
    Expression,
    IntegerLiteral,
    PrefixExpression,
    InfixExpression,
    BooleanExpression,
    IfExpression,
    BlockStatement,
    FunctionLiteral,
    CallExpression,
    StringLiteral
} from "./ast";

export class Parser {
    public lex: Lexer;

    public curToken: Token;
    public peekToken: Token;

    public errors: string[];

    public prefixParseFns: Map<TokenType, Function>;
    public infixParseFns: Map<TokenType, Function>;

    public precedences: Map<TokenType, Precedence>;

    constructor(lex: Lexer) {
        this.lex = lex;

        this.curToken = this.peekToken = { tokenType: TokenType.NULL, literal: "" };

        this.nextToken();
        this.nextToken();

        this.errors = [];

        this.prefixParseFns = new Map();
        this.registerPrefix(TokenType.IDENT, this.parseIdentifier);
        this.registerPrefix(TokenType.INT, this.parseIntegerLiteral);
        this.registerPrefix(TokenType.BANG, this.parsePrefixExpression);
        this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression);
        this.registerPrefix(TokenType.TRUE, this.parseBoolean);
        this.registerPrefix(TokenType.FALSE, this.parseBoolean);
        this.registerPrefix(TokenType.LPAREN, this.parseGroupedExpressions);
        this.registerPrefix(TokenType.IF, this.parseIfExpression);
        this.registerPrefix(TokenType.FUNCTION, this.parseFunctionLiteral);
        this.registerPrefix(TokenType.STRING, this.parseStringLiteral);

        this.infixParseFns = new Map();
        this.registerInfix(TokenType.EQUAL, this.parseInfixExpression);
        this.registerInfix(TokenType.NOTEQUAL, this.parseInfixExpression);
        this.registerInfix(TokenType.PLUS, this.parseInfixExpression);
        this.registerInfix(TokenType.MINUS, this.parseInfixExpression);
        this.registerInfix(TokenType.SLASH, this.parseInfixExpression);
        this.registerInfix(TokenType.ASTERISK, this.parseInfixExpression);
        this.registerInfix(TokenType.LT, this.parseInfixExpression);
        this.registerInfix(TokenType.GT, this.parseInfixExpression);
        this.registerInfix(TokenType.LPAREN, this.parseCallExpression); //this acts as infix for the call function

        this.precedences = this.initPrecedences();
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

        if(this.peekTokenIs(TokenType.SEMICOLON)){ //skip the optional semi-colon.
            this.nextToken();
        }

        return statement;
    }
    private parseExpression(precedence: Precedence): Expression | undefined {
        if(!this.prefixParseFns.has(this.curToken.tokenType)){
            this.noPrefixParseFnError(this.curToken.tokenType);
            return undefined;
        }

        const prefix = this.prefixParseFns.get(this.curToken.tokenType)?.bind(this);

        let leftExp = prefix();

        while(!this.peekTokenIs(TokenType.SEMICOLON) && precedence < this.peekPrecedence()) {
            if(!this.infixParseFns.has(this.peekToken.tokenType)){
                return leftExp;
            }

            const infix = this.infixParseFns.get(this.peekToken.tokenType)?.bind(this);

            this.nextToken();

            leftExp = infix(leftExp);
        }

        return leftExp;
    }

    private parseIdentifier(): Expression | null {
        return new Identifier(this.curToken.literal, this.curToken);
    }

    private parseStringLiteral(): Expression | null {
        return new StringLiteral(this.curToken, this.curToken.literal);
    }

    private parseIntegerLiteral(): Expression | null {
        const literal = new IntegerLiteral(this.curToken);

        const parsedInt = parseInt(this.curToken.literal, 10);

        if(isNaN(parsedInt)){
            const msg = `could not parse ${this.curToken.literal} as integer in parseIntegerLiteral()`;
            this.errors.push(msg);
            return null;
        }

        const val = parsedInt;

        literal.value = val;

        return literal;
    }

    private parsePrefixExpression(): Expression | null {
        const exp = new PrefixExpression(this.curToken, this.curToken.literal);

        this.nextToken();

        exp.right = this.parseExpression(Precedence.PREFIX);

        return exp;
    }

    private parseInfixExpression(left: Expression): Expression | null {
        const exp = new InfixExpression(this.curToken, this.curToken.literal);
        exp.left = left;

        const precedence = this.curPrecedence();

        this.nextToken();

        exp.right = this.parseExpression(precedence);

        return exp;
    }

    private parseBoolean(): Expression | null {
        return new BooleanExpression(this.curToken, this.curTokenIs(TokenType.TRUE));
    }

    private parseGroupedExpressions(): Expression | null | undefined {
        this.nextToken();

        const exp = this.parseExpression(Precedence.LOWEST);

        if(!this.expectPeek(TokenType.RPAREN)){
            this.peekError(TokenType.RPAREN);
            return null;
        }

        return exp;
    }

    private parseIfExpression(): Expression | null {
        const exp = new IfExpression(this.curToken);

        if(!this.expectPeek(TokenType.LPAREN)){
            return null;
        }

        this.nextToken();
        exp.condition = this.parseExpression(Precedence.LOWEST);

        if(!this.expectPeek(TokenType.RPAREN)){
            return null;
        }

        if(!this.expectPeek(TokenType.LBRACE)){
            return null;
        }

        exp.consequence = this.parseBlockStatements();

        if(this.peekTokenIs(TokenType.ELSE)){
            this.nextToken();

            if(!this.expectPeek(TokenType.LBRACE)){
                return null;
            }

            exp.alternative = this.parseBlockStatements();
        }

        return exp;
    }

    private parseBlockStatements(): BlockStatement | undefined {
        const block = new BlockStatement(this.curToken);
        block.statements = [];

        this.nextToken();

        while(!this.curTokenIs(TokenType.RBRACE) && !this.curTokenIs(TokenType.EOF)){
            const stmt = this.parseStatement();
            if(stmt){
                block.statements.push(stmt);
            }
            this.nextToken();
        }

        return block;
    }

    private parseFunctionLiteral(): Expression | null {
        const lit = new FunctionLiteral(this.curToken);

        if(!this.expectPeek(TokenType.LPAREN)){
            return null;
        }

        lit.parameters = this.parseFunctionParams();

        if(!this.expectPeek(TokenType.LBRACE)){
            return null;
        }

        lit.body = this.parseBlockStatements();

        return lit;
    }

    private parseFunctionParams(): Identifier[] | undefined {
        const identtifiers: Identifier[] = [];

        if(this.peekTokenIs(TokenType.RPAREN)){
            this.nextToken();
            return identtifiers;
        }

        this.nextToken();

        identtifiers.push(new Identifier(this.curToken.literal, this.curToken));

        while(this.peekTokenIs(TokenType.COMMA)){
            this.nextToken();
            this.nextToken();

            identtifiers.push(new Identifier(this.curToken.literal, this.curToken));
        }

        if(!this.expectPeek(TokenType.RPAREN)){
            return undefined;
        }

        return identtifiers;
    }

    private parseCallExpression(funcExp: Expression): Expression {
        const exp = new CallExpression(this.curToken);
        exp.func = funcExp;

        const args = this.parseCallArguments();

        if(args){
            exp.arguments = args;
        }

        return exp;
    }

    private parseCallArguments(): Expression[] | null {
        const args: Expression[] = [];

        if(this.peekTokenIs(TokenType.RPAREN)){
            this.nextToken();
            return args;
        }

        this.nextToken();
        args.push(this.parseExpression(Precedence.LOWEST) as Expression);

        while(this.peekTokenIs(TokenType.COMMA)){
            this.nextToken();
            this.nextToken();
            args.push(this.parseExpression(Precedence.LOWEST) as Expression);
        }

        if(!this.expectPeek(TokenType.RPAREN)){
            return null
        }

        return args; 
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

        this.nextToken();

        statement.value = this.parseExpression(Precedence.LOWEST);

        while (!this.curTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return statement;
    }

    private parseReturnStatement(): ReturnStatement | null {
        const statement = new ReturnStatement(this.curToken);

        this.nextToken();

        statement.returnValue = this.parseExpression(Precedence.LOWEST);

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

    peekError(tokenType: TokenType) {
        const message = `Expected next token to be ${tokenType}, but got ${this.peekToken.tokenType} instead`;
        this.errors.push(message);
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
        this.infixParseFns.set(tokenType, infixFn);
    }

    private noPrefixParseFnError(tokenType: TokenType){
        this.errors.push("no prefix parse function found for " + tokenType.toString());
    }

    //precedence
    private initPrecedences(): Map<TokenType, Precedence> {
        return new Map([
            [TokenType.EQUAL, Precedence.EQUALS],
            [TokenType.NOTEQUAL, Precedence.EQUALS],
            [TokenType.LT, Precedence.LESSGREATER],
            [TokenType.GT, Precedence.LESSGREATER],
            [TokenType.PLUS, Precedence.SUM],
            [TokenType.MINUS, Precedence.SUM],
            [TokenType.SLASH, Precedence.PRODUCT],
            [TokenType.ASTERISK, Precedence.PRODUCT],
            [TokenType.LPAREN, Precedence.CALL],
        ]);
    }

    private peekPrecedence(): Precedence {
        if(!this.precedences.has(this.peekToken.tokenType)){
            return Precedence.LOWEST;
        }

        return this.precedences.get(this.peekToken.tokenType) as Precedence;
    }

    private curPrecedence(): Precedence {
        if(!this.precedences.has(this.curToken.tokenType)){
            return Precedence.LOWEST;
        }

        return this.precedences.get(this.curToken.tokenType) as Precedence;
    }
}
