import { Token, TokenType } from "./Token";
import { Expr, Stmt } from "./Expr";

export class Parser {
    private current = 0;

    constructor(private tokens: Token[]) {}

    public parse(): Expr[] {
        const statements = [];
        while (!this.isAtEnd) {
            statements.push(this.declation());
        }
        return statements;
    }

    private declation(): Stmt {
        try {
            if (this.match(TokenType.VAR)) return this.varDeclation();
            return this.statement();
        }
        catch (err) {
            this.synchronize();
            return new Stmt.Expression(new Expr.Literal(null));
        }
    }

    private varDeclation(): Stmt {
        const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");
        let initializer = null;
        if (this.match(TokenType.EQUAL)) {
            initializer = this.expression;
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
        if (initializer !== null) return new Stmt.Var(name, initializer);
        return new Stmt.Var(name, new Expr.Literal(null));
    }

    private statement(): Expr {
        if (this.match(TokenType.PRINT)) return this.printStatement();
        return this.expressionStatement();
    }

    private printStatement(): Expr {
        const value = this.expression;
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new Stmt.Print(value);
    }

    private expressionStatement(): Expr {
        const expr = this.expression;
        this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
        return new Stmt.Expression(expr);
    }

    private get expression(): Expr {
        return this.assignment();
    }

    private assignment(): Expr {
        const expr = this.equality;

        if (this.match(TokenType.EQUAL)) {
            const equals = this.previous;
            const value = this.assignment();

            if (expr instanceof Expr.Variable) {
                const name = expr.name;
                return new Expr.Assign(name, value);
            }
        }

        return expr;
    }

    private get equality(): Expr {
        let expr = this.comparison;

        while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            const operator = this.previous;
            const right = this.comparison;
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    private get comparison(): Expr {
        let expr = this.addition;

        while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
            const operator = this.previous;
            const right = this.addition;
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    private get addition(): Expr {
        let expr = this.multiplication;

        while (this.match(TokenType.MINUS, TokenType.PLUS)) {
            const operator = this.previous;
            const right = this.multiplication;
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    private get multiplication(): Expr {
        let expr = this.unary;

        while (this.match(TokenType.SLASH, TokenType.STAR)) {
            const operator = this.previous;
            const right = this.unary;
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    private get unary(): Expr {
        if (this.match(TokenType.BANG, TokenType.MINUS)) {
            const operator = this.previous;
            const right = this.unary;
            return new Expr.Unary(operator, right);
        }

        return this.primary;
    }

    // @ts-ignore
    private get primary(): Expr {
        if (this.match(TokenType.FALSE)) return new Expr.Literal(false);
        if (this.match(TokenType.TRUE)) return new Expr.Literal(true);
        if (this.match(TokenType.NIL)) return new Expr.Literal(null);

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new Expr.Literal(this.previous.literalValue);
        }

        if (this.match(TokenType.IDENTIFIER)) {
            return new Expr.Variable(this.previous);
        }

        if (this.match(TokenType.LEFT_PAREN)) {
            const expr = this.expression;
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
            return new Expr.Grouping(expr);
        }
    }

    private consume(type: TokenType, message: string): Token {
        if (this.typeCheck(type)) return this.advance();

        throw new SyntaxError(`At '${this.peek.lexeme}' at ${this.peek.line}: ${message}`);
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.typeCheck(type)) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    private typeCheck(type: TokenType): boolean {
        if (this.isAtEnd) return false;
        return this.peek.tokenType === type;
    }

    private get peek(): Token {
        return this.tokens[this.current];
    }

    private get isAtEnd(): boolean {
        return this.peek.tokenType === TokenType.EOF;
    }

    private advance(): Token {
        if (!this.isAtEnd) this.current++;
        return this.previous;
    }

    private get previous(): Token {
        return this.tokens[this.current - 1];
    }

    private synchronize(): void {
        this.advance();

        while (!this.isAtEnd) {
            if (this.previous.tokenType === TokenType.SEMICOLON) return;

            switch (this.peek.tokenType) {
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return;
            }

            this.advance();
        }
    }
}