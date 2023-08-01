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
const express_1 = require("express");
const typeorm_1 = require("typeorm");
const AllTimeWinnersEntity_1 = require("../database/entities/AllTimeWinnersEntity");
const AllTimeStandingsEntity_1 = require("../database/entities/AllTimeStandingsEntity");
const WeeklyHighScoreEntity_1 = require("../database/entities/WeeklyHighScoreEntity");
const PlayerHighScoreEntity_1 = require("../database/entities/PlayerHighScoreEntity");
const YearlyFinishesEntity_1 = require("../database/entities/YearlyFinishesEntity");
const SleeperService_1 = require("../services/SleeperService");
const StatsMapper_1 = require("../mappers/StatsMapper");
const statsRouter = (0, express_1.Router)();
let statsMapper;
statsRouter.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("API Call received GET /stats");
    statsMapper = new StatsMapper_1.StatsMapper(new SleeperService_1.SleeperService());
    try {
        const allTimeWinnersRepository = (0, typeorm_1.getRepository)(AllTimeWinnersEntity_1.AllTimeWinnersEntity);
        const allTimeStandingsRepository = (0, typeorm_1.getRepository)(AllTimeStandingsEntity_1.AllTimeStandingsEntity);
        const weeklyHighScoresRepository = (0, typeorm_1.getRepository)(WeeklyHighScoreEntity_1.WeeklyHighScoreEntity);
        const playerHighScoresRepository = (0, typeorm_1.getRepository)(PlayerHighScoreEntity_1.PlayerHighScoreEntity);
        const yearlyFinishesRepository = (0, typeorm_1.getRepository)(YearlyFinishesEntity_1.YearlyFinishesEntity);
        const yearlyFinishesStats = yield yearlyFinishesRepository.find();
        const allTimeWinnersStats = yield allTimeWinnersRepository.find()
            .then(stats => statsMapper.mapAvatarAndRtpScore(stats));
        const allTimeStandingsStats = yield allTimeStandingsRepository.find()
            .then(stats => statsMapper.mapAvatarOnly(stats));
        const weeklyHighScoresStats = yield weeklyHighScoresRepository.find()
            .then(stats => statsMapper.mapAvatarOnly(stats));
        const playerHighScoresStats = yield playerHighScoresRepository.find()
            .then(stats => statsMapper.mapAvatarOnly(stats));
        res.json({
            statProps: {
                allTimeWinners: { stats: allTimeWinnersStats },
                allTimeStandings: { stats: allTimeStandingsStats },
                weeklyHighScores: { stats: weeklyHighScoresStats },
                playerHighScores: { stats: playerHighScoresStats },
                yearlyFinishes: { stats: yearlyFinishesStats },
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}));
exports.default = statsRouter;
