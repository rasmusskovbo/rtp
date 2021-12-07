import { getDBConnection } from "./connectDB.js";

// team, sleeper, password tables has a user id
const usersTable = `
CREATE TABLE users (
    id          INT AUTO_INCREMENT,
    email       VARCHAR(100) NOT NULL,
    username    VARCHAR(100) NOT NULL,
    PRIMARY KEY(id)
);
`

const passwordsTable = `
CREATE TABLE passwords (
    id          INT AUTO_INCREMENT,
    hash        VARCHAR(100) NOT NULL,
    user_id     INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
`

const sleeperInfoTable = `
CREATE TABLE sleeperInfo (   
    id                  INT AUTO_INCREMENT,
    sleeper_username    VARCHAR(100) NOT NULL,
    sleeper_user_id     VARCHAR(100) NOT NULL,
    sleeper_avatar_url  VARCHAR(100),
    user_id             INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
`

const messageTable = `
CREATE TABLE messages (
    id            INT AUTO_INCREMENT,
    username      VARCHAR(100)  NOT NULL,
    content       VARCHAR(1000) NOT NULL,
    owner         INT           NOT NULL,
    avatar_url    VARCHAR(100)  NOT NULL,
    publishedTime TIMESTAMP     DEFAULT     CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
)
`

const db = await getDBConnection()

db.execute("DROP TABLE IF EXISTS messages;")
db.execute("DROP TABLE IF EXISTS sleeperInfo;")
db.execute("DROP TABLE IF EXISTS passwords;")
db.execute("DROP TABLE IF EXISTS users;")

db.execute(messageTable)
db.execute(usersTable)
db.execute(passwordsTable)
db.execute(sleeperInfoTable)

db.end()