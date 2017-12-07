// node includes
const http = require('http');
const https = require('https');

// koa includes
const Koa = require('koa');
const logger = require('koa-logger')
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

// rates in USD pennies
const rates = {
  base: 1000,
  email: 0,
  domain: 0,
  sms: 100,
  voice: 500,
  snail: 1500
};

// 1 eth in USD pennies
const conversion = 42500;


const api = new Router({
  prefix: '/api'
});

api.get('/get-rates', async (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = {
    prices: rates,
    conversion
  };
});

const app = new Koa();

app.use(logger());
app.use(api.routes());
app.use(api.allowedMethods());

http.createServer(app.callback()).listen(3001);
https.createServer(app.callback()).listen(3002);
