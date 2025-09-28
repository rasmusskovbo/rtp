import React, { useState, useEffect, useContext } from 'react';
import { Card, Spinner } from 'react-bootstrap';
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

interface TopCommentsProps {
  className?: string;
}

const TopComments: React.FC<TopCommentsProps> = ({ className = '' }) => {
  const authContext = useContext(AuthContext);
  const { loggedInUser } = authContext;
  const [topComments, setTopComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likingComments, setLikingComments] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchTopComments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = loggedInUser 
          ? `${process.env.API_URL}/api/power-rankings/top-comments?username=${loggedInUser.name}`
          : `${process.env.API_URL}/api/power-rankings/top-comments`;
        
        const response = await axios.get(url);
        
        if (response.data?.topComments && Array.isArray(response.data.topComments)) {
          setTopComments(response.data.topComments);
        } else {
          setError('No top comments available');
        }
      } catch (err) {
        console.error('Error fetching top comments:', err);
        setError('Failed to load top comments');
      } finally {
        setLoading(false);
      }
    };

    fetchTopComments();
  }, [loggedInUser]);

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
      const comment = topComments.find(c => c.id === commentId);
      if (!comment) return;

      const endpoint = comment.userLiked ? 'unlike' : 'like';
      const response = await axios.post(`${process.env.API_URL}/api/power-rankings/comments/${endpoint}`, {
        commentId,
        username: loggedInUser.name
      });

      if (response.data) {
        // Update the comment
        setTopComments(prev => 
          prev.map(c => 
            c.id === commentId 
              ? { ...c, likeCount: response.data.likeCount, userLiked: response.data.userLiked }
              : c
          )
        );
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
          <span className="visually-hidden">Loading top comments...</span>
        </Spinner>
        <p className="mt-2 text-muted">Loading top comments...</p>
      </div>
    );
  }

  if (error || topComments.length === 0) {
    return null; // Don't show anything if no comments or error
  }

  return (
    <div className={`top-comments-container ${className}`}>
      <style jsx>{`
        .top-comments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 10px;
        }
        
        @media (min-width: 900px) {
          .top-comments-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (max-width: 899px) and (min-width: 600px) {
          .top-comments-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 599px) {
          .top-comments-grid {
            grid-template-columns: 1fr;
            gap: 15px;
            padding: 0 5px;
          }
        }
        
        @media (max-width: 480px) {
          .top-comments-grid {
            padding: 0;
          }
        }
        
        .top-comment-card {
          border: 2px solid #FFD700;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
          background: linear-gradient(135deg, #fff 0%, #fff9e6 100%);
          position: relative;
          overflow: hidden;
          min-height: 140px;
          padding-bottom: 50px;
        }
        
        .rank-badge {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: #FFD700;
          color: #000;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
        }
      `}</style>
      
      <h4 className="mb-3 text-center" style={{ color: '#343a40', fontFamily: 'sans-serif' }}>
        🏆 Top Comments This Week
      </h4>
      <hr style={{ borderColor: '#FFD700', borderWidth: '2px', marginBottom: '20px' }} />
      
      <div className="top-comments-grid">
        {topComments.map((comment, index) => (
          <Card
            key={comment.id}
            className="top-comment-card"
            style={{
              border: '2px solid #FFD700',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)',
              background: 'linear-gradient(135deg, #fff 0%, #fff9e6 100%)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '140px',
              paddingBottom: '50px'
            }}
          >
            <div className="rank-badge" style={{
              position: 'absolute',
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#FFD700',
              color: '#000',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: 'bold',
              fontSize: '12px',
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
            }}>
              #{index + 1}
            </div>
            
            <Card.Body style={{ padding: '20px 12px 12px 12px' }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center" style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '18px',
                      marginRight: '8px',
                      flexShrink: 0
                    }}
                  >
                    🏆
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
                      borderRadius: '4px'
                    }}
                  />
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
                <span style={{ 
                  fontSize: '12px', 
                  color: '#FF69B4', 
                  marginLeft: '4px',
                  fontWeight: 'bold'
                }}>
                  {comment.likeCount}
                </span>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-3">
        <small className="text-muted" style={{ fontFamily: 'sans-serif' }}>
          Most liked comments from this week&apos;s power rankings
        </small>
      </div>
    </div>
  );
};

export default TopComments;