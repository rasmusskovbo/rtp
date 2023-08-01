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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDb = void 0;
const typeorm_1 = require("typeorm");
const AllTimeWinnersEntity_1 = require("../database/entities/AllTimeWinnersEntity");
const AllTimeStandingsEntity_1 = require("../database/entities/AllTimeStandingsEntity");
const PlayerHighScoreEntity_1 = require("../database/entities/PlayerHighScoreEntity");
const WeeklyHighScoreEntity_1 = require("../database/entities/WeeklyHighScoreEntity");
const YearlyFinishesEntity_1 = require("../database/entities/YearlyFinishesEntity");
const SleeperUserEntity_1 = require("../database/entities/SleeperUserEntity");
const PostEntity_1 = require("../database/entities/PostEntity");
const UserEntity_1 = require("../database/entities/UserEntity");
const AwsSecretsClient_1 = require("../aws/AwsSecretsClient");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectToDb = () => __awaiter(void 0, void 0, void 0, function* () {
    let DB_PASSWORD = process.env.POSTGRES_PASSWORD;
    if (process.env.DB_PASSWORD_SECRET) {
        yield (0, AwsSecretsClient_1.getSecretValue)(process.env.DB_PASSWORD_SECRET)
            .then(secret => {
            DB_PASSWORD = secret ? secret : process.env.POSTGRES_PASSWORD;
        });
    }
    console.log("DB PW: " + DB_PASSWORD);
    return (0, typeorm_1.createConnection)({
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [
            AllTimeWinnersEntity_1.AllTimeWinnersEntity,
            AllTimeStandingsEntity_1.AllTimeStandingsEntity,
            PlayerHighScoreEntity_1.PlayerHighScoreEntity,
            WeeklyHighScoreEntity_1.WeeklyHighScoreEntity,
            YearlyFinishesEntity_1.YearlyFinishesEntity,
            SleeperUserEntity_1.SleeperUserEntity,
            PostEntity_1.PostsEntity,
            UserEntity_1.UserEntity
        ],
        synchronize: true,
    });
});
exports.connectToDb = connectToDb;
