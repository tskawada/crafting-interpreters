import { createToken, Token, TokenType } from "./Token";

const keywords: Record<string, TokenType> = {
    "and": TokenType.AND,
    "class": TokenType.CLASS,
    "else": TokenType.ELSE,
    "false": TokenType.FALSE,
    "for": TokenType.FOR,
    "fun": TokenType.FUN,
    "if": TokenType.IF,
    "nil": TokenType.NIL,
    "or": TokenType.OR,
    "print": TokenType.PRINT,
    "return": TokenType.RETURN,
    "super": TokenType.SUPER,
    "this": TokenType.THIS,
    "true": TokenType.TRUE,
    "var": TokenType.VAR,
    "while": TokenType.WHILE,
};

const isDigit = (digit: string): boolean => {
    // @ts-ignore
    if (isNaN(digit)) return false;
    var x = parseInt(digit);
    return (x | 0) === x;
}

const isAlpha = (char: string): boolean => {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
}

const isAlphaNumeric = (char: string): boolean => {
    return isAlpha(char) || isDigit(char);
}

const flattenStr = (s: string): string => {
    // @ts-ignore
    s | 0;
    return s;
}

export class Lexer {
    public tokens: Token[] = [];
    private start = 0;
    private current = 0;
    private line = 1;

    constructor(private source: string) { }

    public scan = (): Token[] => {
        try {
            this.source = flattenStr(this.source);
            while (!this.isAtEnd) {
                this.start = this.current;
                this.scanToken();
            }

            this.tokens.push(createToken(TokenType.EOF, this.line, ""));
            return this.tokens;
        } catch (err) {
            throw err;
        }
    }

    public scanToken = (): void => {
        const c = this.advance();
        switch (c) {
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': this.addToken(TokenType.STAR); break;
            case '!': this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); break;
            case '=': this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
            case '<': this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
            case '>': this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
            case '/':
                if (this.match('/')) {
                    while (this.peek() !== '\n' && !this.isAtEnd) this.advance();
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                break;
            case '\n':
                this.line++;
                break;
            case '\"': this.string(); break;
            default:
                if (isDigit(c)) {
                    this.number();
                } else if (isAlpha(c)) {
                    this.identifier();
                } else {
                    throw new SyntaxError(`Unexpected character ${c} at line ${this.line}`);
                }
                break;
            }
    }

    private identifier = (): void => {
        while (isAlphaNumeric(this.peek())) this.advance();
        const text = this.source.slice(this.start, this.current);
        let type = keywords[text];
        if (!type) type = TokenType.IDENTIFIER;
        const val = type === TokenType.TRUE ? true : type === TokenType.FALSE ? false: void 0;
        this.addToken(type, val, text);
    }

    private number = (): void => {
        while (isDigit(this.peek())) this.advance();
        let isFloat = false;

        if (this.peek() === '.' && isDigit(this.peekNext())) {
            isFloat = true;
            this.advance();
            while (isDigit(this.peek())) this.advance();
        }

        const resNumber = this.source.slice(this.start, this.current);
        const finalNumber = isFloat ? parseFloat(resNumber) : parseInt(resNumber);
        this.addToken(TokenType.NUMBER, finalNumber);
    }

    private string = (): void => {
        while (this.peek() !== '\"' && !this.isAtEnd) {
            if (this.peek() === '\n') this.line++;
            this.advance();
        }

        if (this.isAtEnd) {
            throw new SyntaxError(`Unterminated string at line ${this.line}`);
        }

        this.advance();

        const value = this.source.slice(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }

    private peek = (): string => {
        if (this.isAtEnd) return '\0';
        return this.source[this.current];
    }

    private advance = (): string => {
        this.current++;
        return this.source[this.current - 1];
    }

    private peekNext = (): string => {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source[this.current + 1];
    }

    private addToken = (type: TokenType, literal?: any, slicedStr?: string): void => {
        const newToken = createToken(type, this.line, slicedStr || this.source.slice(this.start, this.current), literal);
        this.tokens.push(newToken);
    }

    private match = (expected: string): boolean => {
        if (this.isAtEnd) return false;
        if (this.source[this.current] !== expected) return false;
        this.current++;
        return true;
    }

    private get isAtEnd(): boolean {
        return this.current >= this.source.length;
    }
}