import { createClient, RedisClientOptions } from '@redis/client';

export class RedisCache {
    private client;

    constructor() {
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

        this.client = createClient(config);
        this.client.connect().catch((error: any) => {
            console.error("Failed to connect to Redis:", error)
        })

    }

    async put(key: string, value: string, expiration: number, fieldName: string) {
        await this.client.hSet(key, fieldName, value);
        await this.client.expire(key, expiration);
    }

    async get(key: string, fieldName: string): Promise<string | undefined> {
        try {
            const result = await this.client.hGet(key, fieldName);
            return result
        } catch (e) {
            console.error('An error occurred:', e);
            throw e;  // or handle the error in some other way
        }
    }
}
