import {createConnection, Connection} from "typeorm";
import {AllTimeWinnersEntity} from "../database/entities/AllTimeWinnersEntity";
import {AllTimeStandingsEntity} from "../database/entities/AllTimeStandingsEntity";
import {PlayerHighScoreEntity} from "../database/entities/PlayerHighScoreEntity";
import {WeeklyHighScoreEntity} from "../database/entities/WeeklyHighScoreEntity";
import {YearlyFinishesEntity} from "../database/entities/YearlyFinishesEntity";
import {SleeperUserEntity} from "../database/entities/SleeperUserEntity";
import {PostsEntity} from "../database/entities/PostEntity";
import {UserEntity} from "../database/entities/UserEntity";
import {getSecretValue} from "../aws/AwsSecretsClient";
import dotenv from "dotenv";

dotenv.config()

export const connectToDb = async (): Promise<Connection> => {
    let DB_PASSWORD = process.env.POSTGRES_PASSWORD;

    if (process.env.DB_PASSWORD_SECRET!) {
        await getSecretValue(process.env.DB_PASSWORD_SECRET!)
            .then(secret => {
                DB_PASSWORD = secret ? secret : process.env.POSTGRES_PASSWORD
            });
    }

    console.log("DB PW: " + DB_PASSWORD)
    return createConnection({
                type: "postgres",
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT!),
                username: process.env.DB_USER,
                password: DB_PASSWORD,
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
    });
}



