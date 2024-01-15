import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { Interpreter } from "./Interpreter";
import { AstTreePrinter } from "./AstTreePrinter";

const PRINT_DATA = true;

const SAMPLE_CODE = `
  2 * 3 + 4.2 * 1
`;

const run = () => {
    try {
        const lexer = new Lexer(SAMPLE_CODE);
        const tokens = lexer.scan();
        const parser = new Parser(tokens);
        const treeExpr = parser.parse();
        const interpreter = new Interpreter(treeExpr);
        const result = interpreter.interpret();
        
        if (PRINT_DATA) {
            console.log(`sample code:`);
            console.log(SAMPLE_CODE);
            console.log(`tokens:\n`);
            console.log(tokens);
            console.log(`\nast:\n`);
            console.log(new AstTreePrinter(treeExpr).print());
            console.log(`\nresult:\n`);
            console.log(result);
        }
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

run();