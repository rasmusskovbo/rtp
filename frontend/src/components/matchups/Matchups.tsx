import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Container, Row, Spinner, Dropdown, Col} from 'react-bootstrap';
import {Matchup, UserVoteDetails} from './IMatchup';
import MatchupLine from '@/components/matchups/MatchupLine';
import MatchupLineModal from "@/components/matchups/MatchupLineModal";
import VoteLockout from "@/components/picks/VoteLockout";
import {toast} from "react-toastify";

const Matchups: React.FC = () => {
    const [matchups, setMatchups] = useState<Matchup[]>([]);
    const [userVoteDetails, setUserVoteDetails] = useState<UserVoteDetails[]>([])
    const [loading, setLoading] = useState(true);
    const [selectedMatchup, setSelectedMatchup] = useState<Matchup | null>(null);
    const [maxWeek, setMaxWeek] = useState<number>(1); // Default to week 1
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null); // Initial value will be set after fetching data



    const handleShowModal = (matchup: Matchup) => {
        setSelectedMatchup(matchup);
    };

    const handleCloseModal = () => {
        setSelectedMatchup(null);
    };

    useEffect(() => {
        const url = `${process.env.API_URL}/api/matchups`;

        axios.get<Matchup[]>(url)
            .then(response => {
                const maxAvailableWeek = response.data[0]?.week || 1;
                setMaxWeek(maxAvailableWeek);
                setSelectedWeek(maxAvailableWeek); // Set the selected week to the highest available week on initial load
                setMatchups(response.data);

                const loggedInUser = localStorage.getItem('loggedInUser');
                if (loggedInUser) {
                    fetchUserVotes(loggedInUser as string, maxAvailableWeek)
                } else {
                    toast.info('Log-in to see personalized vote history', {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }

                setLoading(false);
            })
            .catch(error => {
                console.error('An error occurred while fetching the data:', error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (selectedWeek !== null) { // Only fetch matchups once the selected week is set
            const url = `${process.env.API_URL}/api/matchups`;

            axios.post<Matchup[]>(url, { weekNumber: selectedWeek })
                .then(response => {
                    setMatchups(response.data);
                })
                .catch(error => {
                    console.error('An error occurred while fetching matchups for the selected week:', error);
                });

            const loggedInUser = localStorage.getItem('loggedInUser');
            if (loggedInUser) {
                fetchUserVotes(loggedInUser as string, selectedWeek)
            }
        }
    }, [selectedWeek]);

    const fetchUserVotes = async (username: string, selectedWeek: number) => {
        try {
            const url = `${process.env.API_URL}/api/matchups/votes?username=${username}&week=${selectedWeek}`;

            const response = await axios.get<UserVoteDetails[]>(url);

            setUserVoteDetails(response.data);
        } catch (exc) {
            console.log("Unable to fetch votes.")
        }

    }

    if (loading) {
        return (
            <div className="spinnerContainer">
                <Spinner animation="border" />
            </div>)
    }

    return (
        <Container>
            <Row className="text-center">
                <Col><h3>Matchups</h3></Col>
                <Col>
                    <Dropdown onSelect={(eventKey: string | null) => setSelectedWeek(Number(eventKey))}>
                        <Dropdown.Toggle variant="primary">
                            {selectedWeek ? `Week ${selectedWeek}` : 'Select Week'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {[...Array(maxWeek)].map((_, index) => (
                                <Dropdown.Item key={index} eventKey={`${index + 1}`}>
                                    Week {index + 1}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>
            <Row>

            </Row>
            <Row>
                <VoteLockout/>
            </Row>
            <Row>
                {matchups.map((matchup) => (
                    (matchup.home_team !== null && matchup.away_team !== null) && (
                        <MatchupLine key={matchup.id} matchup={matchup} userVotes={userVoteDetails} onShowModal={() => handleShowModal(matchup)} />
                    )
                ))}
                {selectedMatchup && (
                    <MatchupLineModal matchup={selectedMatchup} showModal={true} handleCloseModal={handleCloseModal} />
                )}
            </Row>
        </Container>
    );
};

export default Matchups;