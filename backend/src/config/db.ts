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
    const dbConfig = process.env.HEROKU_DEPLOYMENT
        ? parsePostgresUrl(process.env.DATABASE_URL!)
        : {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT!),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        };

    return createConnection({
        type: "postgres",
        ...dbConfig,
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

function parsePostgresUrl(url: string) {
    const parsedUrl = new URL(url);
    const [username, password] = parsedUrl.username.split(':');
    const [host, port] = parsedUrl.host.split(':');
    const database = parsedUrl.pathname.slice(1);

    return {
        username,
        password,
        host,
        port: parseInt(port),
        database
    };
}




