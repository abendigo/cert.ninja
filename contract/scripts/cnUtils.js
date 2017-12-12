"use strict";

const BigNumber = require('bignumber.js');

function normalizeComponent(inp, bits) {
    if (inp instanceof Buffer) inp = inp.toString('hex');
    else if (typeof(inp) === 'number') inp = (new BigNumber(inp)).floor().toString(16);
    else if (typeof(inp) === 'string') {}
    else if (typeof(inp) === 'object' && inp.isBigNumber) inp = inp.floor().toString(16);
    else throw("unexpected type: " + typeof(inp));

    if (inp.substring(0, 2) === '0x') inp = inp.substring(2);
    inp = "0".repeat(Math.max(0, (bits/4) - inp.length)) + inp;

    if (inp.length > (bits/4)) throw("input too long");

    return inp;
}

function normalizeAddr(addr) {
  addr = addr.toLowerCase();
  if (addr.substr(0, 2) !== '0x') addr = '0x'+addr;
  if (addr.length !== 42) throw(`bad address length: ${addr}`);
  return addr;
}

function normalizeHash(hash) {
  hash = hash.toLowerCase();
  if (hash.substr(0, 2) === '0x') hash = hash.substr(2);
  if (hash.length !== 64) throw(`bad hash length: ${hash}`);
  return hash;
}

function loadCertNinjaContract(web3) {
  let spec = require('../build/CertNinja.json');
  let certNinjaAbi = JSON.parse(spec.contracts['CertNinja.sol:CertNinja'].abi);
  let certNinjaBin = spec.contracts['CertNinja.sol:CertNinja'].bin;
  return { CertNinjaContract: web3.eth.contract(certNinjaAbi), certNinjaBin, certNinjaAbi, };
}

function sendTX(web3, inst, method, userAddr, privateKey, contractAddr, args, opts, waitForMine, cb) {
  let callObject = {
      to: contractAddr,
      from: userAddr,
      data: inst[method].getData.apply(this, args),
      gas: 200000,
  };

  if (opts.value) callObject.value = opts.value;

  let txMadeCb = (err, val) => {
      if (err) return cb(err);
      if (waitForMine) watchTX(web3, val, cb);
      else cb(err, val);
  };

  if (privateKey) {
      web3.eth.getTransactionCount(userAddr, (err, transactionCount) => {
          if (err) return cb(err);

          callObject.nonce = transactionCount;

          let tx = new ethTx(callObject);
          tx.sign(privateKey);
          let serializedTx = tx.serialize();
          web3.eth.sendRawTransaction('0x'+serializedTx.toString('hex'), txMadeCb);
      });
  } else {
      web3.eth.sendTransaction(callObject, txMadeCb);
  }
}

let watchedTXs = {};
let watchTXIntervals = {};

function watchTX(web3, txHash, cb) {
  watchedTXs[txHash] = () => {
      web3.eth.getTransactionReceipt(txHash, (err, val) => {
          if (err) {
              console.error(err);
              return;
          }

          if (!watchedTXs[txHash] || !val || !val.blockNumber) return;
          delete watchedTXs[txHash];

          if (watchTXIntervals[txHash]) {
              clearInterval(watchTXIntervals[txHash]);
              delete watchTXIntervals[txHash];
          }

          cb(undefined, val);
      });
  };

  watchTXIntervals[txHash] = setInterval(watchedTXs[txHash], 1000);

  watchedTXs[txHash]();
}

module.exports = {
  normalizeComponent,
  normalizeAddr,
  normalizeHash,
  loadCertNinjaContract,
  sendTX,
};
