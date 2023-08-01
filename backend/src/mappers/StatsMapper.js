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
exports.StatsMapper = void 0;
class StatsMapper {
    constructor(sleeperService) {
        this.sleeperService = sleeperService;
    }
    mapAvatarAndRtpScore(allTimeWinnersStats) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(allTimeWinnersStats.map((item) => __awaiter(this, void 0, void 0, function* () {
                const rtpScore = this.calculateRtpScore(item);
                const avatar = yield this.mapAvatar(item);
                return Object.assign(Object.assign({}, item), { rtpScore, avatar });
            })));
        });
    }
    mapAvatarOnly(stats) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(stats.map((item) => __awaiter(this, void 0, void 0, function* () {
                const avatar = yield this.mapAvatar(item);
                return Object.assign(Object.assign({}, item), { avatar });
            })));
        });
    }
    mapAvatar(stats) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.sleeperService.getSleeperAvatarUrlBySleeperUsername(stats.sleeper_username);
        });
    }
    calculateRtpScore(statLine) {
        const positiveRtpScore = statLine.wins * 40 +
            statLine.second_place * 20 +
            statLine.third_place * 10 +
            statLine.playoff_appearances * 5;
        const negativeRtpScore = statLine.pinks * 40 +
            statLine.toilet_wins * 20;
        return positiveRtpScore - negativeRtpScore;
    }
}
exports.StatsMapper = StatsMapper;
