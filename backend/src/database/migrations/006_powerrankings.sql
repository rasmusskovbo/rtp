-- Create power_rankings table
CREATE TABLE IF NOT EXISTS power_rankings (
    id SERIAL PRIMARY KEY,
    week INTEGER NOT NULL,
    rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 12),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    teamId INTEGER NOT NULL,
    userId UUID NOT NULL,
    FOREIGN KEY (teamId) REFERENCES team_entity(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(week, teamId, userId)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_power_rankings_week ON power_rankings(week);
CREATE INDEX IF NOT EXISTS idx_power_rankings_team ON power_rankings(teamId);
CREATE INDEX IF NOT EXISTS idx_power_rankings_user ON power_rankings(userId);
CREATE INDEX IF NOT EXISTS idx_power_rankings_week_team ON power_rankings(week, teamId);