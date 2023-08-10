import {createConnection, Connection, ConnectionOptions} from "typeorm";
import {AllTimeWinnersEntity} from "../database/entities/AllTimeWinnersEntity";
import {AllTimeStandingsEntity} from "../database/entities/AllTimeStandingsEntity";
import {PlayerHighScoreEntity} from "../database/entities/PlayerHighScoreEntity";
import {WeeklyHighScoreEntity} from "../database/entities/WeeklyHighScoreEntity";
import {YearlyFinishesEntity} from "../database/entities/YearlyFinishesEntity";
import {SleeperUserEntity} from "../database/entities/SleeperUserEntity";
import {PostsEntity} from "../database/entities/PostEntity";
import {UserEntity} from "../database/entities/UserEntity";
import {TeamEntity} from "../database/entities/TeamEntity";
import dotenv from "dotenv";
import {PlayerEntity} from "../database/entities/PlayerEntity";
import {SleeperRosterEntity} from "../database/entities/SleeperRosterEntity";
import {parse} from 'pg-connection-string'
import {RivalEntity} from "../database/entities/RivalEntity";
import {CurrentWeekEntity} from "../database/entities/CurrentWeekEntity";
import {MatchupEntity} from "../database/entities/MatchupEntity";

dotenv.config()

export const connectToDb = async (): Promise<Connection> => {
    const connectionString = process.env.DATABASE_URL!;
    const connectionParams = parse(connectionString);

    let connectionOptions: ConnectionOptions = {
        type: "postgres",
        host: connectionParams.host!,
        port: parseInt(connectionParams.port!),
        username: connectionParams.user,
        password: connectionParams.password!,
        database: connectionParams.database!,
        entities: [
            AllTimeWinnersEntity,
            AllTimeStandingsEntity,
            PlayerHighScoreEntity,
            WeeklyHighScoreEntity,
            YearlyFinishesEntity,
            SleeperUserEntity,
            SleeperRosterEntity,
            PostsEntity,
            UserEntity,
            TeamEntity,
            PlayerEntity,
            RivalEntity,
            CurrentWeekEntity,
            MatchupEntity
        ],
        synchronize: true
    };

    if (process.env.HEROKU_DEPLOYMENT === "true") {
        connectionOptions = {
            ...connectionOptions,
            extra: {
                ssl: {
                    rejectUnauthorized: false
                }
            }
        };
    }

    return createConnection(connectionOptions);
}




