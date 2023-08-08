import { createClient, RedisClientOptions } from 'redis';
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.HEROKU_DEPLOYMENT ? process.env.REDIS_URL! :
    process.env.REDIS_USER == null || process.env.REDIS_PASSWORD == null ?
        `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` :
        `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

const config: RedisClientOptions = { url: connectionString };

let client = createClient(config);

let retries = 0;
const maxRetries = 10;
const baseDelay = 1000;

const connectToRedis = async () => {
    if (retries > maxRetries) {
        console.error("Max retries reached. Could not connect to Redis.");
        return;
    }

    try {
        await client.connect();
    } catch (error) {
        console.error("Failed to connect to Redis:", error);
        retries++;
        client.disconnect();
        client = createClient(config); // Creating a new client instance
        setTimeout(connectToRedis, baseDelay * Math.pow(2, retries));
    }
};

client.on('error', (error: any) => {
    console.error("Error in Redis client:", error);
});

connectToRedis();

export const putInCache = async (key: string, value: string, expiration: number, fieldName: string) => {
    try {
        await client.hSet(key, fieldName, value);
        await client.expire(key, expiration);
    } catch (e) {
        console.error('A cache error occurred:', e);
    }
};

export const getFromCache = async (key: string, fieldName: string): Promise<string | undefined> => {
    try {
        return await client.hGet(key, fieldName);
    } catch (e) {
        console.error('A cache error occurred:', e);
    }
};

export const putObjectInCache = async (key: string, value: object, expiration: number, fieldName: string) => {
    try {
        const stringifiedValue = JSON.stringify(value);
        await putInCache(key, stringifiedValue, expiration, fieldName);
    } catch (e) {
        console.error('A cache error occurred:', e);
    }
};

export const getObjectFromCache = async <T>(key: string, fieldName: string): Promise<T | undefined> => {
    try {
        const result = await getFromCache(key, fieldName);
        return result ? JSON.parse(result) as T : undefined;
    } catch (e) {
        console.error('A cache error occurred:', e);
    }
};
