import { Token, TokenType } from "./token";

export class Lexer {
    private position: number;
    public readPosition: number;
    private ch: string;
    private keywords: Map<string, TokenType>;

    constructor(
        private input: string,
    ){
        this.position = 0;
        this.readPosition = 0;
        this.ch = '\0';

        this.keywords = this.initKeywords();
        this.readChar();
    }
    nextToken(): Token {
        let token: Token = {
                    tokenType: TokenType.ILLEGAL,
                    literal: ""
                };

        this.skipWhitespaces();

        switch (this.ch) {
            case '=': {
                if(this.peekChar() == '='){
                    const ch = this.ch;
                    this.readChar();
                    token = this.newToken(TokenType.EQUAL, ch + this.ch);
                }
                else {
                    token = this.newToken(TokenType.ASSIGN, this.ch);
                }
            }
            break;
            case '+':
                token = this.newToken(TokenType.PLUS, this.ch);
                break;
            case '-':
                token = this.newToken(TokenType.MINUS, this.ch);
                break;
            case '!': {
                if(this.peekChar() == '='){
                    const ch = this.ch;
                    this.readChar();
                    token = this.newToken(TokenType.NOTEQUAL, ch + this.ch);
                }
                else {
                    token = this.newToken(TokenType.BANG, this.ch);
                }
                break;
            }
            case '/':
                token = this.newToken(TokenType.SLASH, this.ch);
                break;
            case '*':
                token = this.newToken(TokenType.ASTERISK, this.ch);
                break;
            case '<':
                token = this.newToken(TokenType.LT, this.ch);
                break;
            case '>':
                token = this.newToken(TokenType.GT, this.ch);
                break;
            case ';':
                token = this.newToken(TokenType.SEMICOLON, this.ch);
                break;
            case '(':
                token = this.newToken(TokenType.LPAREN, this.ch);
                break;
            case ')':
                token = this.newToken(TokenType.RPAREN, this.ch);
                break;
            case ',':
                token = this.newToken(TokenType.COMMA, this.ch);
                break;
            case '{':
                token = this.newToken(TokenType.LBRACE, this.ch);
                break;
            case '}':
                token = this.newToken(TokenType.RBRACE, this.ch);
                break;
            case '\0':
                token = {
                    tokenType: TokenType.EOF,
                    literal: "",
                };
                break;
            default:
                if(this.isLetter(this.ch)){
                    token.literal = this.readIdentifier();
                    token.tokenType = this.lookupIdent(token.literal);
                    return token;
                }
                else if (this.isDigit(this.ch)) {
                    token.tokenType = TokenType.INT
                    token.literal = this.readNumber()
                    return token;
                }
                else {
                    token = this.newToken(TokenType.ILLEGAL, this.ch);
                }
                break;
        }

        this.readChar();
        return token;
    }

    private readChar(): void {
        if(this.readPosition >= this.input.length){
            this.ch = '\0'; //setting to the null character
        }
        else {
            this.ch = this.input[this.readPosition];
        }

        this.position = this.readPosition;

        this.readPosition++;
    }

    private newToken(tokenType: TokenType, ch: string): Token {
        return { tokenType, literal: ch };
    }

    private readIdentifier(): string {
        const position = this.position;

        while(this.isLetter(this.ch)){
            this.readChar();
        }

        return this.input.substring(position, this.position);
    }

    private isLetter(ch: string): boolean{
        return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch == '_';
    }

    private lookupIdent(ident: string): TokenType {
        if(this.keywords.has(ident)){
            return this.keywords.get(ident) as TokenType;
        }

        return TokenType.IDENT;
    }

    private initKeywords(): Map<string, TokenType> {
        return new Map( [
            ["fn", TokenType.FUNCTION],
            ["let", TokenType.LET],
        	["true", TokenType.TRUE],
        	["false", TokenType.FALSE],
        	["if", TokenType.IF],
        	["else", TokenType.ELSE],
        	["return", TokenType. RETURN]
        ]);

    }

    private skipWhitespaces(): void {
        while (this.ch === " " || this.ch === "\t" || this.ch === "\n" || this.ch === "\r") {
            this.readChar();
        }
    }

    private isDigit(ch: string): boolean {
        return '0' <= ch && ch <= '9';
    }

    private readNumber(): string{
        const position = this.position;

        while(this.isDigit(this.ch)){
            this.readChar();
        }

        return this.input.substring(position, this.position);
    }

    private peekChar(): string {
        if(this.readPosition >= this.input.length){
            return '\0';
        }

        return this.input[this.readPosition];
    }
}
