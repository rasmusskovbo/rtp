-- Create table yearly_finishes_stats with appropriate data types
CREATE TABLE yearly_finishes_stats (
  id SERIAL PRIMARY KEY,
  year VARCHAR(100) NOT NULL,
  winner VARCHAR(100) NOT NULL,
  second VARCHAR(100) NOT NULL,
  third VARCHAR(100) NOT NULL,
  last_regular VARCHAR(100) NOT NULL,
  last_playoffs VARCHAR(100) NOT NULL,
  league_size INT NOT NULL
);

-- Insert data into the newly created table
INSERT INTO yearly_finishes (id, year, winner, second, third, last_regular, last_playoffs, league_size) VALUES
(0, '2020', 'sebastianorup', 'MadsNL', 'Chrizzo', 'kaspercmlsmn', 'veiloh', 12),
(1, '2019', 'normann', 'Chrizzo', 'MikkelNorqvist', 'MadsNL', 'MadsNL', 10),
(2, '2018', 'Hendawgs', 'MikkelNorqvist', 'normann', 'Gronking', 'Tomlen', 10),
(3, '2017', 'Tomlen', 'Chrizzo', 'normann', 'Wildf1re', 'Wildf1re', 6),
(4, '2016', 'Wildf1re', 'MikkelNorqvist', 'Tomlen', 'sebastianorup', 'sebastianorup', 4),
(5, '2021', 'dturn619', 'normann', 'alohnes15', 'MadsNL', 'MikkelNorqvist', 12),
(6, '2022', 'kasperclmsn', 'Chrizzo', 'MikkelNorqvist', 'Hendawgs', 'Hendawgs', 12);
