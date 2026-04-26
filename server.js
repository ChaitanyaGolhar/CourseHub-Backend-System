const app = require('./src/app')
const PORT = process.env.PORT || 3000;
const { connectRedis } = require("./src/config/redis");

async function startServer() {
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();