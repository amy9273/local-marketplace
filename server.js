const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 App running on port ${port}...`);
  console.log(`📦 API: http://localhost:${port}/api/v1/products`);
  console.log(`🔍 Single Product: http://localhost:${port}/api/v1/products/1`);
  console.log(`🏠 Homepage: http://localhost:${port}/index.html`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});