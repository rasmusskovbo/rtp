-- Create table player_high_stats with appropriate data types
CREATE TABLE player_high_stats (
  id SERIAL PRIMARY KEY,
  sleeper_username VARCHAR(100) NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  score INT NOT NULL,
  year INT NOT NULL,
  week INT NOT NULL,
  user_id INT
);

-- Insert data into the newly created table
INSERT INTO player_high_stats (id, sleeper_username, player_name, score, year, week, user_id) VALUES
(5, 'Chrizzo', 'Alvin Kamara', 55, 2020, 16, NULL),
(15, 'Wildf1re', 'Jonathan Taylor', 52, 2021, 11, NULL),
(25, 'Hendawgs', 'Tyreek Hill', 51, 2020, 12, NULL),
(35, 'MadsNL', 'Dalvin Cook', 48, 2020, 8, NULL),
(45, 'MikkelNorqvist', 'Tyler Lockett', 46, 2020, 7, NULL),
(55, 'Hendawgs', 'Derrick Henry', 45, 2021, 2, NULL),
(65, 'MadsNL', 'Aaron Jones', 44, 2020, 2, NULL),
(75, 'dturn619', 'Justin Herbert', 43, 2021, 5, NULL),
(105, 'normann', 'Joe Mixon', 53, 2022, 9, NULL),
(115, 'Hendawgs', 'Josh Jacobs', 45, 2022, 12, NULL);
