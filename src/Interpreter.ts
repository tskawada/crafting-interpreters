import { Expr, Stmt, Visitor } from "./Expr";
import { TokenType } from "./Token";

export class Interpreter extends Visitor {
    constructor() {
        super();
    }

    public visitExpressionStmt(stmt: InstanceType<typeof Stmt.Expression>) {
        this.evaluate(stmt.expression);
    }

    public visitPrintStmt(stmt: InstanceType<typeof Stmt.Print>) {
        const value = this.evaluate(stmt.expression);
        console.log(value);
    }

    public visitLiteralExpr(expr: InstanceType<typeof Expr.Literal>) {
        return expr.value;
    }

    public visitGroupingExpr(expr: InstanceType<typeof Expr.Grouping>) {
        return this.evaluate(expr.expression);
    }

    public visitBinaryExpr(expr: InstanceType<typeof Expr.Binary>): any {
        const right = this.evaluate(expr.right);
        const left = this.evaluate(expr.left);

        switch(expr.operator.tokenType) {
            case TokenType.MINUS:
                return left - right;
            case TokenType.SLASH:
                return left / right;
            case TokenType.STAR:
                return left * right;
            case TokenType.PLUS:
                if (typeof left === "number" && typeof right === "number") {
                    return left + right;
                }
                if (typeof left === "string" && typeof right === "string") {
                    return left + right;
                }
                throw new Error("Operands must be two numbers or two strings.");
            case TokenType.GREATER:
                return left > right;
            case TokenType.GREATER_EQUAL:
                return left >= right;
            case TokenType.LESS:
                return left < right;
            case TokenType.LESS_EQUAL:
                return left <= right;
            case TokenType.BANG_EQUAL:
                return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL:
                return this.isEqual(left, right);
        }
        return null;
    }

    public visitUnaryExpr(expr: InstanceType<typeof Expr.Unary>): any {
        const right = this.evaluate(expr.right);
        
        switch(expr.operator.tokenType) {
            case TokenType.BANG:
                return !this.isTruthy(right);
            case TokenType.MINUS:
                return -right;
        }
        return null;
    }

    private isTruthy(obj: any) {
        if (obj === null) return false;
        if (typeof obj === "boolean") return obj;
        return true;
    }

    private isEqual(a: any, b: any) {
        if (a === null && b === null) return true;
        if (a === null) return false;
        return a === b;
    }

    private evaluate(expr: Expr): any {
        return expr.accept(this);
    }

    private execute(stmt: Stmt): void {
        stmt.accept(this);
    }

    public interpret(statements: Stmt[]) {
        try {
            for (const statement of statements) {
                this.execute(statement);
            }
        } catch (err) {
            throw err;
        }
    }
}