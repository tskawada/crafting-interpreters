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

    private ancestor = (distance: number): Environment => {
        let environment: Environment = this;
        for (let i = 0; i < distance; i++) {
            environment = environment.enclosing!;
        }
        return environment;
    }

    public get = (name: Token): any => {
        if (this.values.has(name.lexeme)) {
            if (this.values.get(name.lexeme) !== null) return this.values.get(name.lexeme);
            else throw new RuntimeError(name, `Variable '${name.lexeme}' is not initialized.`);
        }
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
    }

    public getAt = (distance: number, name: string): any => {
        return this.ancestor(distance).values.get(name);
    }

    public assignAt = (distance: number, name: Token, value: any): void => {
        this.ancestor(distance).values.set(name.lexeme, value);
    }
}
