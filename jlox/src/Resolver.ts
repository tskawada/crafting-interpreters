import { Stmt, Expr, Visitor } from "./Expr";
import { Interpreter } from "./Interpreter";
import { Stack } from "typescript-collections";
import { Token } from "./Token";

enum FunctionType {
    NONE,
    FUNCTION,
}

export class Resolver implements Visitor {
    private scopes = new Stack<Map<string, boolean>>;
    private currentFunction = FunctionType.NONE;

    constructor(private interpreter: InstanceType<typeof Interpreter>) {
        this.interpreter = interpreter;
    }

    public visitBlockStmt(stmt: InstanceType<typeof Stmt.Block>): void {
        this.beginScope();
        this.resolve(stmt.statements);
        this.endScope();
    }

    public visitExpressionStmt(stmt: InstanceType<typeof Stmt.Expression>): void {
        this.resolve(stmt.expression);
    }

    public visitIfStmt(stmt: InstanceType<typeof Stmt.If>): void {
        this.resolve(stmt.condition);
        this.resolve(stmt.thenBranch);
        if (stmt.elseBranch !== null) this.resolve(stmt.elseBranch);
    }

    public visitPrintStmt(stmt: InstanceType<typeof Stmt.Print>): void {
        this.resolve(stmt.expression);
    }

    public visitReturnStmt(stmt: InstanceType<typeof Stmt.Return>): void {
        if (this.currentFunction === FunctionType.NONE) {
            throw new Error(`Cannot return from top-level code.`);
        }

        if (stmt.value !== null) this.resolve(stmt.value);
    }

    public visitFunctionStmt(stmt: InstanceType<typeof Stmt.Function>): void {
        this.declare(stmt.name);
        this.define(stmt.name);
        this.resolveFunction(stmt, FunctionType.FUNCTION);
    }

    public visitVarStmt(stmt: InstanceType<typeof Stmt.Var>): void {
        this.declare(stmt.name);
        if (stmt.initializer !== null) {
            this.resolve(stmt.initializer);
        }
        this.define(stmt.name);
    }

    public visitWhileStmt(stmt: InstanceType<typeof Stmt.While>): void {
        this.resolve(stmt.condition);
        this.resolve(stmt.body);
    }

    public visitForStmt(stmt: InstanceType<typeof Stmt.For>): void {
        if (stmt.initializer !== null) this.resolve(stmt.initializer);
        if (stmt.condition !== null) this.resolve(stmt.condition);
        if (stmt.increment !== null) this.resolve(stmt.increment);
        this.resolve(stmt.body);
    }

    public visitBinaryExpr(expr: InstanceType<typeof Expr.Binary>): void {
        this.resolve(expr.left);
        this.resolve(expr.right);
    }

    public visitCallExpr(expr: InstanceType<typeof Expr.Call>): void {
        this.resolve(expr.callee);
        expr.args.forEach((arg) => this.resolve(arg));
    }

    public visitGroupingExpr(expr: InstanceType<typeof Expr.Grouping>): void {
        this.resolve(expr.expression);
    }

    public visitLiteralExpr(expr: InstanceType<typeof Expr.Literal>): void {
        return;
    }

    public visitLogicalExpr(expr: InstanceType<typeof Expr.Logical>): void {
        this.resolve(expr.left);
        this.resolve(expr.right);
    }

    public visitUnaryExpr(expr: InstanceType<typeof Expr.Unary>): void {
        this.resolve(expr.right);
    }

    public visitVariableExpr(expr: InstanceType<typeof Expr.Variable>): void {
        if (!this.scopes.isEmpty() && this.scopes.peek()?.get(expr.name.lexeme) === false) {
            throw new Error(`Cannot read local variable in its own initializer.`);
        }
        this.resolveLocal(expr, expr.name);
    }

    public visitAssignExpr(expr: InstanceType<typeof Expr.Assign>): void {
        this.resolve(expr.value);
        this.resolveLocal(expr, expr.name);
    }

    public resolve(
        statements: InstanceType<typeof Stmt> | InstanceType<typeof Stmt>[] | InstanceType<typeof Expr>
    ): void {
        if (Array.isArray(statements)) {
            for (const statement of statements) {
                this.resolve(statement);
            }
        } else if (statements instanceof Stmt) {
            statements.accept(this);
        }
        if (statements instanceof Expr) {
            statements.accept(this);
        }
    }

    private resolveFunction(func: InstanceType<typeof Stmt.Function>, type: FunctionType): void {
        const enclosingFunction = this.currentFunction;
        this.currentFunction = type;

        this.beginScope();
        for (const param of func.params) {
            this.declare(param);
            this.define(param);
        }
        this.resolve(func.body);
        this.endScope();

        this.currentFunction = enclosingFunction;
    }

    private beginScope(): void {
        this.scopes.push(new Map<string, boolean>);
    }

    private endScope(): void {
        this.scopes.pop();
    }

    private declare(name: Token): void {
        if (this.scopes.isEmpty()) return;
        const scope = this.scopes.peek();

        if (scope?.has(name.lexeme)) throw new Error(`Variable with this name already declared in this scope.`);

        scope?.set(name.lexeme, false);
    }

    private define(name: Token): void {
        if (this.scopes.isEmpty()) return;
        const scope = this.scopes.peek();
        scope?.set(name.lexeme, true);
    }

    private resolveLocal(expr: InstanceType<typeof Expr>, name: Token): void {
        let index = this.scopes.size() - 1;
        this.scopes.forEach((scope) => {
            if (scope.has(name.lexeme)) this.interpreter.resolve(expr, this.scopes.size() - 1 - index);
            index--;
        });
    }
}
