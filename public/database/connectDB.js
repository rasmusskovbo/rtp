import mysql from "mysql2"
import fs from "fs"

const config = JSON.parse(fs.readFileSync("./public/database/config.json"))
const connection = null;

export function getDBConnection() {
    return mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
    })
}

/*  --- Test call ---
const connection = getDBConnection()

connection.connect()

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});
 
connection.end()
*/
