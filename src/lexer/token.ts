export enum TokenType {
    ILLEGAL,
    EOF,
    IDENT,
    INT,
    ASSIGN,
    PLUS,
    COMMA,
    SEMICOLON,
    LPAREN,
    RPAREN,
    LBRACE,
    RBRACE,
    MINUS,
    BANG,
    ASTERISK,
    SLASH,
    LT,
    GT,

    //keywords
    FUNCTION,
    LET,
    TRUE,
    FALSE,
    IF,
    ELSE,
    RETURN,

    NOTEQUAL,
    EQUAL,
}

export type Token = {
    tokenType: TokenType,
    literal: string
}
