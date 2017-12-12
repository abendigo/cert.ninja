"use strict";

const Web3 = require('web3');
const cnUtils = require('./cnUtils.js');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

let ownerAddr = process.argv[2];

if (!ownerAddr) {
  console.log("Available addresses:", web3.eth.accounts);
  throw("must pass in owner address!");
}

ownerAddr = cnUtils.normalizeAddr(ownerAddr);

let { CertNinjaContract, certNinjaBin, } = cnUtils.loadCertNinjaContract(web3);

CertNinjaContract.new({data: "0x" + certNinjaBin, from: ownerAddr, gas: 4000000}, (err, ret) => {
  if (err) throw(err);
  if (!ret.address) return;
  console.log(`contractAddr: ${ret.address}`);
});
