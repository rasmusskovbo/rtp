import React from 'react';
import { Modal, Button, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { Matchup } from './IMatchup';
import styles from './matchups.module.css';

interface MatchupLineModalProps {
    matchup: Matchup;
    showModal: boolean;
    handleCloseModal: () => void;
}

const MatchupLineModal: React.FC<MatchupLineModalProps> = ({ matchup, showModal, handleCloseModal }) => {
    const handleVote = (team: 'home' | 'away') => {
        // Handle the voting logic here. You could call an API, update the component's state, etc.

        // vote should send matchup ID, team OR roster ID as well as ID on who sent the vote
        console.log(`Vote for ${team} team`);
    };


    return (
        <Modal show={showModal} onClick={handleCloseModal} dialogClassName={styles.wideModal}>
            <Modal.Header closeButton>
                <Modal.Title>Extended Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    {/* Home Team Card */}
                    <Col>
                        <Card>
                            <Card.Title className={styles.cardModalTitle}>
                                <img className={styles.cardImage} src={matchup.home_team.team.teamLogo}/>
                                <div className={styles.cardTitle}>{matchup.home_team.team.teamName}</div>
                                <div>{matchup.home_team.settings.wins} - {matchup.home_team.settings.losses}</div>
                            </Card.Title>
                            <Card.Body>
                                <ListGroup>
                                    {matchup.home_team.starters
                                        .sort((a, b) => {
                                            const order = ['QB', 'RB', 'WR', 'TE'];
                                            return order.indexOf(a.position) - order.indexOf(b.position);
                                        })
                                        .map((player, index) => (
                                            <ListGroup.Item key={index} className={styles['player-item']}>
                                                <span className={`${styles['player-position']} ${styles[`player-position-${player.position}`]}`}>{player.position}</span>
                                                <span>{player.first_name} {player.last_name}</span>
                                            </ListGroup.Item>
                                        ))}
                                </ListGroup>
                                <div className="text-center mt-3">
                                    <Button variant="success" onClick={() => handleVote('home')}>Vote</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Away Team Card */}
                    <Col>
                        <Card>
                            <Card.Title className={styles.cardModalTitle}>
                                <img className={styles.cardImage} src={matchup.away_team.team.teamLogo}/>
                                <div className={styles.cardTitle}>{matchup.away_team.team.teamName}</div>
                                <div>{matchup.away_team.settings.wins} - {matchup.away_team.settings.losses}</div>
                            </Card.Title>
                            <Card.Body>
                                <ListGroup>
                                    {matchup.away_team.starters
                                        .sort((a, b) => {
                                            const order = ['QB', 'RB', 'WR', 'TE'];
                                            return order.indexOf(a.position) - order.indexOf(b.position);
                                        })
                                        .map((player, index) => (
                                            <ListGroup.Item key={index} className={styles['player-item']}>
                                                <span className={`${styles['player-position']} ${styles[`player-position-${player.position}`]}`}>{player.position}</span>
                                                <span>{player.first_name} {player.last_name}</span>
                                            </ListGroup.Item>
                                        ))}
                                </ListGroup>
                                <div className="text-center mt-3">
                                    <Button variant="success" onClick={() => handleVote('away')}>Vote</Button>
                                </div>

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default MatchupLineModal;
