import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { Interpreter } from "./Interpreter";
import { sampleCode } from "./SampleCode";

const PRINT_DATA = true;

const SAMPLE_CODE = sampleCode();

const run = () => {
    try {
        const lexer = new Lexer(SAMPLE_CODE);
        const tokens = lexer.scan();
        const parser = new Parser(tokens);
        const statements = parser.parse();
        const interpreter = new Interpreter();
        interpreter.interpret(statements);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

run();