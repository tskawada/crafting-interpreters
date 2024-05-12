# clox

> [!NOTE]
> This is a C implementation of the Lox language.  
> It is based on [crafting-interpreters](https://www.craftinginterpreters.com/) but includes its own operator definitions and notation.

## Building and Running
```bash
make
```
The interpreter supports REPL and source file execution.

## Lox language
For more information on Lox, please refer to:
- [The Lox Language](https://www.craftinginterpreters.com/the-lox-language.html)
- [Appendix I - Lox Grammer](https://www.craftinginterpreters.com/appendix-i.html)

## Native functions
My implementation includes several native functions that are callable from Lox but implemented in C.

### clock()
Returns an estimate of the processor time used by the program in seconds.
- input: None.
- output: `NUMBER_VAL` type. 
- example:
    ```lox
    print clock();  // Internally used are clock() and CLOCKS_PER_SEC.
    ```

### rand()
Returns a pseudo-random integer between 0 and 1.
- input: None.
- output: `NUMBER_VAL` type. 
- example:
    ```lox
    print rand();  // Internally used are rand() and RAND_MAX.
    ```

### srand()
Initializes the pseudo-random number generator.
- input: `NUMBER_VAL` type seed.
- output: `NIL_VAL` type.
- example:
    ```lox
    srand(42);  // Internally used are srand().
    ```

### sleep()
Suspends the execution of the current thread in microseconds for the specified period.
- input: `NUMBER_VAL` type.
- output: `NIL_VAL` type.
- example:
    ```lox
    sleep(1);  // Internally used are usleep().
    ```

### isExists()
Checks if a file exists. If the file exists, it returns true; otherwise, it returns false.
- input: `STRING_VAL` type.
- output: `BOOL_VAL` type. 
- example:
    ```lox
    print isExists("test.txt");  // Internally used are access().
    ```

### loadFile()
Reads the content of a file and returns it as a string. If the read fails, NIL_VAL is returned. If successful, a string of type OBJ_VAL is returned.
- input: `STRING_VAL` type.
- output: (`OBJ_VAL` || `BOOL_VAL`) type.
- example:
    ```lox
    print loadFile("test.txt");  // Internally used are fopen(), fseek(), ftell(), rewind(), fread(), fclose().
    ```

### exit()
Exits the program with the specified status code.
- input: `NUMBER_VAL` type.
- output: `NIL_VAL` type.
- example:
    ```lox
    exit(0);  // Internally used are exit().
    ```
- description: In this implementation, normal termination is defined as 0 and abnormal termination as 1. Other status codes can be defined and used independently.
