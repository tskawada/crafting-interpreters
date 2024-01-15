import { inspect } from "util";

export enum TokenType {
    LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
    COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR,

    BANG, BANG_EQUAL,
    EQUAL, EQUAL_EQUAL,
    GREATER, GREATER_EQUAL,
    LESS, LESS_EQUAL,

    IDENTIFIER, STRING, NUMBER,

    AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR,
    PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE,

    EOF,
}

export interface Token {
    tokenType: TokenType,
    line: number,
    lexeme: string,
    literalValue?: any,
    [inspect.custom](): string,
    toString(): string,
};

export const createToken = (
    tokenType: TokenType, 
    line: number, 
    lexeme: string, 
    literalValue?: any
) => {
    return {
        tokenType,
        line,
        lexeme,
        literalValue,

        [inspect.custom]() {
            return `Token [${this.toString()}]`;
        },

        toString() {
            return `code = ${this.tokenType}, lexeme = ${this.lexeme}, value = ${this.literalValue}`;
        }
    }
};