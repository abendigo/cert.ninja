// node includes
const http = require('http');

// koa includes
const Koa = require('koa');
const logger = require('koa-logger')
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

// db
const lmdb = require('node-lmdb');




const env = new lmdb.Env();
env.open({
  path: __dirname + '/data',
});
const db = env.openDbi({
  name: 'stuff',
  create: true
});

const txn = env.beginTxn();
const r = txn.getString(db, 'rates');

let rates;
if (r) {
  rates = JSON.parse(r);
} else {
  console.log('SEEDING RATES');
  rates = {
    base: 1000,
    email: 0,
    domain: 0,
    sms: 100,
    voice: 500,
    snail: 1500
  };
  txn.putString(db, 'rates', JSON.stringify(rates));
}

let ethusd = txn.getNumber(db, 'ethusd');
if (!ethusd) {
  console.log('SEEDING ETHUSD');
  ethusd = 45000; // $450.00
  txn.putNumber(db, 'ethusd', ethusd);
}

txn.commit();




const api = new Router({
  prefix: '/api'
});

api.get('/get-rates', async (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = {
    prices: rates,
    ethusd: ethusd
  };
});

const app = new Koa();

app.use(logger());
app.use(api.routes());
app.use(api.allowedMethods());

const server = http.createServer(app.callback()).listen(3001, () => {
  console.log('SERVER STARTED');

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
});

function shutdown() {
  console.log('shutting down');

  server.close(() => {
    db.close();
    env.close();

    process.exit(0);
  })
}


