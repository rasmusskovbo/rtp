"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
const redis_1 = require("redis");
class RedisCache {
    constructor() {
        const username = process.env.REDIS_USER;
        const password = process.env.REDIS_PASSWORD;
        const host = process.env.REDIS_HOST;
        const port = process.env.REDIS_PORT;
        const connectionString = (username == null || password == null)
            ? `redis://${host}:${port}` : `redis://${username}:${password}@${host}:${port}`;
        const config = {
            url: connectionString
        };
        this.client = (0, redis_1.createClient)(config);
        this.client.connect().catch((error) => {
            console.error("Failed to connect to Redis:", error);
        });
    }
    put(key, value, expiration, fieldName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.hSet(key, fieldName, value);
            yield this.client.expire(key, expiration);
        });
    }
    get(key, fieldName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.hGet(key, fieldName);
                return result;
            }
            catch (e) {
                console.error('An error occurred:', e);
                throw e; // or handle the error in some other way
            }
        });
    }
}
exports.RedisCache = RedisCache;
