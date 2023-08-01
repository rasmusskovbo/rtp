import {createConnection, Connection} from "typeorm";
import {AllTimeWinnersEntity} from "../database/entities/AllTimeWinnersEntity";
import {AllTimeStandingsEntity} from "../database/entities/AllTimeStandingsEntity";
import {PlayerHighScoreEntity} from "../database/entities/PlayerHighScoreEntity";
import {WeeklyHighScoreEntity} from "../database/entities/WeeklyHighScoreEntity";
import {YearlyFinishesEntity} from "../database/entities/YearlyFinishesEntity";
import {SleeperUserEntity} from "../database/entities/SleeperUserEntity";
import {PostsEntity} from "../database/entities/PostEntity";
import {UserEntity} from "../database/entities/UserEntity";
import dotenv from "dotenv";

dotenv.config()

export const connectToDb = async (): Promise<Connection> => {
    return createConnection({
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT!),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [
            AllTimeWinnersEntity,
            AllTimeStandingsEntity,
            PlayerHighScoreEntity,
            WeeklyHighScoreEntity,
            YearlyFinishesEntity,
            SleeperUserEntity,
            PostsEntity,
            UserEntity
        ],
        synchronize: true,
        extra: {
            ssl: {
                rejectUnauthorized: false
            }
        }
    });
}




