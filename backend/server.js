const app = require('./app');
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`======================================================`);
  console.log(`Library Management System Backend is running!`);
  console.log(`Local Server:       http://localhost:${PORT}`);
  console.log(`Admin Web Site:     http://localhost:${PORT}`);
  console.log(`API Health Check:   http://localhost:${PORT}/api/health`);
  console.log(`======================================================`);
});

module.exports = server;
