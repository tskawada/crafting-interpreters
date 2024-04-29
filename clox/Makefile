CC=gcc

CFLAGS=-Wall -g
OPTFLAGS=-O2

TARGET=main

SOURCES=$(wildcard *.c)
OBJECTS=$(SOURCES:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(CFLAGS) $(OPTFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) $(OPTFLAGS) -c $<

clean:
	rm -f $(OBJECTS) $(TARGET)

install: $(TARGET)
	cp $(TARGET) /usr/local/bin

uninstall:
	rm -f /usr/local/bin/$(TARGET)