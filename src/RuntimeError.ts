import { Token } from "./Token";

export class RuntimeError extends Error {
    constructor(token: Token, message: string) {
        super(message);
    }
}