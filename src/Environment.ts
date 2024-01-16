import { RuntimeError } from "./RuntimeError";
import { Token } from "./Token";

export class Environment {
    private enclosing: Environment | null = null;
    private values = new Map<string, any>();

    constructor(enclosing: Environment | null = null) {
        this.enclosing = enclosing;
    }

    public define = (name: string, value: any): void => {
        this.values.set(name, value);
    }

    public get = (name: Token): any => {
        if (this.values.has(name.lexeme)) return this.values.get(name.lexeme);
        if (this.enclosing !== null) return this.enclosing.get(name);
        throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    }

    public assign = (name: Token, value: any): void => {
        if (this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value);
            return;
        }

        if (this.enclosing !== null) {
            this.enclosing.assign(name, value);
            return;
        }

        throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);

        throw new Error(`Undefined variable '${name.lexeme}'.`);
    }
}
