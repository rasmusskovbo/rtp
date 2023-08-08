import { createClient, RedisClientOptions } from 'redis';
import dotenv from "dotenv";

dotenv.config()

export class RedisCache {
    private client: any;

    constructor() {
        console.log("Heroku Deployment: " + process.env.HEROKU_DEPLOYMENT);
        let connectionString = "";
        if (process.env.HEROKU_DEPLOYMENT) {
            connectionString = process.env.REDIS_URL!;
        } else {
            const username = process.env.REDIS_USER;
            const password = process.env.REDIS_PASSWORD;
            const host = process.env.REDIS_HOST;
            const port = process.env.REDIS_PORT;

            connectionString = (username == null || password == null)
                ? `redis://${host}:${port}` : `redis://${username}:${password}@${host}:${port}`;
        }

        const config: RedisClientOptions = {
            url: connectionString
        }

        let retries = 0;
        const maxRetries = 10;
        const baseDelay = 1000;

        const connectToRedis = () => {
            if (retries > maxRetries) {
                console.error("Max retries reached. Could not connect to Redis.");
                return; // Or handle this situation differently
            }

            this.client = createClient(config);

            this.client.on('error', (error: any) => {
                console.error("Error in Redis client:", error);
                retries++;
                // Retry connection with exponential backoff
                setTimeout(connectToRedis, baseDelay * Math.pow(2, retries));
            });

            this.client.connect().catch((error: any) => {
                console.error("Failed to connect to Redis:", error);
                retries++;
                // Retry connection with exponential backoff
                setTimeout(connectToRedis, baseDelay * Math.pow(2, retries));
            });
        };

        connectToRedis()

    }

    async put(key: string, value: string, expiration: number, fieldName: string) {
        try {
            await this.client.hSet(key, fieldName, value);
            await this.client.expire(key, expiration);
        } catch (e) {
            console.error('A cache error occurred:', e);
        }
    }

    async get(key: string, fieldName: string): Promise<string | undefined> {
        try {
            const result = await this.client.hGet(key, fieldName);
            return result
        } catch (e) {
            console.error('A cache error occurred:', e);
        }
    }

    async putObject(key: string, value: object, expiration: number, fieldName: string) {
        try {
            const stringifiedValue = JSON.stringify(value);
            await this.put(key, stringifiedValue, expiration, fieldName);
        } catch (e) {
            console.error('A cache error occurred:', e);
        }
    }

    async getObject<T>(key: string, fieldName: string): Promise<T | undefined> {
        try {
            const result = await this.get(key, fieldName);
            return result ? JSON.parse(result) as T : undefined;
        } catch (e) {
            console.error('A cache error occurred:', e);
        }
    }
}
