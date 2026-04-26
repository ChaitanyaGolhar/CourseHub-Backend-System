const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_PUBLIC_URL,
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

client.on("connect", () => {
  console.log("Redis connected");
});

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}

module.exports = {
  client,
  connectRedis,
};