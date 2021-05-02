const app = require('./build/app').default;
const serverlessExpress = require('aws-serverless-express');
const server = serverlessExpress.createServer(app);
exports.handler = (event, context) => serverlessExpress.proxy(server, event, context);