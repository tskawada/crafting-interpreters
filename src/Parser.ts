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
            if (this.match(TokenType.FUN)) return this.function("function");
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
        if (this.match(TokenType.RETURN)) return this.returnStatement();
        if (this.match(TokenType.WHILE)) return this.whileStatement();
        if (this.match(TokenType.FOR)) return this.forStatement();
        if (this.match(TokenType.LEFT_BRACE)) return new Stmt.Block(this.block());
        if (this.match(TokenType.IF)) return this.ifStatement();
        return this.expressionStatement();
    }

    private ifStatement(): Stmt {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
        const condition = this.expression;
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");

        const thenBranch = this.statement();
        let elseBranch = null;
        if (this.match(TokenType.ELSE)) {
            elseBranch = this.statement();
        }

        return new Stmt.If(condition, thenBranch, elseBranch);
    }

    private whileStatement(): Stmt {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
        const condition = this.expression;
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.");
        const body = this.statement();

        return new Stmt.While(condition, body);
    }

    private forStatement(): Stmt {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");
        let initializer = null;
        if (this.match(TokenType.SEMICOLON)) initializer = null;
        else if (this.match(TokenType.VAR)) initializer = this.varDeclation();
        else initializer = this.expressionStatement();

        let condition = null;
        if (!this.match(TokenType.SEMICOLON)) condition = this.expression;
        this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

        let increment = null;
        if (!this.match(TokenType.RIGHT_PAREN)) increment = this.expression;
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

        let body = this.statement();

        if (increment !== null) body = new Stmt.Block([body, new Stmt.Expression(increment)]);

        if (condition === null) condition = new Expr.Literal(true);
        body = new Stmt.While(condition, body);

        if (initializer !== null) body = new Stmt.Block([initializer, body]);

        return body;
    }

    private or = (): Expr => {
        let expr = this.and();

        while (this.match(TokenType.OR)) {
            const operator = this.previous;
            const right = this.and();
            expr = new Expr.Logical(expr, operator, right);
        }

        return expr;
    }

    private and = (): Expr => {
        let expr = this.equality;

        while (this.match(TokenType.AND)) {
            const operator = this.previous;
            const right = this.equality;
            expr = new Expr.Logical(expr, operator, right);
        }

        return expr;
    }

    private printStatement(): Expr {
        const value = this.expression;
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new Stmt.Print(value);
    }

    private returnStatement(): Stmt {
        const keyword = this.previous;
        let value = null;
        if (!this.typeCheck(TokenType.SEMICOLON)) {
            value = this.expression;
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after return value.");
        return new Stmt.Return(keyword, value);
    }

    private expressionStatement(): Expr {
        const expr = this.expression;
        this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
        return new Stmt.Expression(expr);
    }

    private function(kind: string): Stmt {
        const name = this.consume(TokenType.IDENTIFIER, `Expect ${kind} name.`);
        this.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} name.`);
        const params = [];
        if (!this.typeCheck(TokenType.RIGHT_PAREN)) {
            do {
                if (params.length >= 255) {
                    this.error(this.peek, "Can't have more than 255 parameters.");
                }

                params.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name."));
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");

        this.consume(TokenType.LEFT_BRACE, `Expect '{' before ${kind} body.`);
        const body = this.block();
        return new Stmt.Function(name, params, body);
    }

    private get expression(): Expr {
        return this.assignment();
    }

    private assignment(): Expr {
        const expr = this.or();

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

        return this.call();
    }

    private call(): Expr {
        let expr = this.primary;

        while (true) {
            if (this.match(TokenType.LEFT_PAREN)) {
                expr = this.finishCall(expr);
            }
            else {
                break;
            }
        }

        return expr;
    }

    private finishCall(callee: Expr): Expr {
        const args = [];
        if (!this.match(TokenType.RIGHT_PAREN)) {
            do {
                if (args.length >= 255) {
                    this.error(this.peek, "Can't have more than 255 arguments.");
                }
                args.push(this.expression);
            } while (this.match(TokenType.COMMA));
        }

        const paren = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");

        return new Expr.Call(callee, paren, args);
    }

    private error(token: Token, message: string): void {
        throw new SyntaxError(`At '${token.lexeme}' at ${token.line}: ${message}`);
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

    private block(): Stmt[] {
        const statements = [];

        while (!this.typeCheck(TokenType.RIGHT_BRACE) && !this.isAtEnd) {
            statements.push(this.declation());
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
        return statements;
    }
}