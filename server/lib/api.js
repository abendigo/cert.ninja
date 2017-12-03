const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');


const api = new Router({
  prefix: '/api'
});

api.get('/foo', async (ctx) => {
  console.log('foo', ctx.request.body, ctx.request.rawBody)
  ctx.body = {
    status: 'success',
    message: 'hello, world!'
  };
});

api.post('/cert', bodyParser(), async (ctx) => {
  console.log('cert', ctx.request.body, ctx.request.rawBody)
  ctx.body = {
    status: 'success',
    message: 'hello, world!'
  };
});



module.exports = api;
