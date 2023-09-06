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
    hasVoted: boolean;
    votedRosterId?: string;
}

interface MatchupLineModalProps {
    matchup: Matchup;
    showModal: boolean;
    handleCloseModal: () => void;
}

const MatchupLineModal: React.FC<MatchupLineModalProps> = ({ matchup, showModal, handleCloseModal }) => {
    const [isLoginPopupShown, setLoginPopupShown] = useState(false);
    const [userVoteDetails, setUserVoteDetails] = useState<UserVoteResponse | null>(null);
    const [lockoutDetails, setLockoutDetails] = useState<VoteLockoutDetails | null>(null);
    const [votedForHomeTeam, setVotedForHomeTeam] = useState(false);
    const [votedForAwayTeam, setVotedForAwayTeam] = useState(false);

    let loggedInUser = localStorage.getItem('loggedInUser');


    const getUserVotingDetails = async () => {
        try {
            const request: UserVoteRequest = {
                userAsString: loggedInUser as string,
                matchupId: matchup.id,
            };
            const response = await axios.post<UserVoteResponse>(`${process.env.API_URL}/api/matchups/vote/poll`, request);

            if (response.status >= 200 && response.status < 300) {
                const votingDetails: UserVoteResponse = response.data

                console.log("User vote bool: " + votingDetails.hasVoted)
                console.log("Roster id: " + votingDetails.votedRosterId)
                setUserVoteDetails(response.data);
                await setVotedForTeam(response.data);
            } else {
                setUserVoteDetails(null);
            }
        } catch (e) {
            console.error("Unable to fetch voting data from API.");
            setUserVoteDetails(null);
        }
    };

    const setVotedForTeam = async (votingDetails: UserVoteResponse) => {
        setVotedForHomeTeam(votingDetails?.votedRosterId == matchup.home_team.id.toString());
        setVotedForAwayTeam(votingDetails?.votedRosterId == matchup.away_team.id.toString());
    }

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
        getUserVotingDetails();
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

    // Conditional styles
    const highlightStyle = { backgroundColor: '#ebf7ed' };

    const handleVote = async (team: 'home' | 'away') => {
        try {
            const rosterVoteId = team === "home" ? matchup.home_team.id : matchup.away_team.id;

            const userVoteDetails: UserVoteResponse = {
                hasVoted: true,
                votedRosterId: rosterVoteId.toString()
            }

            setUserVoteDetails(userVoteDetails);
            setVotedForTeam(userVoteDetails);

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
                setUserVoteDetails(null);
                toast.error("Something went wrong. Try again later.");
            }
        } catch (e: any) {
            if (e.response && e.response.status === 400) {
                toast.info("Votes are currently locked.")
            } else {
                console.log("User was unable to vote.");
                setUserVoteDetails(null);
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
                            <Card style={votedForHomeTeam ? highlightStyle : {}}>
                                <Card.Title className={styles.cardModalTitle}>
                                    <img className={styles.cardImage} src={matchup.home_team.team.teamLogo}/>
                                    <div className={styles.cardTitle}>{matchup.home_team.team.teamName}</div>
                                    <div>{matchup.home_team.settings.wins} - {matchup.home_team.settings.losses}</div>
                                </Card.Title>
                                <Card.Body>
                                    <ListGroup>
                                        {matchup.home_team.starters
                                            .sort((a, b) => {
                                                const order = ['QB', 'RB', 'WR', 'TE', 'DEF'];
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
                                        >Vote</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        {/* Away Team Card */}
                        <Col>
                            <Card style={votedForAwayTeam ? highlightStyle : {}}>
                                <Card.Title className={styles.cardModalTitle}>
                                    <img className={styles.cardImage} src={matchup.away_team.team.teamLogo}/>
                                    <div className={styles.cardTitle}>{matchup.away_team.team.teamName}</div>
                                    <div>{matchup.away_team.settings.wins} - {matchup.away_team.settings.losses}</div>
                                </Card.Title>
                                <Card.Body>
                                    <ListGroup>
                                        {matchup.away_team.starters
                                            .sort((a, b) => {
                                                const order = ['QB', 'RB', 'WR', 'TE', 'DEF'];
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
                                        >Vote</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    {userVoteDetails?.hasVoted ? <span>You already voted for this matchup</span> : null}
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default MatchupLineModal;
