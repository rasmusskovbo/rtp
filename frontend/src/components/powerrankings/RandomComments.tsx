import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

interface Comment {
  id: number;
  comment: string;
  rank: number;
  team: {
    id: number;
    teamName: string;
    ownerName: string;
    teamLogo: string;
  };
  user: {
    id: string;
    name: string;
  };
}

interface RandomCommentsProps {
  className?: string;
}

const RandomComments: React.FC<RandomCommentsProps> = ({ className = '' }) => {
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [displayedComments, setDisplayedComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleComments, setVisibleComments] = useState<Set<number>>(new Set());
  const [dismissedComments, setDismissedComments] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${process.env.API_URL}/api/power-rankings/comments`);
        
        if (response.data?.comments && Array.isArray(response.data.comments)) {
          const fetchedComments = response.data.comments;
          
          // Store all comments for potential replacement
          setAllComments(fetchedComments);
          
          // Select 6 random comments
          const shuffled = [...fetchedComments].sort(() => 0.5 - Math.random());
          const selectedComments = shuffled.slice(0, 6);
          
          setDisplayedComments(selectedComments);
          
          // Show comments one by one with delays
          selectedComments.forEach((comment, index) => {
            setTimeout(() => {
              setVisibleComments(prev => {
                const newSet = new Set(prev);
                newSet.add(comment.id);
                return newSet;
              });
            }, index * 500); // 500ms delay between each comment
          });
        } else {
          setError('No comments available');
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  const handleDismiss = (commentId: number) => {
    setDismissedComments(prev => {
      const newSet = new Set(prev);
      newSet.add(commentId);
      return newSet;
    });

    // Find a replacement comment
    const currentlyDisplayedIds = displayedComments.map(c => c.id);
    const dismissedIds = Array.from(dismissedComments);
    const allDismissedIds = [...dismissedIds, commentId];
    
    // Get comments that are not currently displayed and not dismissed
    const availableComments = allComments.filter(c => 
      !currentlyDisplayedIds.includes(c.id) && !allDismissedIds.includes(c.id)
    );

    if (availableComments.length > 0) {
      // Select a random replacement comment
      const randomIndex = Math.floor(Math.random() * availableComments.length);
      const replacementComment = availableComments[randomIndex];
      
      // Replace the dismissed comment with the new one
      setDisplayedComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? replacementComment : comment
        )
      );

      // Show the new comment with animation
      setTimeout(() => {
        setVisibleComments(prev => {
          const newSet = new Set(prev);
          newSet.add(replacementComment.id);
          return newSet;
        });
      }, 100); // Small delay for smooth transition
    }
  };

  const getRankText = (rank: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = rank % 100;
    return rank + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  if (loading) {
    return (
      <div className={`text-center ${className}`}>
        <Spinner animation="border" role="status" size="sm">
          <span className="visually-hidden">Loading comments...</span>
        </Spinner>
        <p className="mt-2 text-muted">Loading fan comments...</p>
      </div>
    );
  }

  if (error || displayedComments.length === 0) {
    return null; // Don't show anything if no comments or error
  }

  return (
    <div className={`random-comments-container ${className}`}>
      <h4 className="mb-3 text-center" style={{ color: '#343a40', fontFamily: 'sans-serif' }}>
        Fan Comments
      </h4>
      <hr style={{ borderColor: '#e0e0e0', borderWidth: '1px', marginBottom: '20px' }} />
      
      <div className="comments-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '15px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {displayedComments.map((comment) => {
          const isVisible = visibleComments.has(comment.id);
          const isDismissed = dismissedComments.has(comment.id);
          
          if (isDismissed) return null;
          
          return (
            <Card
              key={comment.id}
              className="comment-card"
              style={{
                transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.5s ease-in-out',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Card.Body style={{ padding: '15px' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center">
                    <div
                      style={{
                        fontSize: '20px',
                        marginRight: '10px'
                      }}
                    >
                      💬
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#343a40' }}>
                        {comment.user.name}
                      </strong>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        ranked {comment.team.teamName} <span style={{ 
                          fontWeight: 'bold',
                          color: comment.rank <= 3 ? '#FFD700' : comment.rank >= 10 ? '#FF69B4' : '#6c757d'
                        }}>
                          {getRankText(comment.rank)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <img 
                      src={comment.team.teamLogo} 
                      alt={comment.team.teamName}
                      style={{ 
                        width: '30px', 
                        height: '30px', 
                        marginRight: '8px',
                        borderRadius: '6px'
                      }}
                    />
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleDismiss(comment.id)}
                      style={{
                        padding: '2px 6px',
                        fontSize: '12px',
                        border: 'none',
                        color: '#6c757d'
                      }}
                      title="Dismiss comment"
                    >
                      ×
                    </Button>
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.4',
                  color: '#495057',
                  fontStyle: 'italic',
                  marginTop: '8px'
                }}>
                  &ldquo;{comment.comment}&rdquo;
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center mt-3">
        <small className="text-muted" style={{ fontFamily: 'sans-serif' }}>
          Click × to dismiss and refresh comments
        </small>
      </div>
    </div>
  );
};

export default RandomComments;