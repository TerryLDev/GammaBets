const Koa = require('koa');
const KoaRouter = require('koa-router');
const json = require('koa-json');
// Need a template engine still

const app = new Koa();
const router = new KoaRouter();

app.use(json());

// Simple Middleware
// app.use(async ctx => ctx.body = 'Hello');

router.get('/test', ctx => (ctx.body = 'Hello Test'));

// Router
app.use(router.routes()).use(router.allowedMethods)

app.listen(3000, () => console.log('Server Started...'));