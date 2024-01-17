import { Callable } from "./Callable";
import { Environment } from "./Environment";
import { Interpreter } from "./Interpreter";
import { Stmt } from "./Expr";

export class Function implements Callable {
    constructor(private declaration: InstanceType<typeof Stmt.Function>) {}

    public arity(): number {
        return this.declaration.params.length;
    }

    public call(interpreter: InstanceType<typeof Interpreter>, args: any[]): any {
        const environment = new Environment(interpreter.environment);
        for (let i = 0; i < this.declaration.params.length; i++) {
            environment.define(this.declaration.params[i].lexeme, args[i]);
        }

        try {
            interpreter.executeBlock(this.declaration.body, environment);
        } catch (returnValue: any) {
            return returnValue.value;
        }
        return null;
    }

    public toString(): string {
        return `<fn ${this.declaration.name.lexeme}>`;
    }
}