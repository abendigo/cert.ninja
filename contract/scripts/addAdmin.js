"use strict";

const Web3 = require('web3');
const cnUtils = require('./cnUtils.js');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

let ownerAddr = process.argv[2];
let contractAddr = process.argv[3];
let adminAddr = process.argv[4];

if (!ownerAddr) {
  console.log("Available accounts: ", web3.eth.accounts);
  throw("must pass in owner address!");
}

if (!contractAddr) throw("must pass in contract addr");
if (!adminAddr) throw("must pass in admin addr");

ownerAddr = cnUtils.normalizeAddr(ownerAddr);
contractAddr = cnUtils.normalizeAddr(contractAddr);
adminAddr = cnUtils.normalizeAddr(adminAddr);


let { CertNinjaContract, } = cnUtils.loadCertNinjaContract(web3);

let certNinjaInstance = CertNinjaContract.at(contractAddr);


cnUtils.sendTX(web3, certNinjaInstance, 'addAdmin', ownerAddr, null, contractAddr, ["0x"+adminAddr], {}, true, (err, tx) => {
  if (err) throw(err);
  console.log("ADDED ADMIN: " + adminAddr);
});
