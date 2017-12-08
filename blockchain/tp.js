const Web3 = require('web3');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));



        this.spec = require('../build/CertNinja.json');
        this.abi = JSON.parse(this.spec.contracts['CertNinja.sol:CertNinja'].abi);
        this.bin = this.spec.contracts['CertNinja.sol:CertNinja'].bin;

        this.CertNinja = this.web3.eth.contract(this.abi);



// how to create contract:

        this.CertNinja.new({data: "0x" + this.bin, from: this.userAddr, gas: 4000000}, (err, sc) => {
            if (err) return cb(err);
            if (!sc.address) return;
            this.sc = sc;
            this.contractAddr = this.normalizeAddr(this.sc.address);
            cb(undefined);
        });


// how to attach contract:

        this.sc = this.CertNinja.at(this.contractAddr);

