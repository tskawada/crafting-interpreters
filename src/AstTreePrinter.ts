import { Expr, Visitor } from "./Expr";

export class AstTreePrinter extends Visitor {
    constructor(private expr: Expr) {
        super();
    }

    public print() {
        return this.expr.accept(this);
    }

    public visitBinaryExpr(expr: InstanceType<typeof Expr.Binary>): string {
        return this.parenthesise(expr.operator.lexeme, expr.left, expr.right);
    }

    public visitGroupingExpr(expr: InstanceType<typeof Expr.Grouping>): string {
        return this.parenthesise("group", expr.expression);
    }

    public visitLiteralExpr(expr: InstanceType<typeof Expr.Literal>): string {
        if (expr.value === void 0) return "nil";
        return expr.value.toString();
    }

    public visitUnaryExpr(expr: InstanceType<typeof Expr.Unary>): string {
        return this.parenthesise(expr.operator.lexeme, expr.right);
    }

    private parenthesise(name: string, ...exprs: Expr[]) {
        const expressionData = exprs.map(expr => expr.accept(this)).join(" ");
        return `(${name}${expressionData})`;
    }
}
