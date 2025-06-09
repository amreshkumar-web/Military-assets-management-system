const redis = require("redis");
require('dotenv').config();

const client = redis.createClient({
    url: `rediss://default:${process.env.REDIS_SECRET_CODE}@true-possum-14184.upstash.io:6379`,
    socket: {
        reconnectStrategy: (retries) => {
            console.log(`♻️ Redis Reconnecting Attempt: ${retries}`);
            return Math.min(retries * 100, 3000); // Retry with exponential backoff
        }
    }
});

// Handle connection events
client.on('connect', () => console.log('✅ Connected to Redis'));
client.on('error', (err) => console.error('🚨 Redis Error:', err));
client.on('reconnecting', () => console.log('♻️ Redis Trying to Reconnect...'));
client.on('end', () => console.log('🔴 Redis Connection Closed'));

// Connect to Redis
client.connect().catch(err => console.error('❌ Error connecting to Redis:', err));

module.exports = client;
