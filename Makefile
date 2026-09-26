.PHONY: all test ci build type-check docs clean

STAMP_DIR := .make
BUILD_STAMP := $(STAMP_DIR)/build
TYPE_CHECK_STAMP := $(STAMP_DIR)/type-check

CXX ?= g++
CXXFLAGS += -std=c++20 -O3

TS_SOURCES := $(shell find src -type f -name '*.ts' -print) index.ts

BUILD_INPUTS := \
	$(TS_SOURCES) \
	package.json \
	package-lock.json \
	tsconfig.json \
	tsdown.config.ts

all: type-check test

test: build test/generators/oracle test/seeds/oracle
	npm run type-test
	npm test

build: $(BUILD_STAMP)

$(BUILD_STAMP): $(BUILD_INPUTS)
	@mkdir -p $(STAMP_DIR)
	npm run build
	@touch $@

type-check: $(TYPE_CHECK_STAMP)

$(TYPE_CHECK_STAMP): $(TS_SOURCES) tsconfig.json
	@mkdir -p $(STAMP_DIR)
	npm run type-check
	@touch $@

test/generators/oracle: test/generators/oracle.cpp test/engines.hpp Makefile
	$(CXX) $(CXXFLAGS) $< -o $@

test/seeds/oracle: test/seeds/oracle.cpp test/engines.hpp Makefile
	$(CXX) $(CXXFLAGS) $< -o $@

docs:
	npm run typedoc

ci: clean
	npm ci
	$(MAKE) all

clean:
	rm -rf dist docs $(STAMP_DIR)
	rm -f test/generators/oracle test/seeds/oracle
