import React, { useState, useEffect } from 'react';
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
import CombineResultsTable from "@/components/tables/CombineResultsTable";

type Tab = 'allTimeWinners' | 'allTimeStandings' | 'weeklyHighScores' | 'playerHighScores' | 'yearlyFinishes' | 'combineResults';

const Index = () => {
    const [tab, setTab] = useState<Tab>('allTimeWinners');
    const [loading, setLoading] = useState(true);
    const [statProps, setStatProps] = useState<RtpStatsProps | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            const res = await fetch(`${process.env.API_URL}/api/stats`);
            const data: RtpStatsProps = await res.json();
            setStatProps(data);
            setLoading(false);
        };

        fetchStats();
    }, []);

    if (loading || !statProps) {
        return (
            <div className="spinnerContainer">
                <Spinner animation="border" />
            </div>
        )
    }

    return (
        <Layout>
            <RoadToPinkHead title={"Stats"}/>
            <Header title={"Road To Pink Stats"}/>

            <Container className={`${styles.container} mt-3`}>
                <Row className={`${styles.tab} text-center`}>
                    <Col lg={2} xs={12}>
                        <Button
                            className={`${styles.button} ${tab === 'allTimeWinners' ? styles.active : ''}`}
                            onClick={() => setTab('allTimeWinners')}
                        >
                            All-time Winners
                        </Button>
                    </Col>
                    <Col lg={2} xs={12}>
                        <Button
                            className={`${styles.button} ${tab === 'allTimeStandings' ? styles.active : ''}`}
                            onClick={() => setTab('allTimeStandings')}
                        >
                            All-time Standings
                        </Button>
                    </Col>
                    <Col lg={2} xs={12}>
                        <Button
                            className={`${styles.button} ${tab === 'weeklyHighScores' ? styles.active : ''}`}
                            onClick={() => setTab('weeklyHighScores')}
                        >
                            All-time Weekly High Scores
                        </Button>
                    </Col>
                    <Col lg={2} xs={12}>
                        <Button
                            className={`${styles.button} ${tab === 'playerHighScores' ? styles.active : ''}`}
                            onClick={() => setTab('playerHighScores')}
                        >
                            All-time Player High Scores
                        </Button>
                    </Col>
                    <Col lg={2} xs={12}>
                        <Button
                            className={`${styles.button} ${tab === 'yearlyFinishes' ? styles.active : ''}`}
                            onClick={() => setTab('yearlyFinishes')}
                        >
                            Yearly Finishes & Legacy Index
                        </Button>
                    </Col>
                    <Col lg={2} xs={12}>
                        <Button
                            className={`${styles.button} ${tab === 'combineResults' ? styles.active : ''}`}
                            onClick={() => setTab('combineResults')}
                        >
                            Combine Results
                        </Button>
                    </Col>
                </Row>
                {tab === 'allTimeWinners' && <AllTimeWinnersTable stats={statProps.statProps.allTimeWinners.stats} />}
                {tab === 'allTimeStandings' && <AllTimeStandingsTable stats={statProps.statProps.allTimeStandings.stats} />}
                {tab === 'weeklyHighScores' && <WeeklyHighScoresTable stats={statProps.statProps.weeklyHighScores.stats} />}
                {tab === 'playerHighScores' && <PlayerHighScoresTable stats={statProps.statProps.playerHighScores.stats} />}
                {tab === 'yearlyFinishes' && <YearlyFinishesTable stats={statProps.statProps.yearlyFinishes.stats} />}
                {tab === 'combineResults' && <CombineResultsTable stats={statProps.statProps.combineResults.stats} />}

                <hr className="centered-hr" />
                <Row>
                    <Col>The RTP™ score as seen here and on the teams pages is based on the regular- and postseason stats from Sleeper,
                        going back to, and starting from, the 2020 season, when the league expanded to a 12-team league.
                        <br/><br/>
                        The current system awards points as follows:
                        <br/><br/>
                        Post-season win: 40 pts<br/>
                        Post-season second place: 20 pts<br/>
                        Post-season third place: 10 pts<br/>
                        Playoff appearance: 5 pts<br/>
                        Last place, regular season (Pink finishes): -40 pts<br/>
                        Last place, playoffs: -20 pts<br/>
                        <br/>
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
};

export default Index;