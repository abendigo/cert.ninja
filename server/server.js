// node includes
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

// misc includes
const ethUtil = require('ethereumjs-util');
const BigNumber = require('bignumber.js');
const yaml = require('js-yaml');
const lmdb = require('node-lmdb');
const Web3 = require('web3');

// koa includes
const Koa = require('koa');
const logger = require('koa-logger')
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');

// cert ninja includes
const validators = require('./validators.js');
const cnUtils = require('../contract/scripts/cnUtils.js');



// config

let config = yaml.safeLoad(fs.readFileSync('./config.yaml', 'utf8'));

let ethUsd = 45000;

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(config.web3Endpoint));

let { CertNinjaContract, } = cnUtils.loadCertNinjaContract(web3);
let certNinjaInstance = CertNinjaContract.at(cnUtils.normalizeAddr(config.contractAddr));



// DB setup

const env = new lmdb.Env();

env.open({
  path: __dirname + '/data',
  maxDbs: 100,
  mapSize: 200*1024*1024*1024,
});

// keys are invoice secrets
const dbInvoice = env.openDbi({
  name: 'invoice',
  create: true
});

// keys are invoice secrets
const dbSecret = env.openDbi({
  name: 'secret',
  create: true
});

// keys are certHashes
const dbCert = env.openDbi({
  name: 'cert',
  create: true
});

// keys are ethereum addresses
const dbCertHash = env.openDbi({
  name: 'certHash',
  create: true
});




// API

const api = new Router({
  prefix: '/api'
});

api.get('/get-rates', async (ctx) => {
  ctx.response.status = 200;
  ctx.headers['Access-Control-Allow-Origin'] = '*';
  ctx.response.body = {
    pricing: config.pricing,
    ethUsd,
  };
});

api.post('/create-invoice', async (ctx) => {
  let invoice = {
    invoiceId: getRandToken(),
    invoiceSecret: getRandToken(),

    request: {},
  };

  let amountCents = config.pricing.base;

  for (let method of ['email', 'domain', 'sms', 'phone', 'snailmail']) {
    if (ctx.request.body[method] !== undefined) {
      invoice.request[method] = ctx.request.body[method];
      amountCents += config.pricing[method];
    }
  }

  if (ctx.request.body['domain']) invoice.domainKey = getRandToken();

  invoice.request.ethAddr = ctx.request.body.ethAddr;

  invoice.amount = ethToWei(new BigNumber(amountCents).div(ethUsd)).toString();
  invoice.invoiceInitiated = getUnixTime();
  invoice.contractAddr = config.contractAddr;
  invoice.payBy = invoice.invoiceInitiated + (parseInt(config.paymentExpiryDays) * 86400);

  invoice.sig = signInvoice(invoice);


  const txn = env.beginTxn();
  txn.putString(dbInvoice, invoice.invoiceSecret, JSON.stringify(invoice));
  txn.commit();


  ctx.response.status = 200;
  ctx.response.body = { result: 'OK', };


  let link = `https://cert.ninja/request/${invoice.invoiceSecret}`;

  let emailBody = `Hello!

We received a certificate request for your email. To continue processing this request, please click here:

${link}

If you did not request this email, please disregard or email support@cert.ninja

Regards,

Cert Ninja
https://cert.ninja
`;

  if (config.mailgun && config.mailgun.apiKey) {
    validators.sendMailgun(config, 'noreply@cert.ninja', invoice.request.email, 'Your cert.ninja Certificate Request', emailBody, (err, resp) => {
    });
  } else {
    console.log(`Mailgun not configured: Would've sent email to ${invoice.request.email}:`);
    console.log(emailBody);
  }
});

api.post('/invoice-status', async (ctx) => {
  let invoiceJson;

  {
    const txn = env.beginTxn({ readOnly: true, });
    invoiceJson = txn.getString(dbInvoice, ctx.request.body.invoiceSecret);
    txn.commit();
  }

  if (!invoiceJson) {
    ctx.response.status = 404;
    return;
  }

  let invoice = JSON.parse(invoiceJson);

  if (!invoice.validated || !invoice.validated.email) {
    // On first load of this end-point, validate email
    const txn = env.beginTxn();
    invoiceJson = txn.getString(dbInvoice, ctx.request.body.invoiceSecret);
    invoice = JSON.parse(invoiceJson);
    if (!invoice.validated) invoice.validated = {};
    if (!invoice.validated.email) invoice.validated.email = getUnixTime();
    txn.putString(dbInvoice, invoice.invoiceSecret, JSON.stringify(invoice));
    txn.commit();
  }

  if (invoice.paid) {
    ctx.response.status = 200;
    ctx.response.body = invoice;
  } else {
    return new Promise((resolve, reject) => {
      certNinjaInstance.isInvoicePaid.call('0x'+invoice.invoiceId, (err, paid) => {
        if (err) {
          console.error("web3 error: " + err);
          reject();
          return;
        }

        if (paid) {
          const txn = env.beginTxn({ readOnly: true, });
          invoiceJson = txn.getString(dbInvoice, ctx.request.body.invoiceSecret);
          invoice = JSON.parse(invoiceJson);
          invoice.paid = true;
          txn.putString(dbInvoice, invoice.invoiceSecret, JSON.stringify(invoice));
          txn.commit();
        }

        ctx.response.status = 200;
        ctx.response.body = invoice;

        resolve();
      });
    });
  }
});


// server logic

const app = new Koa();
app.use(bodyParser());
app.use(cors());

app.use(logger());
app.use(api.routes());
app.use(api.allowedMethods());

const server = http.createServer(app.callback()).listen(3001, () => {
  console.log('SERVER STARTED');

  let shutdown = () => {
    console.log('SERVER SHUTTING DOWN');

    server.close(() => {
      dbInvoice.close();
      env.close();

      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
});





// utils

function getRandToken() {
  return crypto.randomBytes(32).toString('hex');
}

function ethToWei(eth) {
  return eth.mul(new BigNumber("1000000000000000000")).floor();
}

function weiToEth(wei) {
  return wei.floor().div(new BigNumber("1000000000000000000"));
}

function signWithPrivateKey(msg, privateKey) {
    let msgHash = ethUtil.sha3(Buffer.concat([
        new Buffer("\x19Ethereum Signed Message:\n" + msg.length),
        msg,
    ]));

    let sig = ethUtil.ecsign(msgHash, new Buffer(privateKey, 'hex'));
    sig.r = sig.r.toString('hex');
    sig.s = sig.s.toString('hex');
    sig.v = normalizeComponent(sig.v, 8);

    return sig;
}

function signInvoice(invoice) {
    let raw = [
        normalizeComponent(config.contractAddr, 160),
        normalizeComponent(invoice.request.ethAddr, 160),
        normalizeComponent(invoice.invoiceId, 256),
        normalizeComponent(new BigNumber(invoice.amount), 256),
        normalizeComponent(invoice.payBy, 64),
    ].join('');

    return sig = signWithPrivateKey(ethUtil.sha3(new Buffer(raw, 'hex')), config.adminKey.private);
}

function getUnixTime() {
  return Math.floor(Date.now() / 1000);
}

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
