import React from 'react';
import { TrophyData, TrophiesProps } from './RtpStatsTypes';
import { Card, Row, Col, Badge } from 'react-bootstrap';

const PowerRankingTrophies: React.FC<TrophiesProps> = ({ trophies }) => {
    // Group trophies by category
    const groupedTrophies = trophies.reduce((acc, trophy) => {
        if (!acc[trophy.category]) {
            acc[trophy.category] = [];
        }
        acc[trophy.category].push(trophy);
        return acc;
    }, {} as Record<string, TrophyData[]>);

    const categoryColors = {
        'Bias & Self-Rating': 'primary',
        'Volatility & Movement': 'success',
        'Ranking Behavior': 'warning'
    } as const;

    return (
        <div className="mt-5">
            <h3 className="text-center mb-4">
                <span className="me-2">🏆</span>
                Power Rankings Trophies
                <span className="ms-2">🏆</span>
            </h3>
            
            {Object.entries(groupedTrophies).map(([category, categoryTrophies]) => (
                <div key={category} className="mb-4">
                    <h4 className={`text-${categoryColors[category as keyof typeof categoryColors] || 'secondary'} mb-3`}>
                        {category}
                    </h4>
                    
                    <Row>
                        {categoryTrophies.map((trophy) => (
                            <Col key={trophy.id} md={6} lg={4} className="mb-3">
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
                                        {trophy.winner && (
                                            <Badge bg="success" className="pulse">
                                                Winner!
                                            </Badge>
                                        )}
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
                </div>
            ))}
            
            <style jsx>{`
                .pulse {
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                
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

export default PowerRankingTrophies;
