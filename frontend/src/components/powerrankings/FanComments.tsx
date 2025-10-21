import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Card, Button, Spinner, Form } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '@/auth/AuthProvider';
import HeartIcon from './HeartIcon';

interface Comment {
  id: number;
  comment: string;
  rank: number;
  likeCount: number;
  userLiked: boolean;
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

const FanComments: React.FC<RandomCommentsProps> = ({ className = '' }) => {
  const authContext = useContext(AuthContext);
  const { loggedInUser } = authContext;
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [displayedComments, setDisplayedComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleComments, setVisibleComments] = useState<Set<number>>(new Set());
  const [dismissedComments, setDismissedComments] = useState<Set<number>>(new Set());
  const [likingComments, setLikingComments] = useState<Set<number>>(new Set());
  const [selectedCommenter, setSelectedCommenter] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const isInitialMount = useRef(true);

  const getFilteredComments = useCallback((comments: Comment[]) => {
    let filtered = [...comments];
    
    if (selectedCommenter) {
      filtered = filtered.filter(c => c.user.name === selectedCommenter);
    }
    
    if (selectedTeam) {
      filtered = filtered.filter(c => c.team.teamName === selectedTeam);
    }
    
    return filtered;
  }, [selectedCommenter, selectedTeam]);

  const getUniqueCommenters = useCallback(() => {
    const commenters = new Set(allComments.map(c => c.user.name));
    return Array.from(commenters).sort();
  }, [allComments]);

  const getUniqueTeams = useCallback(() => {
    const teams = new Set(allComments.map(c => c.team.teamName));
    return Array.from(teams).sort();
  }, [allComments]);

  const handleResetFilters = useCallback(() => {
    setSelectedCommenter('');
    setSelectedTeam('');
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = loggedInUser 
          ? `${process.env.API_URL}/api/power-rankings/comments?username=${loggedInUser.name}`
          : `${process.env.API_URL}/api/power-rankings/comments`;
        
        const response = await axios.get(url);
        
        if (response.data?.comments && Array.isArray(response.data.comments)) {
          const fetchedComments = response.data.comments;
          
          // Store all comments for potential replacement
          setAllComments(fetchedComments);
          
          // On initial load, show 6 random comments (no filters applied yet)
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
  }, [loggedInUser]);

  // Apply filters whenever filter selections change
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Only run this effect when filters change
    if (allComments.length > 0) {
      const filteredComments = getFilteredComments(allComments);
      
      // If filters are active, show ALL filtered comments
      // If no filters, show 6 random comments
      const hasActiveFilters = selectedCommenter || selectedTeam;
      let selectedComments: Comment[];
      
      if (hasActiveFilters) {
        // Show all filtered comments
        selectedComments = filteredComments;
      } else {
        // Show 6 random comments
        const shuffled = [...filteredComments].sort(() => 0.5 - Math.random());
        selectedComments = shuffled.slice(0, 6);
      }
      
      // Reset visible and dismissed comments
      setDismissedComments(new Set());
      setVisibleComments(new Set());
      
      setDisplayedComments(selectedComments);
      
      // Show comments one by one with delays
      selectedComments.forEach((comment, index) => {
        setTimeout(() => {
          setVisibleComments(prev => {
            const newSet = new Set(prev);
            newSet.add(comment.id);
            return newSet;
          });
        }, index * 500);
      });
    }
  }, [selectedCommenter, selectedTeam, allComments, getFilteredComments]);

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
    
    // Apply filters first, then filter out displayed and dismissed comments
    const filteredComments = getFilteredComments(allComments);
    const availableComments = filteredComments.filter(c => 
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

  const handleRefreshAll = () => {
    // Clear all dismissed comments and visible comments
    setDismissedComments(new Set());
    setVisibleComments(new Set());
    
    // Apply current filters
    const filteredComments = getFilteredComments(allComments);
    
    // If filters are active, show ALL filtered comments
    // If no filters, show 6 random comments
    const hasActiveFilters = selectedCommenter || selectedTeam;
    let selectedComments: Comment[];
    
    if (hasActiveFilters) {
      // Show all filtered comments (no shuffling needed)
      selectedComments = filteredComments;
    } else {
      // Select 6 new random comments
      const shuffled = [...filteredComments].sort(() => 0.5 - Math.random());
      selectedComments = shuffled.slice(0, 6);
    }
    
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
  };

  const getRankText = (rank: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = rank % 100;
    return rank + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const handleLike = async (commentId: number) => {
    if (!loggedInUser) {
      return; // Don't allow liking if not logged in
    }

    setLikingComments(prev => {
      const newSet = new Set(prev);
      newSet.add(commentId);
      return newSet;
    });

    try {
      const comment = displayedComments.find(c => c.id === commentId);
      if (!comment) return;

      const endpoint = comment.userLiked ? 'unlike' : 'like';
      const response = await axios.post(`${process.env.API_URL}/api/power-rankings/comments/${endpoint}`, {
        commentId,
        username: loggedInUser.name
      });

      if (response.data) {
        // Update the comment in both displayed and all comments
        const updateComment = (comments: Comment[]) => 
          comments.map(c => 
            c.id === commentId 
              ? { ...c, likeCount: response.data.likeCount, userLiked: response.data.userLiked }
              : c
          );

        setDisplayedComments(updateComment);
        setAllComments(updateComment);
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    } finally {
      setLikingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
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
      <style jsx>{`
        .comments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 15px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 10px;
        }
        
        @media (min-width: 900px) {
          .comments-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (max-width: 899px) and (min-width: 600px) {
          .comments-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 599px) {
          .comments-grid {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 0 5px;
          }
        }
        
        @media (max-width: 480px) {
          .comments-grid {
            padding: 0;
          }
        }
        
        .filters-container {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          justify-content: center;
          max-width: 1200px;
          margin: 0 auto 20px auto;
          padding: 0 10px;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 180px;
          flex: 1 1 auto;
          max-width: 250px;
        }
        
        @media (max-width: 768px) {
          .filter-group {
            min-width: 150px;
            max-width: 100%;
          }
        }
        
        @media (max-width: 480px) {
          .filters-container {
            flex-direction: column;
            gap: 10px;
          }
          
          .filter-group {
            width: 100%;
            max-width: 100%;
          }
        }
        
        .filter-label {
          font-size: 12px;
          font-weight: 600;
          color: #6c757d;
          margin-bottom: 2px;
        }
        
        .filter-select {
          padding: 6px 10px;
          font-size: 13px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          background-color: white;
          cursor: pointer;
          width: 100%;
        }
        
        .filter-select:focus {
          outline: none;
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        
        .filter-buttons {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        
        @media (max-width: 480px) {
          .filter-buttons {
            width: 100%;
            justify-content: space-between;
          }
          
          .filter-buttons button {
            flex: 1;
          }
        }
      `}</style>
      <h4 className="mb-3 text-center" style={{ color: '#343a40', fontFamily: 'sans-serif' }}>
        Fan Comments
      </h4>
      <hr style={{ borderColor: '#e0e0e0', borderWidth: '1px', marginBottom: '20px' }} />
      
      {/* Filter Controls */}
      <div className="filters-container">
        <div className="filter-group">
          <label className="filter-label" htmlFor="commenter-filter">Filter by Commenter</label>
          <select
            id="commenter-filter"
            className="filter-select"
            value={selectedCommenter}
            onChange={(e) => setSelectedCommenter(e.target.value)}
          >
            <option value="">All Commenters</option>
            {getUniqueCommenters().map(commenter => (
              <option key={commenter} value={commenter}>{commenter}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label" htmlFor="team-filter">Filter by Rated Team</label>
          <select
            id="team-filter"
            className="filter-select"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="">All Teams</option>
            {getUniqueTeams().map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-buttons">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleResetFilters}
            disabled={!selectedCommenter && !selectedTeam}
            style={{
              fontSize: '13px',
              padding: '6px 16px',
              fontFamily: 'sans-serif',
              whiteSpace: 'nowrap'
            }}
          >
            🔄 Reset Filters
          </Button>
          
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleRefreshAll}
            style={{
              fontSize: '13px',
              padding: '6px 16px',
              fontFamily: 'sans-serif',
              whiteSpace: 'nowrap'
            }}
          >
            🔄 Refresh Comments
          </Button>
        </div>
      </div>
      
      <div className="comments-grid">
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
                overflow: 'hidden',
                minHeight: '120px',
                width: '100%',
                paddingBottom: '40px' // Add space for the heart icon
              }}
            >
              <Card.Body style={{ padding: '12px' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center" style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '18px',
                        marginRight: '8px',
                        flexShrink: 0
                      }}
                    >
                      💬
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong style={{ fontSize: '13px', color: '#343a40', wordBreak: 'break-word' }}>
                        {comment.user.name}
                      </strong>
                      <div style={{ fontSize: '12px', color: '#6c757d', wordBreak: 'break-word' }}>
                        ranked {comment.team.teamName} <span style={{ 
                          fontWeight: 'bold',
                          color: comment.rank <= 3 ? '#FFD700' : comment.rank >= 10 ? '#FF69B4' : '#6c757d'
                        }}>
                          {getRankText(comment.rank)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center" style={{ flexShrink: 0 }}>
                    <img 
                      src={comment.team.teamLogo} 
                      alt={comment.team.teamName}
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        marginRight: '6px',
                        borderRadius: '4px'
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
                        color: '#6c757d',
                        minWidth: '24px',
                        height: '24px'
                      }}
                      title="Dismiss comment"
                    >
                      ×
                    </Button>
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: '13px', 
                  lineHeight: '1.4',
                  color: '#495057',
                  fontStyle: 'italic',
                  marginTop: '8px',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  &ldquo;{comment.comment}&rdquo;
                </div>
                
                {/* Heart icon positioned absolutely at bottom right */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  zIndex: 10
                }}>
                  <HeartIcon
                    isLiked={comment.userLiked}
                    onClick={() => handleLike(comment.id)}
                    size={16}
                    className={likingComments.has(comment.id) ? 'liking' : ''}
                  />
                  {comment.likeCount > 0 && (
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#FF69B4', 
                      marginLeft: '4px',
                      fontWeight: 'bold'
                    }}>
                      {comment.likeCount}
                    </span>
                  )}
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center mt-3">
        <small className="text-muted" style={{ fontFamily: 'sans-serif' }}>
          {(selectedCommenter || selectedTeam) ? (
            <>
              Showing {displayedComments.length} comment{displayedComments.length !== 1 ? 's' : ''} • 
              Filters: {[selectedCommenter, selectedTeam].filter(Boolean).join(', ')}
            </>
          ) : (
            <>Click × to dismiss and see new comments</>
          )}
        </small>
      </div>
    </div>
  );
};

export default FanComments;