import * as fs from 'fs';

// dictionary of sample code file name
export const sampleCodeFileName = {
    fibonacci: 'fibonacci.lox',  // calc fibonacci number (recursive/iterative)
    rsa: 'rsa.lox',  // rsa encryption/decryption
}

const FILE_NAME = sampleCodeFileName.rsa;

export const sampleCode = (): string =>{
    return fs.readFileSync(`./src/samples/${FILE_NAME}`, 'utf8');
}
