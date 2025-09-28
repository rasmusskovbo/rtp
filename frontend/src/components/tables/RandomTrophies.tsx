import React from 'react';
import { TrophyData } from './RtpStatsTypes';
import { Card, Row, Col, Badge } from 'react-bootstrap';

interface RandomTrophiesProps {
  trophies: TrophyData[];
}

const RandomTrophies: React.FC<RandomTrophiesProps> = ({ trophies }) => {
  // Filter trophies that have winners and randomly select 4
  const trophiesWithWinners = trophies.filter(trophy => trophy.winner);
  
  // Shuffle array and take first 4
  const shuffledTrophies = [...trophiesWithWinners].sort(() => Math.random() - 0.5);
  const randomTrophies = shuffledTrophies.slice(0, 4);

  if (randomTrophies.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 mb-4">
      <h4 className="text-center mb-3" style={{ color: '#343a40', fontFamily: 'sans-serif' }}>
        <span className="me-2">🎯</span>
        Featured Trophies
        <span className="ms-2">🎯</span>
      </h4>
      
      <Row className="justify-content-center">
        {randomTrophies.map((trophy) => (
          <Col key={trophy.id} xs={12} sm={6} md={3} className="mb-3">
            <Card 
              className="h-100 border-warning shadow-sm"
              style={{
                transition: 'all 0.3s ease',
                background: 'linear-gradient(135deg, #fff9e6 0%, #ffffff 100%)'
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
                      <Badge bg="warning" className="fs-6">
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
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15) !important;
        }
        
        .card {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default RandomTrophies;