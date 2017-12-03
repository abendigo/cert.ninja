const http = require('http');
const https = require('https');
const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');

const app = new Koa();
const router = new Router({
  prefix: '/api'
});

router.get('/foo', async (ctx) => {
  console.log('_____')
  ctx.body = {
    status: 'success',
    message: 'hello, world!'
  };
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(serve('public'));

http.createServer(app.callback()).listen(3000);
https.createServer(app.callback()).listen(3001);
