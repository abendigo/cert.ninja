SOLC ?= solc

.PHONY: all clean

all: build/CertNinja.json

clean:
	rm -rf build/ .node-xmlhttprequest*

build/CertNinja.json: CertNinja.sol
	mkdir -p build/
	$(SOLC) --optimize --combined-json abi,bin CertNinja.sol > build/CertNinja.json.tmp
	mv build/CertNinja.json.tmp build/CertNinja.json
