export enum TokenType {
    ILLEGAL = "Illegal",
    EOF = "Eof",
    IDENT = "Ident",
    INT = "Int",
    ASSIGN = "Assign",
    PLUS = "Plus",
    COMMA = "Comma",
    SEMICOLON = "Semicolon",
    LPAREN = "Lparen",
    RPAREN = "Rparen",
    LBRACE = "Lbrace",
    RBRACE = "Rbrace",
    MINUS = "Minus",
    BANG = "Bang",
    ASTERISK = "Asterisk",
    SLASH = "Slash",
    LT = "Lt",
    GT = "Gt",
    FUNCTION = "Function",
    LET = "Let",
    TRUE = "True",
    FALSE = "False",
    IF = "If",
    ELSE = "Else",
    RETURN = "Return",
    NOTEQUAL = "Notequal",
    EQUAL = "Equal",
}

export type Token = {
    tokenType: TokenType,
    literal: string
}
