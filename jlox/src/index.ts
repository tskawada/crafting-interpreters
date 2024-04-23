import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { Interpreter } from "./Interpreter";
import { sampleCode } from "./SampleCodes";
import { Resolver } from "./Resolver";

const SAMPLE_CODE = sampleCode();

const run = () => {
    try {
        const lexer = new Lexer(SAMPLE_CODE);
        const tokens = lexer.scan();
        const parser = new Parser(tokens);
        const statements = parser.parse();
        const interpreter = new Interpreter();
        const resolver = new Resolver(interpreter);
        resolver.resolve(statements);
        interpreter.interpret(statements);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

run();