import { getDBConnection } from "./connectDB.js";

// team, sleeper, password tables has a user id
const usersTable = `
CREATE TABLE users (
    id INT AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    PRIMARY KEY(id)
);
`

const passwordsTable = `
CREATE TABLE passwords (
    id INT AUTO_INCREMENT,
    hash VARCHAR(100) NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
`

const sleeperInfoTable = `
CREATE TABLE sleeperInfo (
    id INT AUTO_INCREMENT,
    sleeper_username VARCHAR(100) NOT NULL,
    sleeper_userid VARCHAR(100) NOT NULL,
    sleeper_avatar_url VARCHAR(100),
    user_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
`
const db = await getDBConnection()

db.execute("DROP TABLE IF EXISTS sleeperInfo;")
db.execute("DROP TABLE IF EXISTS passwords;")
db.execute("DROP TABLE IF EXISTS users;")

db.execute(usersTable)
db.execute(passwordsTable)
db.execute(sleeperInfoTable)

db.end()