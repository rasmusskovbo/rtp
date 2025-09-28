import React from 'react';
import { TrophyData } from './RtpStatsTypes';
import { Card, Row, Col, Badge } from 'react-bootstrap';

interface TopTrophiesProps {
  trophies: TrophyData[];
}

const TopTrophies: React.FC<TopTrophiesProps> = ({ trophies }) => {
  // Filter for the specific trophies we want to show at the top
  const topTrophyIds = ['biggest-homie', 'realist', 'biggest-drop', 'biggest-rise', 'consensus-builder'];
  const topTrophies = trophies.filter(trophy => topTrophyIds.includes(trophy.id));

  if (topTrophies.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h4 className="text-center mb-4">
        <span className="me-2">🏆</span>
        Top Trophies
        <span className="ms-2">🏆</span>
      </h4>
      
      <Row className="justify-content-center">
        {topTrophies.map((trophy) => (
          <Col key={trophy.id} md={6} lg={2} xl={2} className="mb-3">
            <Card 
              className={`h-100 ${
                trophy.winner 
                  ? 'border-success shadow-sm' 
                  : 'border-secondary'
              }`}
              style={{
                opacity: trophy.winner ? 1 : 0.6,
                transition: 'all 0.3s ease'
              }}
            >
              <Card.Header className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <span className="me-2" style={{ fontSize: '1.5rem' }}>
                    {trophy.icon}
                  </span>
                  <h6 className="mb-0">{trophy.title}</h6>
                </div>
              </Card.Header>
              
              <Card.Body className="d-flex flex-column">
                <p className="text-muted small mb-3">
                  {trophy.description}
                </p>
                
                {trophy.winner ? (
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="text-success">
                        {trophy.winner.username}
                      </strong>
                      <Badge bg="primary" className="fs-6">
                        {trophy.winner.value}
                      </Badge>
                    </div>
                    <small className="text-muted d-block mb-1">
                      {trophy.winner.teamName}
                    </small>
                    <small className="text-info">
                      {trophy.winner.description}
                    </small>
                  </div>
                ) : (
                  <div className="mt-auto text-center">
                    <small className="text-muted">
                      No data available
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      <style jsx>{`
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
        }
        
        .card {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default TopTrophies;