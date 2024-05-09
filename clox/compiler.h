#ifndef clox_compiler_h
#define clox_compiler_h

#include "scanner.h"
#include "chunk.h"
#include "object.h"

#ifdef DEBUG_PRINT_CODE
#include "debug.h"
#endif

typedef struct {
    Token current;
    Token previous;
    bool hadError;
    bool panicMode;
} Parser;

typedef enum {
    PREC_NONE,
    PREC_ASSIGNMENT,  // =
    PREC_OR,          // or
    PREC_AND,         // and
    PREC_EQUALITY,    // == !=
    PREC_COMPARISON,  // < > <= >=
    PREC_TERM,        // + -
    PREC_FACTOR,      // * /
    PREC_UNARY,       // ! -
    PREC_CALL,        // . ()
    PREC_PRIMARY
} Precedence;

typedef void (*ParseFn)(bool canAssign);

typedef struct {
    Token name;
    int depth;
} Local;

typedef enum {
    TYPE_FUNCTION,
    TYPE_SCRIPT
} FunctionType;

typedef struct {
    ParseFn prefix;
    ParseFn infix;
    Precedence precedence;
} ParseRule;

typedef struct Compiler {
    struct Compiler* enclosing;
    ObjFunction* function;
    FunctionType type;

    Local locals[UINT8_COUNT];
    int localCount;
    int scopeDepth;
} Compiler;

ObjFunction* compile(const char* source);
void expression();
ParseRule* getRule(TokenType type);
void parsePrecedence(Precedence precedence);
void declaration();
void statement();

#endif