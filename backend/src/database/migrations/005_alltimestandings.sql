-- Create table standings_stats with appropriate data types
CREATE TABLE standings_stats (
  id SERIAL PRIMARY KEY,
  sleeper_username VARCHAR(100) NOT NULL,
  record VARCHAR(100) NOT NULL,
  win_p INT NOT NULL,
  pf INT NOT NULL,
  pa INT NOT NULL,
  diff INT NOT NULL,
  trans INT NOT NULL,
  msgs INT NOT NULL,
  user_id INT
);

-- Insert data into the newly created table
INSERT INTO all_time_standings (id, sleeper_username, record, win_p, pf, pa, diff, trans, msgs, user_id) VALUES
(5, 'Chrizzo', '26-15', 63, 4583, 4415, 168, 174, 247, NULL),
(15, 'Normann', '24-16-1', 58, 4674, 4482, 192, 185, 99, NULL),
(25, 'Tomlen', '20-21', 48, 4251, 4512, -261, 69, 4, NULL),
(35, 'sebastianorup', '22-18-1', 53, 4387, 4138, 249, 186, 66, NULL),
(45, 'Wildf1re', '20-21', 48, 4574, 4358, 216, 158, 109, NULL),
(55, 'Veiloh', '18-23', 43, 4277, 4553, -276, 97, 13, NULL),
(65, 'dturn619', '24-17', 58, 4598, 4422, 176, 285, 111, NULL),
(75, 'MadsNL', '20-21', 48, 4413, 4332, 81, 99, 8, NULL),
(85, 'Hendawgs', '16-25', 39, 4160, 4443, -283, 119, 23, NULL),
(95, 'MikkelNorqvist', '19-22', 46, 4349, 4261, 88, 162, 150, NULL),
(105, 'alohnes15', '16-25', 39, 4210, 4484, -274, 146, 121, NULL),
(115, 'kasperclmsn', '20-21', 48, 4295, 4371, -76, 187, 104, NULL);
