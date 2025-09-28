-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
    id SERIAL PRIMARY KEY,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    commentId INTEGER NOT NULL,
    userId UUID NOT NULL,
    FOREIGN KEY (commentId) REFERENCES power_rankings(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(commentId, userId)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(commentId);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON comment_likes(userId);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_user ON comment_likes(commentId, userId);