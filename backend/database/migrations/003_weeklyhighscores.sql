-- Create table weekly_high_stats with appropriate data types
CREATE TABLE weekly_high_stats (
  id SERIAL PRIMARY KEY,
  sleeper_username VARCHAR(100) NOT NULL,
  score INT NOT NULL,
  year INT NOT NULL,
  week INT NOT NULL,
  user_id INT
);

-- Insert data into the newly created table
INSERT INTO weekly_high_stats (id, sleeper_username, score, year, week, user_id) VALUES
(5, 'Chrizzo', 195, 2020, 16, NULL),
(15, 'Wildf1re', 173, 2020, 12, NULL),
(25, 'Wildf1re', 172, 2020, 11, NULL),
(35, 'Veiloh', 168, 2021, 1, NULL),
(45, 'Chrizzo', 166, 2021, 6, NULL),
(55, 'MikkelNorqvist', 163, 2021, 5, NULL),
(65, 'Tomlen', 160, 2020, 1, NULL),
(75, 'MikkelNorqvist', 157, 2020, 5, NULL),
(105, 'sebastianorup', 183, 2022, 8, NULL),
(115, 'kasperclmsn', 165, 2022, 8, NULL);
