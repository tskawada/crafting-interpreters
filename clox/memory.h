#ifndef clox_memory_h
#define clox_memory_h

#include "common.h"

#define GROW_CAPACITY(capacity) \
    ((capacity) < 8 ? 8 : (capacity) * 2)

#define GROW_ARRAY(previous, type, oldCount, newCount) \
    (type*)reallocate(previous, sizeof(type) * (oldCount), sizeof(type) * (newCount))

void* reallocate(void* previous, size_t oldSize, size_t newSize);

#endif