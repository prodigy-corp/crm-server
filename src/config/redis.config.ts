import { RedisOptions } from 'bullmq';
import { config } from 'dotenv';
import Redis from 'ioredis';

config();

const isProduction = process.env.NODE_ENV === 'production';
const isCloudRedis =
  process.env.REDIS_HOST &&
  !process.env.REDIS_HOST.includes('localhost') &&
  !process.env.REDIS_HOST.includes('127.0.0.1');

export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  // Enable TLS for cloud Redis instances
  tls: isCloudRedis ? {} : undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableReadyCheck: true,
  enableOfflineQueue: true,
  // Connection timeout
  connectTimeout: 10000,
  // Keepalive
  keepAlive: 30000,
};

// Create Redis instances with error handling
export const redisPub = new Redis(redisConfig);
export const redisSub = new Redis(redisConfig);

redisPub.on('error', (error) => {
  console.error('[Redis Pub] Connection error:', error.message);
});

redisPub.on('connect', () => {
  console.log('[Redis Pub] Connected successfully');
});

redisSub.on('error', (error) => {
  console.error('[Redis Sub] Connection error:', error.message);
});

redisSub.on('connect', () => {
  console.log('[Redis Sub] Connected successfully');
});

export const NOTIFICATION_CHANNEL = 'notification:channel';
