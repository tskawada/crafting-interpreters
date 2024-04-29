#ifndef clox_compiler_h
#define clox_compiler_h

#include "scanner.h"
#include "chunk.h"
#include "object.h"

#ifdef DEBUG_PRINT_CODE
#include "debug.h"
#endif

#define UINT8_COUNT (UINT8_MAX + 1)

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

typedef struct {
    ParseFn prefix;
    ParseFn infix;
    Precedence precedence;
} ParseRule;

typedef struct {
    Local locals[UINT8_COUNT];
    int localCount;
    int scopeDepth;
} Compiler;

bool compile(const char* source, Chunk* chunk);
void expression();
ParseRule* getRule(TokenType type);
void parsePrecedence(Precedence precedence);
void declaration();
void statement();

#endif