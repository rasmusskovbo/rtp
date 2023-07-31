import React, { useState } from 'react';
import { Spinner, Button, Container, Row, Col } from 'react-bootstrap';
import Layout from "@/components/global/Layout";
import AllTimeWinnersTable from "@/components/tables/AllTimeWinnersTable";
import {RtpStatsProps} from "@/components/tables/RtpStatsTypes";
import AllTimeStandingsTable from "@/components/tables/AllTimeStandingsTable";
import WeeklyHighScoresTable from "@/components/tables/WeeklyHighScoresTable";
import PlayerHighScoresTable from "@/components/tables/PlayerHighScoresTable";
import YearlyFinishesTable from "@/components/tables/YearlyFinishesTable";
import RoadToPinkHead from "@/components/global/RoadToPinkHead";
import styles from './index.module.css';
import Header from "@/components/global/Header";

type Tab = 'allTimeWinners' | 'allTimeStandings' | 'weeklyHighScores' | 'playerHighScores' | 'yearlyFinishes';

const Index = ({ statProps }: RtpStatsProps) => {
    const [tab, setTab] = useState<Tab>('allTimeWinners');
    const [loading, setLoading] = useState(false);

    if (loading) {
        return (
            <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
            </Spinner>
        )
    }

    return (
        <Layout>
            <RoadToPinkHead title={"Stats"}/>
            <Header title={"Road To Pink Stats"} subtitle={"Where Peter comes to weep"}/>

            <Container className={`${styles.container} mt-3`}>
                <Row className={`${styles.tab} text-center`}>
                    <Col lg={2} xs={6}>
                        <Button
                            className={`${styles.button} ${tab === 'allTimeWinners' ? styles.active : ''}`}
                            onClick={() => setTab('allTimeWinners')}
                        >
                            All-time Winners
                        </Button>
                    </Col>
                    <Col lg={2} xs={6}>
                        <Button
                            className={`${styles.button} ${tab === 'allTimeStandings' ? styles.active : ''}`}
                            onClick={() => setTab('allTimeStandings')}
                        >
                            All-time Standings
                        </Button>
                    </Col>
                    <Col lg={2} xs={6}>
                        <Button
                            className={`${styles.button} ${tab === 'weeklyHighScores' ? styles.active : ''}`}
                            onClick={() => setTab('weeklyHighScores')}
                        >
                            All-time Weekly High Scores
                        </Button>
                    </Col>
                    <Col lg={2} xs={6}>
                        <Button
                            className={`${styles.button} ${tab === 'playerHighScores' ? styles.active : ''}`}
                            onClick={() => setTab('playerHighScores')}
                        >
                            All-time Player High Scores
                        </Button>
                    </Col>
                    <Col lg={2} xs={6}>
                        <Button
                            className={`${styles.button} ${tab === 'yearlyFinishes' ? styles.active : ''}`}
                            onClick={() => setTab('yearlyFinishes')}
                        >
                            Yearly Finishes & Legacy Index
                        </Button>
                    </Col>
                </Row>

                {tab === 'allTimeWinners' && <AllTimeWinnersTable stats={statProps.allTimeWinners.stats} />}
                {tab === 'allTimeStandings' && <AllTimeStandingsTable stats={statProps.allTimeStandings.stats} />}
                {tab === 'weeklyHighScores' && <WeeklyHighScoresTable stats={statProps.weeklyHighScores.stats} />}
                {tab === 'playerHighScores' && <PlayerHighScoresTable stats={statProps.playerHighScores.stats} />}
                {tab === 'yearlyFinishes' && <YearlyFinishesTable stats={statProps.yearlyFinishes.stats} />}
            </Container>
        </Layout>
    );
};

export default Index;

export async function getServerSideProps() {
    const res = await fetch('http://localhost:4001/api/stats');

    const data = await res.json();
    const statProps = data.statProps;

    return { props: { statProps } };
}
