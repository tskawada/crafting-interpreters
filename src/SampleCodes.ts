import * as fs from 'fs';

export const sampleCode = (): string =>{
    return fibonacci();
}

export const fibonacci = (): string => {
    const data = fs.readFileSync('./src/samples/fibonacci.lox', 'utf8');
    return data;
}

