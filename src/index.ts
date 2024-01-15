import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { Interpreter } from "./Interpreter";

const PRINT_DATA = true;

const SAMPLE_CODE = `
    print \"Takeuchi Yuki\";
    print \"Hello, world!\";
    print 1 + 2 * 3;
    print 1 + 2 * 3 / 4;
    print 1 * (2 + 3) / 52;
`;

const run = () => {
    try {
        const lexer = new Lexer(SAMPLE_CODE);
        const tokens = lexer.scan();
        const parser = new Parser(tokens);
        const statements = parser.parse();
        const interpreter = new Interpreter();
        interpreter.interpret(statements);
        
        // if (PRINT_DATA) {
            // console.log(`sample code:`);
            // console.log(SAMPLE_CODE);
            // console.log(`tokens:\n`);
            // console.log(tokens);
            // console.log(`\nresult:\n`);
            // console.log(result);
        // }
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

run();