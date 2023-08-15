import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Col, Container, Row, Spinner} from 'react-bootstrap';
import { Matchup } from './IMatchup';
import MatchupLine from '@/components/matchups/MatchupLine';
import styles from './matchups.module.css';
import MatchupLineModal from "@/components/matchups/MatchupLineModal";
import VoteLockout from "@/components/picks/VoteLockout";

const Matchups: React.FC = () => {
    const [matchups, setMatchups] = useState<Matchup[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatchup, setSelectedMatchup] = useState<Matchup | null>(null);

    const handleShowModal = (matchup: Matchup) => {
        setSelectedMatchup(matchup); // Open the modal by setting the selected matchup
    };

    const handleCloseModal = () => {
        setSelectedMatchup(null); // Closing the modal by setting selectedMatchup to null
    };

    useEffect(() => {
        const url = `${process.env.API_URL}/api/matchups`;

        axios.get<Matchup[]>(url)
            .then(response => {
                setMatchups(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('An error occurred while fetching the data:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="spinnerContainer">
                <Spinner animation="border" />
            </div>)
    }

    return (
        <Container>
            <Row className="text-center">
                {
                    matchups[0]
                        ? (<h3>Matchups for week {matchups[0].week}</h3>)
                        : (<h3>Matchups</h3>)
                }
            </Row>
            {matchups.length > 0 ? (
                <>
                    <Row>
                        <VoteLockout/>
                    </Row>
                    <Row>
                        {matchups.map((matchup) => (
                            (matchup.home_team !== null && matchup.away_team !== null) && (
                                <MatchupLine key={matchup.id} matchup={matchup} onShowModal={() => handleShowModal(matchup)} />
                            )
                        ))}
                        {selectedMatchup && (
                            <MatchupLineModal matchup={selectedMatchup} showModal={true} handleCloseModal={handleCloseModal} />
                        )}
                    </Row>
                </>
            ) : (
                <h5 className="text-center">Awaiting weekly matchups from Sleeper...</h5>
            )}
        </Container>
    );
};

export default Matchups;
