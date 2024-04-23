export class Return extends Error {
    constructor(public value: any) {
        super();
        this.value = value;
    }
}