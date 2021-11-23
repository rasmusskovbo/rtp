import { getDBConnection } from "./connectDB.js";

// team, sleeper, password tables has a user id
const usersTable = `
CREATE TABLE users (
    id INT AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    sleeper_user_id VARCHAR(100),
    PRIMARY KEY(id)
);
`

const passwordsTable = `
CREATE TABLE passwords (
    id INT AUTO_INCREMENT,
    hash VARCHAR(100) NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
`
const db = getDBConnection();

db.query("DROP TABLE IF EXISTS users;")
db.query("DROP TABLE IF EXISTS passwords;")

db.query(usersTable)
db.query(passwordsTable)

db.end()
