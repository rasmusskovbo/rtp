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
exports.SleeperService = void 0;
const SleeperClient_1 = require("../clients/SleeperClient");
const RedisClient_1 = require("../cache/RedisClient");
const BASEURL_SLEEPER_AVATAR = "https://sleepercdn.com/avatars/thumbs/";
const CACHE_FIELD = "avatarUrl";
const AVATAR_EXPIRATION = 60 * 60 * 24;
class SleeperService {
    constructor() {
        this.cache = new RedisClient_1.RedisCache();
    }
    getSleeperAvatarUrlBySleeperUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedAvatarUrl = yield this.cache.get(username, CACHE_FIELD);
            return cachedAvatarUrl ? cachedAvatarUrl : yield this.fetchAndInsertSleeperUser(username);
        });
    }
    fetchAndInsertSleeperUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sleeperUser = yield (0, SleeperClient_1.getSleeperUserByUsername)(username);
                if (sleeperUser) {
                    const avatarUrl = BASEURL_SLEEPER_AVATAR + sleeperUser.avatar;
                    this.cache.put(username, avatarUrl, AVATAR_EXPIRATION, CACHE_FIELD);
                    return avatarUrl;
                }
                else {
                    console.log("Unable to save fetch data for Sleeper user: " + username);
                    return "N/A";
                }
            }
            catch (err) {
                console.error(`An error occurred while fetching and inserting Sleeper user: ${err}`);
                return "N/A";
            }
        });
    }
}
exports.SleeperService = SleeperService;
