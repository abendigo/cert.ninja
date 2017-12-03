// node includes
const http = require('http');
const https = require('https');

// koa includes
const Koa = require('koa');
const logger = require('koa-logger')
const render = require('koa-ejs');
const Router = require('koa-router');
const serve = require('koa-static');

// db includes
const level = require('level')
const levelPromisify = require('level-promisify');

// local includes
const api = require('./lib/api');



const db = levelPromisify(level('db/certs'));

db.get('0x2Df4c69BF8980011fce9ed182f7336F5Af757c26')
  .then(value => {
    console.log('value', value)
  }, error => {
    console.log('seeding database');
    db.put('0x2Df4c69BF8980011fce9ed182f7336F5Af757c26',
      JSON.stringify({
        eth: '0x2Df4c69BF8980011fce9ed182f7336F5Af757c26',
        email: 'mark@oosterveld.org',
        name: 'Mark Oosterveld',
        type: 'ACREDITED'
      }));
  });


const router = new Router();

router.get('/validate/:address', async (ctx, next) => {
  console.log('valdiate', ctx.params.address)

  try {
    let value = await db.get(ctx.params.address);
  // db.get('0x2Df4c69BF8980011fce9ed182f7336F5Af757c26', async (err, value) => {
    let data = JSON.parse(value);

    await ctx.render('validate', data);
    await next();
  } catch (error) {
    await ctx.render('eth_not_found')
    await next();
  }
});

const app = new Koa();
render(app, {
  root: 'views',
  layout: 'template',
  debug: false,
  cache: false
});

app.use(logger());
app.use(api.routes());
app.use(api.allowedMethods());
app.use(router.routes());
app.use(serve('public'));

http.createServer(app.callback()).listen(3000);
https.createServer(app.callback()).listen(3001);
