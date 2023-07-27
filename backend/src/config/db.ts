import {createConnection, Connection} from "typeorm";
import {AllTimeWinnersEntity} from "../database/entities/AllTimeWinnersEntity";
import {AllTimeStandingsEntity} from "../database/entities/AllTimeStandingsEntity";
import {PlayerHighScoreEntity} from "../database/entities/PlayerHighScoreEntity";
import {WeeklyHighScoreEntity} from "../database/entities/WeeklyHighScoreEntity";
import {YearlyFinishesEntity} from "../database/entities/YearlyFinishesEntity";
import {SleeperUserEntity} from "../database/entities/SleeperUserEntity";
import {PostsEntity} from "../database/entities/PostEntity";
import {UserEntity} from "../database/entities/UserEntity";

export const connectToDb = async (): Promise<Connection> => {
    return createConnection({
        type: "postgres",
        host: process.env.DB_HOST,
        port: 5433,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
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
    });
}
