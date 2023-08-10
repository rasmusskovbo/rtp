// Matchups.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Container, Spinner} from 'react-bootstrap';
import { Matchup } from './IMatchup';
import MatchupLine from '@/components/matchups/MatchupLine';
import styles from './matchups.module.css';
import MatchupLineModal from "@/components/matchups/MatchupLineModal";

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
            {matchups.map((matchup) => (
                (matchup.home_team !== null && matchup.away_team !== null) && (
                    <MatchupLine key={matchup.id} matchup={matchup} onShowModal={() => handleShowModal(matchup)} />
                )
            ))}
            {selectedMatchup && (
                <MatchupLineModal matchup={selectedMatchup} showModal={true} handleCloseModal={handleCloseModal} />
            )}
        </Container>
    );
};

export default Matchups;
