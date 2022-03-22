# FLAGS =  -lembind -o compiled_processor_perf.js processor-perf.cpp --post-js ./mod.js -s ENVIRONMENT="shell"
# CC = emcc


DEPS = processor-perf.cpp

CPP = processor-perf.cpp

OUTPUT_JS = compiled_processor_perf.js

CC = emcc

FLAGS = --bind -O1 \
	  -s WASM=1 \
		-s BINARYEN_ASYNC_COMPILATION=0 \
		-s SINGLE_FILE=1 \
		-o $(OUTPUT_JS) $(DEPS) \
		--post-js ./mod.js

build: $(DEPS)
	@$(CC) $(FLAGS)

clean:
	@rm -f compiled_processor_perf.js