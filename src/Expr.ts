import { Token } from "./Token";

export interface ExprConstructor {
    new(...args: any[]): Expr
}

export interface StmtConstructor {
    new(...args: any[]): Stmt
}

export abstract class Visitor {
    abstract visitBinaryExpr(expr: InstanceType<typeof Expr.Binary>): string;
    abstract visitGroupingExpr(expr: InstanceType<typeof Expr.Grouping>): string;
    abstract visitLiteralExpr(expr: InstanceType<typeof Expr.Literal>): string;
    abstract visitLogicalExpr(expr: InstanceType<typeof Expr.Logical>): string;
    abstract visitUnaryExpr(expr: InstanceType<typeof Expr.Unary>): string;
    abstract visitVariableExpr(expr: InstanceType<typeof Expr.Variable>): string;
    abstract visitAssignExpr(expr: InstanceType<typeof Expr.Assign>): string;
    abstract visitExpressionStmt(stmt: InstanceType<typeof Stmt.Expression>): void;
    abstract visitPrintStmt(stmt: InstanceType<typeof Stmt.Print>): void;
    abstract visitBlockStmt(stmt: InstanceType<typeof Stmt.Block>): void;
    abstract visitVarStmt(stmt: InstanceType<typeof Stmt.Var>): void; 
    abstract visitIfStmt(stmt: InstanceType<typeof Stmt.If>): void;
    abstract visitWhileStmt(stmt: InstanceType<typeof Stmt.While>): void;
    abstract visitForStmt(stmt: InstanceType<typeof Stmt.For>): void;
}

export abstract class Stmt {
    static Expression = class extends Stmt {
        constructor(public expression: Stmt) {
            super();
        }
    }

    static Print = class extends Stmt {
        constructor(public expression: Stmt) {
            super();
        }
    }

    static Var = class extends Stmt {
        constructor(public name: Token, public initializer: Expr) {
            super();
        }
    }

    static Block = class extends Stmt {
        constructor(public statements: Stmt[]) {
            super();
        }
    }

    static If = class extends Stmt {
        constructor(public condition: Expr, public thenBranch: Stmt, public elseBranch: Stmt | null) {
            super();
        }
    }

    static While = class extends Stmt {
        constructor(public condition: Expr, public body: Stmt) {
            super();
        }
    }

    static For = class extends Stmt {
        constructor(public initializer: Stmt | null, public condition: Expr | null, public increment: Expr | null, public body: Stmt) {
            super();
        }
    }

    // @ts-ignore
    public accept(visitor: Visitor): void {
        if (this instanceof Stmt.Expression) return visitor.visitExpressionStmt(this);
        if (this instanceof Stmt.Print) return visitor.visitPrintStmt(this);
        if (this instanceof Stmt.Block) return visitor.visitBlockStmt(this);
        if (this instanceof Stmt.Var) return visitor.visitVarStmt(this);
        if (this instanceof Stmt.If) return visitor.visitIfStmt(this);
        if (this instanceof Stmt.While) return visitor.visitWhileStmt(this);
        if (this instanceof Stmt.For) return visitor.visitForStmt(this);
    }
}

export abstract class Expr {
    static Binary = class extends Expr {
        constructor(public left: Expr, public operator: Token, public right: Expr) {
            super();
        }
    };

    static Unary = class extends Expr {
        constructor(public operator: Token, public right: Expr) {
            super();
        }
    };

    static Literal = class extends Expr {
        constructor(public value: any) {
            super();
        }
    };

    static Grouping = class extends Expr {
        constructor(public expression: Expr) {
            super();
        }
    };

    static Variable = class extends Expr {
        constructor(public name: Token) {
            super();
        }
    };

    static Assign = class extends Expr {
        constructor(public name: Token, public value: Expr) {
            super();
        }
    };

    static Logical = class extends Expr {
        constructor(public left: Expr, public operator: Token, public right: Expr) {
            super();
        }
    };

    // @ts-ignore
    public accept(visitor: Visitor): (string | void) {
        if (this instanceof Expr.Unary) return visitor.visitUnaryExpr(this);
        if (this instanceof Expr.Grouping) return visitor.visitGroupingExpr(this);
        if (this instanceof Expr.Literal) return visitor.visitLiteralExpr(this);
        if (this instanceof Expr.Binary) return visitor.visitBinaryExpr(this);
        if (this instanceof Expr.Variable) return visitor.visitVariableExpr(this);
        if (this instanceof Expr.Assign) return visitor.visitAssignExpr(this);
        if (this instanceof Expr.Logical) return visitor.visitLogicalExpr(this);
    }
}