module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  username: process.env.DB_NAME || 'rtp',
  password: process.env.DB_PASSWORD || 'passw0rd',
  database: process.env.DB_NAME || 'rtp',
  synchronize: 'true',
  logging: 'true',
  entities: [
    'src/database/entities/*.ts'
  ],
  "migrations": [
    "src/database/migrations/*.ts"
  ],
  "subscribers": [
    "src/subscriber/**/*.ts"
  ],
  "cli": {
    "entitiesDir": "src/database/entities",
    "migrationsDir": "src/database/migrations",
    "subscribersDir": "src/database/subscribers"
  }
};
