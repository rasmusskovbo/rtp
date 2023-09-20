import React from 'react';
import {Card, Col, Row} from 'react-bootstrap';
import {Matchup, UserVoteDetails} from './IMatchup';
import styles from './matchups.module.css';

interface MatchupLineProps {
    matchup: Matchup;
    userVotes: UserVoteDetails[];
    onShowModal: () => void;
}

const MatchupLine: React.FC<MatchupLineProps> = ({ matchup,userVotes, onShowModal }) => {
    const isHomeTeamWinner = matchup.winner && matchup.home_team.id === matchup.winner.id;
    const isAwayTeamWinner = matchup.winner && matchup.away_team.id === matchup.winner.id;

    const userVoteForMatchup = userVotes.find(vote => vote.matchup.id === matchup.id);
    const userVotedForHomeTeam = userVoteForMatchup && userVoteForMatchup.roster.id === matchup.home_team.id;
    const userVotedForAwayTeam = userVoteForMatchup && userVoteForMatchup.roster.id === matchup.away_team.id;

    return (
        <div onClick={onShowModal} className={styles.matchupLine}>
            <Row className="mb-3 flex-nowrap">
                <Col>
                    <Card className={styles.cardWrapper}>
                        <Card.Body className={`${styles.cardContent} 
                       ${isHomeTeamWinner ? styles.greenBorder : ''} 
                       ${userVotedForHomeTeam ? styles.userVote : ''}`}>
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
                                    <Row className={styles.centeredRow}>
                                        {(matchup.voteTotals.homeTeam !== undefined && matchup.voteTotals.awayTeam !== undefined && (matchup.voteTotals.homeTeam + matchup.voteTotals.awayTeam) !== 0)
                                            ? Math.round((matchup.voteTotals.homeTeam / (matchup.voteTotals.homeTeam + matchup.voteTotals.awayTeam)) * 100) : 0}%
                                    </Row>
                                </Col>
                            </Card.Title>
                        </Card.Body>
                    </Card>
                </Col>
                <Col className={styles.matchupVersusLabel}>VS</Col>
                <Col>
                    <Card className={`${styles.cardWrapper} ${styles.awayTeam}`}>
                        <Card.Body className={`${styles.cardContent} 
                       ${isAwayTeamWinner ? styles.greenBorder : ''} 
                       ${userVotedForAwayTeam ? styles.userVote : ''}`}>
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
                                    <Row className={styles.centeredRow}>
                                        {(matchup.voteTotals.homeTeam !== undefined && matchup.voteTotals.awayTeam !== undefined && (matchup.voteTotals.homeTeam + matchup.voteTotals.awayTeam) !== 0)
                                            ? Math.round((matchup.voteTotals.awayTeam / (matchup.voteTotals.awayTeam + matchup.voteTotals.homeTeam)) * 100) : 0}%
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
