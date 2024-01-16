import { Environment } from "./Environment";
import { Expr, Stmt, Visitor } from "./Expr";
import { Token, TokenType } from "./Token";
import { Callable } from "./Callable";
import { Function } from "./Function";
import { RuntimeError } from "./RuntimeError";
import { Return } from "./Return";

export class Interpreter extends Visitor {
    public environment = new Environment();

    constructor() {
        super();
    }

    public visitExpressionStmt(stmt: InstanceType<typeof Stmt.Expression>) {
        this.evaluate(stmt.expression);
    }

    public visitFunctionStmt(stmt: InstanceType<typeof Stmt.Function>) {
        const func = new Function(stmt);
        this.environment.define(stmt.name.lexeme, func);
        return null;
    }

    public visitPrintStmt(stmt: InstanceType<typeof Stmt.Print>) {
        const value = this.evaluate(stmt.expression);
        console.log(value);
    }

    public visitReturnStmt(stmt: InstanceType<typeof Stmt.Return>) {
        let value = null;
        if (stmt.value !== null) value = this.evaluate(stmt.value);
        throw new Return(value);
    }

    public visitBlockStmt(stmt: InstanceType<typeof Stmt.Block>) {
        this.executeBlock(stmt.statements, new Environment(this.environment));
        return null;
    }

    public visitVarStmt(stmt: InstanceType<typeof Stmt.Var>) {
        let value = null;
        if (stmt.initializer !== null) {
            value = this.evaluate(stmt.initializer);
        }
        this.environment.define(stmt.name.lexeme, value);
        return TokenType.NIL;
    }

    public visitIfStmt(stmt: InstanceType<typeof Stmt.If>) {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch);
        } else if (stmt.elseBranch !== null) {
            this.execute(stmt.elseBranch);
        }
        return null;
    }

    public visitWhileStmt(stmt: InstanceType<typeof Stmt.While>) {
        while (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body);
        }
        return null;
    }

    public visitForStmt(stmt: InstanceType<typeof Stmt.For>) {
        if (stmt.initializer !== null) {
            this.execute(stmt.initializer);
        }
        while (stmt.condition === null || this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body);
            if (stmt.increment !== null) {
                this.evaluate(stmt.increment);
            }
        }
        return null;
    }

    public visitLiteralExpr(expr: InstanceType<typeof Expr.Literal>) {
        return expr.value;
    }

    public visitCallExpr(expr: InstanceType<typeof Expr.Call>) {
        const callee = this.evaluate(expr.callee);
        const args = [];
        for (const arg of expr.args) {
            args.push(this.evaluate(arg));
        }

        if (!(callee instanceof Function)) {
            throw new RuntimeError(expr.paren, "Can only call functions and classes.");
        }

        const func = callee as Callable;

        if (args.length !== func.arity()) {
            throw new RuntimeError(expr.paren, `Expected ${func.arity()} arguments but got ${args.length}.`);
        }

        return func.call(this, args);
    }

    public visitGroupingExpr(expr: InstanceType<typeof Expr.Grouping>) {
        return this.evaluate(expr.expression);
    }

    public visitBinaryExpr(expr: InstanceType<typeof Expr.Binary>): any {
        const right = this.evaluate(expr.right);
        const left = this.evaluate(expr.left);

        switch(expr.operator.tokenType) {
            case TokenType.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return left - right;
            case TokenType.SLASH:
                this.checkNumberOperands(expr.operator, left, right);
                return left / right;
            case TokenType.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return left * right;
            case TokenType.PLUS:
                if (typeof left === "number" && typeof right === "number") {
                    return left + right;
                }
                if (typeof left === "string" && typeof right === "string") {
                    return left + right;
                }
                throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.");
            case TokenType.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return left > right;
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left >= right;
            case TokenType.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return left < right;
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left <= right;
            case TokenType.BANG_EQUAL:
                return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL:
                return this.isEqual(left, right);
        }
        return null;
    }

    public visitLogicalExpr(expr: InstanceType<typeof Expr.Logical>): any {
        const left = this.evaluate(expr.left);

        if (this.isTruthy(left)) return left;
        return this.isTruthy(this.evaluate(expr.right));
    }

    public visitUnaryExpr(expr: InstanceType<typeof Expr.Unary>): any {
        const right = this.evaluate(expr.right);
        
        switch(expr.operator.tokenType) {
            case TokenType.BANG:
                return !this.isTruthy(right);
            case TokenType.MINUS:
                this.checkNumberOperand(expr.operator, right);
                return -right;
        }
        return null;
    }

    private checkNumberOperand(operator: Token, operand: any) {
        if (typeof operand === "number") return;
        throw new RuntimeError(operator, `Operand must be a number.`);
    }

    private checkNumberOperands(operator: Token, left: any, right: any) {
        if (typeof left === "number" && typeof right === "number") return;
        throw new RuntimeError(operator, `Operands must be numbers.`);
    }

    public visitVariableExpr(expr: InstanceType<typeof Expr.Variable>) {
        return this.environment.get(expr.name);
    }

    public visitAssignExpr(expr: InstanceType<typeof Expr.Assign>) {
        const value = this.evaluate(expr.value);
        this.environment.assign(expr.name, value);
        return value;
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

    public executeBlock(statements: Stmt[], environment: Environment) {
        const previous = this.environment;
        try {
            this.environment = environment;
            for (const statement of statements) {
                this.execute(statement);
            }
        } finally {
            this.environment = previous;
        }
    }
}