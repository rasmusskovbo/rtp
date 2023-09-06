import React, {useEffect, useState} from 'react';
import { Modal, Button, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { Matchup } from './IMatchup';
import styles from './matchups.module.css';
import LoginPopup from "@/components/upload/LoginPopup";
import {toast} from "react-toastify";
import axios from "axios";
import {VoteLockoutDetails} from "@/components/picks/VoteLockout";

interface UserVoteRequest {
    userAsString: string,
    matchupId: number,
    rosterId?: number
}

interface UserVoteResponse {
    userHasVoted: boolean;
}

interface MatchupLineModalProps {
    matchup: Matchup;
    showModal: boolean;
    handleCloseModal: () => void;
}

const MatchupLineModal: React.FC<MatchupLineModalProps> = ({ matchup, showModal, handleCloseModal }) => {
    const [isLoginPopupShown, setLoginPopupShown] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [lockoutDetails, setLockoutDetails] = useState<VoteLockoutDetails | null>(null);
    let loggedInUser = localStorage.getItem('loggedInUser');

    const hasUserVoted = async () => {
        try {
            const request: UserVoteRequest = {
                userAsString: loggedInUser as string,
                matchupId: matchup.id,
            };
            const response = await axios.post<UserVoteResponse>(`${process.env.API_URL}/api/matchups/vote/poll`, request);

            if (response.status >= 200 && response.status < 300) {
                setHasVoted(response.data.userHasVoted);
            } else {
                setHasVoted(false);
            }
        } catch (e) {
            console.error("Unable to fetch voting data from API.");
        }
    };

    const fetchLockoutDetails = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/api/matchups/lockout`);
            setLockoutDetails(response.data);
        } catch (error) {
            console.error("Error fetching lockout details:", error);
        }
    };


    useEffect(() => {
        loggedInUser = localStorage.getItem('loggedInUser');
        hasUserVoted();
        fetchLockoutDetails();
    }, []);

    const handleVoteWrapper = (team: 'home' | 'away') => {
        if (loggedInUser) {
            handleVote(team);
        } else {
            toast.info('You must be logged in to vote.', {
                position: toast.POSITION.TOP_RIGHT
            });
            setLoginPopupShown(true);
        }
    };

    const buttonStyle = hasVoted ? { backgroundColor: 'hotpink' } : {};

    const handleVote = async (team: 'home' | 'away') => {
        try {
            setHasVoted(true);

            const rosterVoteId = team === "home" ? matchup.home_team.id : matchup.away_team.id;
            const userVoteRequest: UserVoteRequest = {
                userAsString: loggedInUser as string,
                matchupId: matchup.id,
                rosterId: rosterVoteId,
            };

            const response = await axios.post(`${process.env.API_URL}/api/matchups/vote`, userVoteRequest);

            if (response.status >= 200 && response.status < 300) {
                toast.success("Vote submitted!", {
                    position: toast.POSITION.TOP_RIGHT,
                });
            } else {
                setHasVoted(false);
                toast.error("Something went wrong. Try again later.");
            }
        } catch (e: any) {
            if (e.response && e.response.status === 400) {
                toast.info("Votes are currently locked.")
            } else {
                console.log("User was unable to vote.");
                setHasVoted(false);
                toast.error("Something went wrong. Try again later.");
            }
        }
    };


    const handleLoginSuccess = () => {
        setLoginPopupShown(false);
    };


    return (
        <>
            <LoginPopup
                show={isLoginPopupShown}
                handleShow={() => setLoginPopupShown(true)}
                handleClose={() => setLoginPopupShown(false)}
                handleLoginSuccess={() => handleLoginSuccess()}
            />
            <Modal show={showModal} dialogClassName={styles.wideModal}>
                <Modal.Header closeButton onClick={handleCloseModal}>
                    <Modal.Title>
                        <Modal.Title>
                            <Col>
                                <span>Week {matchup.week}</span>
                                <span className={styles.versusLabel}>{matchup.home_team.team.teamName} VS. {matchup.away_team.team.teamName}</span>
                            </Col>
                        </Modal.Title>
                    </Modal.Title>
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
                                                    <span
                                                        className={`${styles['player-position']} ${styles[`player-position-${player.position}`]}`}>{player.position}</span>
                                                    <span>{player.first_name} {player.last_name}</span>
                                                </ListGroup.Item>
                                            ))}
                                    </ListGroup>
                                    <div className="text-center mt-3">
                                        <Button
                                            variant="success"
                                            onClick={() => handleVoteWrapper("home")}
                                            disabled={lockoutDetails?.isVoteLockedOut}
                                            style={buttonStyle}
                                        >Vote</Button>
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
                                                    <span
                                                        className={`${styles['player-position']} ${styles[`player-position-${player.position}`]}`}>{player.position}</span>
                                                    <span>{player.first_name} {player.last_name}</span>
                                                </ListGroup.Item>
                                            ))}
                                    </ListGroup>
                                    <div className="text-center mt-3">
                                        <Button
                                            variant="success"
                                            onClick={() => handleVoteWrapper('away')}
                                            disabled={lockoutDetails?.isVoteLockedOut}
                                            style={buttonStyle}
                                        >Vote</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    {hasVoted ? <span>You already voted for this matchup</span> : null}
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default MatchupLineModal;
