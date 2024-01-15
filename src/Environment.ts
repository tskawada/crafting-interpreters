import { Token } from "./Token";

export class Environment {
    private values = new Map<string, any>();

    public define = (name: string, value: any): void => {
        this.values.set(name, value);
    }

    public get = (name: Token): any => {
        if (this.values.has(name.lexeme)) return this.values.get(name.lexeme);
    }

    public assign = (name: Token, value: any): void => {
        if (this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value);
            return;
        }
        throw new Error(`Undefined variable '${name.lexeme}'.`);
    }
}
