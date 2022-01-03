import { getDBConnection } from "./connectDB.js"

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

const postsTable = `
CREATE TABLE posts (
    id              INT AUTO_INCREMENT,
    title           VARCHAR(100)    NOT NULL,
    content         VARCHAR(1000)   NOT NULL,
    postedBy        VARCHAR(100)    NOT NULL,
    publishedTime   TIMESTAMP       DEFAULT     CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
)
`

const rolesTable = `
CREATE TABLE roles (
    id              INT AUTO_INCREMENT,
    isAdmin         BOOL    NOT NULL,
    user_id         INT     NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
`

const rtpScoreStatsTable = `
CREATE TABLE rtp_score_stats(
    id                  INT AUTO_INCREMENT,
    sleeper_username    VARCHAR(100) NOT NULL,
    wins                INT NOT NULL,
    second_place        INT NOT NULL,
    third_place         INT NOT NULL,
    playoff_appearances INT NOT NULL,
    toilet_wins         INT NOT NULL,
    pinks               INT NOT NULL,
    user_id             INT,
    PRIMARY KEY (id)
);
`

const standingsStatsTable = `
CREATE TABLE standings_stats(
    id                  INT AUTO_INCREMENT,
    sleeper_username    VARCHAR(100) NOT NULL,
    record              VARCHAR(100) NOT NULL,
    win_p               INT NOT NULL,
    pf                  INT NOT NULL,
    pa                  INT NOT NULL,
    diff                INT NOT NULL,
    trans               INT NOT NULL,
    msgs                INT NOT NULL,
    user_id             INT,
    PRIMARY KEY (id)
);
`

const weeklyHighStatsTable = `
CREATE TABLE weekly_high_stats(
    id                  INT AUTO_INCREMENT,
    sleeper_username    VARCHAR(100) NOT NULL,
    score               INT NOT NULL,
    year                INT NOT NULL,
    week                INT NOT NULL,
    user_id             INT,
    PRIMARY KEY (id)
);
`

const playerHighStatsTable = `
CREATE TABLE player_high_stats(
    id                  INT AUTO_INCREMENT,
    sleeper_username    VARCHAR(100) NOT NULL,
    player_name         VARCHAR(100) NOT NULL,
    score               INT NOT NULL,
    year                INT NOT NULL,
    week                INT NOT NULL,
    user_id             INT,
    PRIMARY KEY (id)
);
`

const yearlyFinishesStatsTable = `
CREATE TABLE yearly_finishes_stats(
    id                  INT AUTO_INCREMENT,
    year                VARCHAR(100) NOT NULL,
    winner              VARCHAR(100) NOT NULL,
    second              VARCHAR(100) NOT NULL,
    third               VARCHAR(100) NOT NULL,
    last_regular        VARCHAR(100) NOT NULL,
    last_playoffs       VARCHAR(100) NOT NULL,
    league_size         INT NOT NULL,
    PRIMARY KEY (id)
);
`

const db = await getDBConnection()

db.execute("DROP TABLE IF EXISTS messages;")
db.execute("DROP TABLE IF EXISTS sleeperInfo;")
db.execute("DROP TABLE IF EXISTS passwords;")
db.execute("DROP TABLE IF EXISTS posts;")
db.execute("DROP TABLE IF EXISTS roles;")
db.execute("DROP TABLE IF EXISTS rtp_score_stats;")
db.execute("DROP TABLE IF EXISTS standings_stats;")
db.execute("DROP TABLE IF EXISTS weekly_high_stats;")
db.execute("DROP TABLE IF EXISTS player_high_stats;")
db.execute("DROP TABLE IF EXISTS yearly_finishes_stats;")
db.execute("DROP TABLE IF EXISTS users;")

db.execute(messageTable)
db.execute(usersTable)
db.execute(passwordsTable)
db.execute(sleeperInfoTable)
db.execute(postsTable)
db.execute(rolesTable)
db.execute(rtpScoreStatsTable)
db.execute(standingsStatsTable)
db.execute(weeklyHighStatsTable)
db.execute(playerHighStatsTable)
db.execute(yearlyFinishesStatsTable)

db.end()