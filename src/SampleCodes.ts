import * as fs from 'fs';

export const sampleCode = (): string =>{
    return rsa();
}

export const fibonacci = (): string => {
    const data = fs.readFileSync('./src/samples/fibonacci.lox', 'utf8');
    return data;
}

export const rsa = (): string => {
    const data = fs.readFileSync('./src/samples/rsa.lox', 'utf8');
    return data;
}
