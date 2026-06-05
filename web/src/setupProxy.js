const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      logLevel: 'silent',
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader('origin', 'http://localhost:5000');
      },
    })
  );
};
