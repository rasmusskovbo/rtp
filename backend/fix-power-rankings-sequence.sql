-- Fix power_rankings primary key sequence safely
-- This script resets the sequence for power_rankings.id to (MAX(id) + 1)
-- It works regardless of the actual sequence name (serial vs identity) and when the table is empty.

-- Show the sequence name used for power_rankings.id
SELECT pg_get_serial_sequence('power_rankings', 'id') AS seq_name;

-- Set the next value to MAX(id) + 1. If the table is empty, this sets it to 1.
-- Using is_called = false ensures the next nextval(...) returns exactly the value provided.
SELECT setval(
  pg_get_serial_sequence('power_rankings', 'id'),
  COALESCE((SELECT MAX(id) FROM power_rankings), 0) + 1,
  false
);

-- Verify the sequence value after the reset
SELECT currval(pg_get_serial_sequence('power_rankings', 'id')) AS new_sequence_value;