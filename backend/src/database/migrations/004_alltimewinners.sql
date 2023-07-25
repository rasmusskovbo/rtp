-- Create table rtp_score_stats with appropriate data types
CREATE TABLE rtp_score_stats (
  id SERIAL PRIMARY KEY,
  sleeper_username VARCHAR(100) NOT NULL,
  wins INT NOT NULL,
  second_place INT NOT NULL,
  third_place INT NOT NULL,
  playoff_appearances INT NOT NULL,
  toilet_wins INT NOT NULL,
  pinks INT NOT NULL,
  user_id INT
);

-- Insert data into the newly created table
INSERT INTO all_time_winners (id, sleeper_username, wins, second_place, third_place, playoff_appearances, toilet_wins, pinks, user_id) VALUES
(15, 'alohnes15', 0, 0, 1, 1, 0, 0, NULL),
(25, 'Chrizzo', 0, 1, 1, 2, 0, 0, NULL),
(35, 'dturn619', 1, 0, 0, 2, 0, 0, NULL),
(45, 'Hendawgs', 0, 0, 0, 1, 1, 1, NULL),
(55, 'kasperclmsn', 1, 0, 0, 2, 0, 1, NULL),
(65, 'MadsNL', 0, 1, 0, 2, 0, 1, NULL),
(75, 'MikkelNorqvist', 0, 0, 1, 1, 1, 0, NULL),
(85, 'normann', 0, 1, 0, 2, 0, 0, NULL),
(95, 'sebastianorup', 1, 0, 0, 3, 0, 0, NULL),
(105, 'Tomlen', 0, 0, 0, 2, 0, 0, NULL),
(115, 'Veiloh', 0, 0, 0, 1, 1, 0, NULL),
(125, 'Wildf1re', 0, 0, 0, 1, 0, 0, NULL);
