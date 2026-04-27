const app = require('./src/app')
const PORT = process.env.PORT || 3000;
const { connectRedis } = require("./src/config/redis");
const AppError = require('./src/utils/AppError');

try {
  async function connect(){
    await connectRedis();
  }
} catch (error) {
  throw new AppError("Redis not connected", 500)
}


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
