#include <time.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include "common.h"
#include "object.h"
#include "memory.h"

static Value clockNative(int argCount, Value* args) {
    return NUMBER_VAL((double)clock() / CLOCKS_PER_SEC);
}

static Value sleepMicrosec(int argCount, Value* args) {
    usleep(AS_NUMBER(args[0]));
    return NIL_VAL;
}

static Value isExists(int argCount, Value* args) {
    return BOOL_VAL(access(AS_CSTRING(args[0]), F_OK) != -1);
}

static Value loadFile(int argCount, Value* args) {
    FILE* file = fopen(AS_CSTRING(args[0]), "r");
    if (file == NULL) {
        return NIL_VAL;
    }

    fseek(file, 0, SEEK_END);
    size_t fileSize = ftell(file);
    rewind(file);

    char* buffer = ALLOCATE(char, fileSize + 1);
    if (buffer == NULL) {
        fclose(file);
        return NIL_VAL;
    }

    size_t bytesRead = fread(buffer, sizeof(char), fileSize, file);
    if (bytesRead < fileSize) {
        fclose(file);
        FREE_ARRAY(char, buffer, fileSize + 1);
        return NIL_VAL;
    }

    buffer[bytesRead] = '\0';
    fclose(file);

    return OBJ_VAL(takeString(buffer, bytesRead));
}

static Value max(int argCount, Value* args) {
    ObjArray* array = AS_ARRAY(args[0]);
    if (array->count == 0) return NIL_VAL;
    for (int i = 0; i < array->count; i++) {
        if (!IS_NUMBER(array->values[i])) {
            return NIL_VAL;
        }
    }
    int max = AS_NUMBER(array->values[0]);
    for (int i = 1; i < array->count; i++) {
        if (AS_NUMBER(array->values[i]) > max) {
            max = AS_NUMBER(array->values[i]);
        }
    }
    return NUMBER_VAL(max);
}

static Value min(int argCount, Value* args) {
    ObjArray* array = AS_ARRAY(args[0]);
    if (array->count == 0) return NIL_VAL;
    for (int i = 0; i < array->count; i++) {
        if (!IS_NUMBER(array->values[i])) {
            return NIL_VAL;
        }
    }
    int min = AS_NUMBER(array->values[0]);
    for (int i = 1; i < array->count; i++) {
        if (AS_NUMBER(array->values[i]) < min) {
            min = AS_NUMBER(array->values[i]);
        }
    }
    return NUMBER_VAL(min);
}