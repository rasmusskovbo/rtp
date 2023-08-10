import React from 'react';
import {Card, Col, Row} from 'react-bootstrap';
import { Matchup } from './IMatchup';
import styles from './matchups.module.css';

interface MatchupLineProps {
    matchup: Matchup;
    onShowModal: () => void; // This will be called when the line is clicked
}

const MatchupLine: React.FC<MatchupLineProps> = ({ matchup, onShowModal }) => {
    return (
        <div onClick={onShowModal} className={styles.matchupLine}>
            <Row className="mb-3">
                <Col>
                    <Card>
                        <Card.Body className={styles.cardContent}>
                            <Card.Img
                                className={styles.cardImage}
                                variant="top"
                                src={matchup.home_team.team.teamLogo}
                            />
                            <Card.Title className={styles.cardTitle}>
                                {matchup.home_team.team.teamName}
                            </Card.Title>
                            <Card.Title className={styles.ownerName}>
                                <Col>
                                    <Row className={styles.centeredRow}>
                                        {matchup.home_team.settings.wins} - {matchup.home_team.settings.losses}
                                    </Row>
                                </Col>
                            </Card.Title>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className={styles.awayTeam}>
                        <Card.Body className={styles.cardContent}>
                            <Card.Img
                                className={`${styles.cardImage} ${styles.awayTeam}`}
                                variant="top"
                                src={matchup.away_team.team.teamLogo}
                            />
                            <Card.Title className={`${styles.cardTitle} ${styles.awayTeam}`}>
                                {matchup.away_team.team.teamName}
                            </Card.Title>
                            <Card.Title className={`${styles.ownerName} ${styles.awayTeam}`}>
                                <Col>
                                    <Row className={styles.centeredRow}>
                                        {matchup.away_team.settings.wins} - {matchup.away_team.settings.losses}
                                    </Row>
                                </Col>
                            </Card.Title>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default MatchupLine;
