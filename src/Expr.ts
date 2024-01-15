import { Token } from "./Token";

export interface ExprConstructor {
    new(...args: any[]): Expr
}

export abstract class Visitor {
    abstract visitBinaryExpr(expr: InstanceType<typeof Expr.Binary>): string;
    abstract visitGroupingExpr(expr: InstanceType<typeof Expr.Grouping>): string;
    abstract visitLiteralExpr(expr: InstanceType<typeof Expr.Literal>): string;
    abstract visitUnaryExpr(expr: InstanceType<typeof Expr.Unary>): string;
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

    // @ts-ignore
    public accept(visitor: Visitor): string {
        if (this instanceof Expr.Unary) return visitor.visitUnaryExpr(this);
        if (this instanceof Expr.Grouping) return visitor.visitGroupingExpr(this);
        if (this instanceof Expr.Literal) return visitor.visitLiteralExpr(this);
        if (this instanceof Expr.Binary) return visitor.visitBinaryExpr(this);
    } 
}